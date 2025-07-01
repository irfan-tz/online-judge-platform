from typing import List, Optional
import json
import os

import strawberry
from strawberry import auto
import strawberry_django

# For authentication
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login
from google.auth.transport import requests
from google.oauth2 import id_token
from django.conf import settings
import jwt as pyjwt
from datetime import datetime, timedelta

# For mailing and password reset
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.urls import reverse

from onlineJudge.models import Problem

@strawberry_django.type(Problem)
class ProblemType:
    id: auto
    title: auto
    description: auto
    time_limit: auto
    memory_limit: auto

@strawberry.type
class Query:
    problems: List[ProblemType] = strawberry_django.field()

User = get_user_model()

@strawberry.type
class UserType:
    id: strawberry.ID
    email: str
    username: str
    first_name: str = ""
    last_name: str = ""

@strawberry.type
class AuthPayload:
    token: str
    user: UserType

@strawberry.type
class MessageResponse:
    success: bool
    message: str

def get_google_client_id():
    """Read Google client ID from client_secret.json file"""
    try:
        # Get the path to client_secret.json in the root directory
        base_dir = settings.BASE_DIR.parent  # Go up from backend/ to root
        client_secret_path = base_dir / 'client_secret.json'

        with open(client_secret_path, 'r') as f:
            client_secret = json.load(f)
            return client_secret['web']['client_id']
    except (FileNotFoundError, KeyError, json.JSONDecodeError) as e:
        raise Exception(f"Could not read Google client ID from client_secret.json: {str(e)}")

@strawberry.type
class Mutation:
    @strawberry.mutation
    def google_auth(self, token: str) -> AuthPayload:
        try:
            # Verify the Google ID token
            client_id = get_google_client_id()
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                client_id
            )

            # Get user info from Google
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')

            # Create or get user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            # Generate JWT token
            payload = {
                'user_id': user.id,
                'email': user.email,
                'exp': datetime.utcnow() + timedelta(days=7)
            }
            jwt_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

            return AuthPayload(
                token=jwt_token,
                user=UserType(
                    id=strawberry.ID(str(user.id)),
                    email=user.email,
                    username=user.username,
                    first_name=user.first_name,
                    last_name=user.last_name
                )
            )

        except ValueError as e:
            raise Exception(f"Invalid Google token: {str(e)}")
        except Exception as e:
            raise Exception(f"Authentication failed: {str(e)}")

    @strawberry.mutation
    def sign_in(self, email: str, password: str) -> AuthPayload:
        # Check if input is email or username and find user accordingly
        user = None
        if '@' in email:
            # Input looks like an email
            try:
                user = User.objects.get(email=email)
                print(f"DEBUG: Found user by email {email}, username: {user.username}, is_active: {user.is_active}")
            except User.DoesNotExist:
                print(f"DEBUG: No user found with email: {email}")
                raise Exception("Invalid credentials")
        else:
            # Input looks like a username
            try:
                user = User.objects.get(username=email)
                print(f"DEBUG: Found user by username {email}, email: {user.email}, is_active: {user.is_active}")
            except User.DoesNotExist:
                print(f"DEBUG: No user found with username: {email}")
                raise Exception("Invalid credentials")

        # Authenticate with the user's username
        print(f"DEBUG: Attempting authentication with username: {user.username}")
        authenticated_user = authenticate(username=user.username, password=password)
        print(f"DEBUG: Authentication result: {authenticated_user is not None}")

        if not authenticated_user:
            print(f"DEBUG: Authentication failed for username: {user.username}")
            print(f"DEBUG: User is_active: {user.is_active}, has_usable_password: {user.has_usable_password()}")
            raise Exception("Invalid credentials")

        user = authenticated_user

        # Generate JWT token
        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        jwt_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        return AuthPayload(
            token=jwt_token,
            user=UserType(
                id=strawberry.ID(str(user.id)),
                email=user.email,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name
            )
        )

    @strawberry.mutation
    def register(self, username: str, email: str, password: str) -> AuthPayload:
        if User.objects.filter(email=email).exists():
            raise Exception("User with this email already exists")

        print(f"DEBUG: Creating user with username: {username}, email: {email}")
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        print(f"DEBUG: User created successfully - ID: {user.id}, username: {user.username}, email: {user.email}, is_active: {user.is_active}")

        # Generate JWT token
        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(days=7)
        }
        jwt_token = pyjwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        return AuthPayload(
            token=jwt_token,
            user=UserType(
                id=strawberry.ID(str(user.id)),
                email=user.email,
                username=user.username,
                first_name=user.first_name,
                last_name=user.last_name
            )
        )

    @strawberry.mutation
    def debug_user(self, email: str) -> str:
        """Debug mutation to check user existence and details"""
        try:
            user = User.objects.get(email=email)
            return f"User found: username='{user.username}', email='{user.email}', is_active={user.is_active}, has_usable_password={user.has_usable_password()}"
        except User.DoesNotExist:
            return f"No user found with email: {email}"
        except Exception as e:
            return f"Error: {str(e)}"

    @strawberry.mutation
    def forgot_password(self, email: str) -> MessageResponse:
        """Send a password reset email to the user"""
        try:
            user = User.objects.get(email=email)

            # Generate password reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Create reset URL - you can customize this based on your frontend routing
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://127.0.0.1:5173')
            reset_url = f"{frontend_url}/auth/reset-password/{uid}/{token}/"

            # Send email
            subject = "Password Reset for Online Judge Platform"
            message = f"""
Hello {user.username},

You requested a password reset for your Online Judge Platform account.

Click the link below to reset your password:
{reset_url}

If you didn't request this password reset, please ignore this email.

Best regards,
Online Judge Platform Team
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False
            )

            return MessageResponse(
                success=True,
                message="Password reset email sent successfully"
            )

        except User.DoesNotExist:
            # For security, don't reveal if email exists or not
            return MessageResponse(
                success=True,
                message="If an account with that email exists, you'll receive a password reset link"
            )
        except Exception as e:
            print(f"ERROR: Failed to send password reset email: {str(e)}")
            return MessageResponse(
                success=False,
                message="Failed to send password reset email. Please try again later."
            )

    @strawberry.mutation
    def reset_password(self, uid: str, token: str, password: str) -> MessageResponse:
        """Reset user password using token from email"""
        try:
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            # Verify token
            if not default_token_generator.check_token(user, token):
                return MessageResponse(
                    success=False,
                    message="Invalid or expired reset token"
                )

            # Set new password
            user.set_password(password)
            user.save()

            return MessageResponse(
                success=True,
                message="Password reset successfully"
            )

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return MessageResponse(
                success=False,
                message="Invalid reset link"
            )
        except Exception as e:
            print(f"ERROR: Failed to reset password: {str(e)}")
            return MessageResponse(
                success=False,
                message="Failed to reset password. Please try again."
            )

schema = strawberry.Schema(query=Query, mutation=Mutation)
