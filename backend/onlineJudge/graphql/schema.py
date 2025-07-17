from typing import List, Optional
import json
import base64
import zipfile
import io
import os
from django.db.models import Q, Count
from django.db import models
import time
from django.core.cache import cache
from django.http import HttpRequest
from strawberry.types import Info
from taggit.models import Tag
import requests

import strawberry
from strawberry import auto
import strawberry_django
from strawberry.file_uploads import Upload

# For authentication
from django.contrib.auth import get_user_model, authenticate
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from django.conf import settings
import jwt as pyjwt
from datetime import datetime, timedelta

# For mailing and password reset
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

# Import your models
from onlineJudge.models import Problem, TestCase

#--------------------------PROBLEM--------------------------

@strawberry_django.type(Problem)
class ProblemType:
    id: auto
    title: auto
    description: auto
    time_limit: auto
    memory_limit: auto
    difficulty: auto

    @strawberry.field
    def tags(self) -> list[str]:
        return [tag.name for tag in self.tags.all()]

@strawberry.type
class PageInfo:
    has_next_page: bool
    has_previous_page: bool
    start_cursor: Optional[str] = None
    end_cursor: Optional[str] = None

@strawberry.type
class ProblemEdge:
    node: ProblemType
    cursor: str

@strawberry.type
class ProblemConnection:
    edges: List[ProblemEdge]
    page_info: PageInfo
    total_count: int

# Error types
@strawberry.type
class ProblemNotFoundError:
    message: str = "Problem not found"

@strawberry.type
class ValidationError:
    message: str
    field: Optional[str] = None

# Union types for better error handling
ProblemResult = strawberry.union("ProblemResult", [ProblemType, ProblemNotFoundError])

def encode_cursor(problem_id: int) -> str:
    return base64.b64encode(f"problem:{problem_id}".encode()).decode()

def decode_cursor(cursor: str) -> Optional[int]:
    try:
        decoded = base64.b64decode(cursor.encode()).decode()
        if decoded.startswith("problem:"):
            return int(decoded.split(":")[1])
    except (ValueError, IndexError):
        pass
    return None

@strawberry.type
class Query:
    @strawberry.field
    def problems(self, first: Optional[int] = 10, after: Optional[str] = None, tags: Optional[List[str]] = None, difficulty: Optional[str] = None, search: Optional[str] = None) -> ProblemConnection:
        queryset = Problem.objects.all()
        if tags: queryset = queryset.filter(tags__name__in=tags).distinct()
        if difficulty: queryset = queryset.filter(difficulty=difficulty)
        if search: queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        total_count = queryset.count()
        if after:
            cursor_id = decode_cursor(after)
            if cursor_id: queryset = queryset.filter(id__gt=cursor_id)
        queryset = queryset.order_by('id')
        limit = min(first or 10, 100)
        problems = list(queryset[:limit + 1])
        has_next_page = len(problems) > limit
        if has_next_page: problems = problems[:-1]
        edges = [ProblemEdge(node=problem, cursor=encode_cursor(problem.id)) for problem in problems]
        page_info = PageInfo(has_next_page=has_next_page, has_previous_page=after is not None, start_cursor=edges[0].cursor if edges else None, end_cursor=edges[-1].cursor if edges else None)
        return ProblemConnection(edges=edges, page_info=page_info, total_count=total_count)

    @strawberry.field
    def problem(self, id: strawberry.ID) -> ProblemResult:
        try: return Problem.objects.get(id=id)
        except Problem.DoesNotExist: return ProblemNotFoundError()

    @strawberry.field
    def all_tags(self) -> List[str]:
        used_tags = Tag.objects.filter(taggit_taggeditem_items__content_type__model='problem').distinct().values_list('name', flat=True)
        return sorted(list(used_tags))

    @strawberry.field
    def suggest_tags(self, info: Info, search: str) -> List[str]:
        request: HttpRequest = info.context["request"]
        ip = request.META.get("REMOTE_ADDR", "unknown")
        throttle_key = f"throttle_suggest:{ip}"
        last_time = cache.get(throttle_key)
        if last_time and time.time() - last_time < 0.5: raise Exception("Too many requests.")
        cache.set(throttle_key, time.time(), timeout=1)
        cache_key = f"suggest_tags:{search.lower()}"
        cached_result = cache.get(cache_key)
        if cached_result is not None: return cached_result
        tags = list(Tag.objects.filter(name__icontains=search).order_by("name").values_list("name", flat=True)[:10])
        cache.set(cache_key, tags, timeout=60)
        return tags

