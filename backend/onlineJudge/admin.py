from django.contrib import admin, messages
from .models import Problem, TestCase
from .forms import ProblemAdminForm  # Import our custom form
import json

class TestCaseInline(admin.TabularInline):
    """
    An inline to display existing test cases.
    This allows admins to see what test cases are currently associated with a problem.
    """
    model = TestCase
    readonly_fields = ('id', 'input_data', 'expected_output', 'is_sample')
    extra = 0 # Don't show empty forms by default
    can_delete = True

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    # Use our custom form that includes the file upload field
    form = ProblemAdminForm

    list_display = ('id', 'title', 'difficulty', 'time_limit', 'memory_limit')
    readonly_fields = ('id',)
    list_filter = ('difficulty', 'tags')
    search_fields = ('title', 'description')

    inlines = [TestCaseInline]

    def save_model(self, request, obj, form, change):
        """
        Override the default save_model to process the uploaded JSON file.
        """
        # First, save the Problem object itself.
        super().save_model(request, obj, form, change)

        testcase_json_file = form.cleaned_data.get('testcase_json')

        if testcase_json_file:
            try:
                # If this is an existing problem, first delete all old test cases.
                # This makes the upload a "replace" operation, which is predictable.
                if change:
                    obj.test_cases.all().delete()

                # Decode the file content and parse as JSON
                content = testcase_json_file.read().decode('utf-8')
                test_data = json.loads(content)

                if not isinstance(test_data, list):
                    raise TypeError("JSON content must be a list of test case objects.")

                test_cases_to_create = []
                for i, test_case_obj in enumerate(test_data):
                    if not all(k in test_case_obj for k in ('input', 'output')):
                        self.message_user(request, f"Test case at index {i} is missing 'input' or 'output' key. Skipping.", messages.WARNING)
                        continue

                    test_cases_to_create.append(
                        TestCase(
                            problem=obj,
                            input_data=str(test_case_obj['input']),
                            expected_output=str(test_case_obj['output']),
                            is_sample=test_case_obj.get('is_sample', False)
                        )
                    )
                
                if test_cases_to_create:
                    TestCase.objects.bulk_create(test_cases_to_create)
                    self.message_user(request, f"Successfully processed JSON file and created {len(test_cases_to_create)} test cases.", messages.SUCCESS)
                else:
                    self.message_user(request, "JSON file was processed, but no valid test cases were created.", messages.WARNING)

            except json.JSONDecodeError:
                self.message_user(request, "Invalid JSON format. Please check for syntax errors. No test cases were changed.", messages.ERROR)
            except TypeError as e:
                self.message_user(request, f"JSON structure error: {e}. No test cases were changed.", messages.ERROR)
            except Exception as e:
                self.message_user(request, f"An unexpected error occurred: {e}", messages.ERROR)