#-------------------------- AUTHENTICATION & OTHER TYPES --------------------------
User = get_user_model()
@strawberry.type
class UserType:
    id: strawberry.ID; email: str; username: str; first_name: str = ""; last_name: str = ""
@strawberry.type
class AuthPayload:
    token: str; user: UserType
@strawberry.type
class MessageResponse:
    success: bool; message: str
@strawberry.type
class AdminLoginResponse:
    token: str; is_staff: bool
@strawberry.input
class RunCodeInput:
    problem_id: strawberry.ID; code: str; language: str; test_type: str = "SAMPLE" # This is kept for consistency
@strawberry.type
class TestResult:
    test_case: str; expected: str; actual: str; passed: bool; execution_time: Optional[float] = None
@strawberry.type
class RunCodeResult:
    success: bool; output: str; test_results: List[TestResult]; total_execution_time: float; memory_usage: Optional[int] = None
@strawberry.type
class RunCodeError:
    error: str; error_type: str; line_number: Optional[int] = None
RunCodeResponse = strawberry.union("RunCodeResponse", [RunCodeResult, RunCodeError])

def get_google_client_id():
    try:
        base_dir = settings.BASE_DIR.parent
        client_secret_path = base_dir / 'client_secret.json'
        with open(client_secret_path, 'r') as f:
            return json.load(f)['web']['client_id']
    except Exception as e:
        raise Exception(f"Could not read Google client ID: {str(e)}")

#-------------------------- MUTATIONS --------------------------
@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_problem(
        self, info: Info, title: str, description: str, time_limit: str, memory_limit: str,
        difficulty: str, tags: List[str], testcase_file: Upload
    ) -> ProblemType:
        if not info.context.request.user.is_staff:
            raise Exception("You are not authorized to perform this action.")

        problem = Problem.objects.create(
            title=title, description=description, time_limit=time_limit,
            memory_limit=memory_limit, difficulty=difficulty,
        )
        problem.tags.add(*tags)

        if testcase_file.name.lower().endswith('.json'):
            try:
                content = testcase_file.read().decode('utf-8')
                test_data = json.loads(content)
                if not isinstance(test_data, list):
                    raise TypeError("JSON content must be a list.")

                test_cases_to_create = []
                for test_case_obj in test_data:
                    if 'input' in test_case_obj and 'output' in test_case_obj:
                        test_cases_to_create.append(
                            TestCase(
                                problem=problem,
                                input_data=str(test_case_obj['input']),
                                expected_output=str(test_case_obj['output']),
                                is_sample=test_case_obj.get('is_sample', False)
                            )
                        )
                TestCase.objects.bulk_create(test_cases_to_create)
            except Exception as e:
                problem.delete()
                raise Exception(f"Failed to process JSON file: {str(e)}")
        else:
            problem.delete()
            raise Exception("Invalid file type. Please upload a .json file for test cases.")
        return problem

    @strawberry.mutation
    def google_auth(self, token: str) -> AuthPayload:
        client_id = get_google_client_id()
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        email, first_name, last_name = idinfo['email'], idinfo.get('given_name', ''), idinfo.get('family_name', '')
        user, _ = User.objects.get_or_create(email=email, defaults={'username': email, 'first_name': first_name, 'last_name': last_name})
        payload = {'user_id': user.id, 'email': user.email, 'exp': datetime.utcnow() + timedelta(days=7)}
        jwt_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return AuthPayload(token=jwt_token, user=user)

    @strawberry.mutation
    def sign_in(self, email: str, password: str) -> AuthPayload:
        user = User.objects.get(email=email) if '@' in email else User.objects.get(username=email)
        authenticated_user = authenticate(username=user.username, password=password)
        if not authenticated_user: raise Exception("Invalid credentials")
        payload = {'user_id': authenticated_user.id, 'email': authenticated_user.email, 'exp': datetime.utcnow() + timedelta(days=7)}
        jwt_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return AuthPayload(token=jwt_token, user=authenticated_user)

    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> AuthPayload:
        if User.objects.filter(email=email).exists(): raise Exception("User with this email already exists")
        user = User.objects.create_user(username=username, email=email, password=password)
        payload = {'user_id': user.id, 'email': user.email, 'exp': datetime.utcnow() + timedelta(days=7)}
        jwt_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return AuthPayload(token=jwt_token, user=user)

    @strawberry.mutation
    def forgot_password(self, email: str) -> MessageResponse:
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"
            send_mail( "Password Reset", f"Click to reset: {reset_url}", settings.EMAIL_HOST_USER, [email], fail_silently=False)
            return MessageResponse(success=True, message="Password reset email sent.")
        except User.DoesNotExist: return MessageResponse(success=True, message="If an account exists, an email has been sent.")
        except Exception as e: return MessageResponse(success=False, message=f"Failed to send email: {str(e)}")

    @strawberry.mutation
    def reset_password(self, uid: str, token: str, password: str) -> MessageResponse:
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            if not default_token_generator.check_token(user, token): return MessageResponse(success=False, message="Invalid token")
            user.set_password(password); user.save()
            return MessageResponse(success=True, message="Password reset successfully")
        except: return MessageResponse(success=False, message="Invalid link")
    
    @strawberry.mutation
    def admin_login(self, username: str, password: str, info: Info) -> AdminLoginResponse:
        user = authenticate(username=username, password=password)
        if user and user.is_staff: return AdminLoginResponse(token="dummy-admin-token", is_staff=True)
        raise Exception("Invalid credentials or not authorized")

    @strawberry.mutation
    def run_code(self, input: RunCodeInput) -> RunCodeResponse:
        try:
            problem = Problem.objects.get(id=input.problem_id)
            # "Run Code" button only uses test cases marked as "sample"
            sample_test_cases = problem.test_cases.filter(is_sample=True)
            if not sample_test_cases.exists():
                return RunCodeError(error="No sample test cases found for this problem.", error_type="VALIDATION")

            test_results = []
            total_execution_time = 0.0
            overall_memory_usage = 0
            all_passed = True

            for test_case in sample_test_cases:
                payload = {
                    "language": input.language.lower(),
                    "code": input.code,
                    "input": test_case.input_data,
                }
                
                try:
                    # In a Docker environment, the backend will call the compiler via its service name
                    # e.g., http://compiler:8080. For local dev, COMPILER_URL might be http://localhost:8080
                    response = requests.post(f"{settings.COMPILER_URL}/run", json=payload, timeout=10)
                    response.raise_for_status()
                    result = response.json()
                except requests.exceptions.Timeout:
                    return RunCodeError(error="Compiler service timed out.", error_type="COMPILER_SERVICE")
                except requests.exceptions.RequestException as e:
                    return RunCodeError(error=f"Could not connect to compiler service: {e}", error_type="COMPILER_SERVICE")

                # If the compiler itself reports an error, stop and return that error.
                if result.get("status") == "fail" or "error_message" in result:
                    return RunCodeError(error=result.get("error_message", "Execution failed"), error_type="RUNTIME")

                actual_output = result.get("output", "").strip()
                passed = actual_output == test_case.expected_output.strip()
                if not passed:
                    all_passed = False
                
                execution_time = result.get("execution_time", 0)
                total_execution_time += execution_time
                overall_memory_usage = max(overall_memory_usage, result.get("memory_usage", 0))

                test_results.append(TestResult(
                    test_case=test_case.input_data,
                    expected=test_case.expected_output.strip(),
                    actual=actual_output,
                    passed=passed,
                    execution_time=execution_time,
                ))

            # The overall output can be a concatenation or just the first result's output
            final_output = test_results[0].actual if test_results else ""

            return RunCodeResult(
                success=all_passed,
                output=final_output,
                test_results=test_results,
                total_execution_time=total_execution_time,
                memory_usage=overall_memory_usage,
            )
        except Problem.DoesNotExist:
            return RunCodeError(error="Problem not found", error_type="VALIDATION")
        except Exception as e:
            return RunCodeError(error=f"An unexpected error occurred: {str(e)}", error_type="INTERNAL")


schema = strawberry.Schema(query=Query, mutation=Mutation)