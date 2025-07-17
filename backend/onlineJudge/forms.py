      
from django import forms
from .models import Problem

class ProblemAdminForm(forms.ModelForm):
    # This field is not part of the model, but is used to handle the file upload in the admin.
    testcase_json = forms.FileField(
        required=False,
        help_text=(
            "Upload a JSON file containing a list of test cases. "
            "This will delete and replace any existing test cases for this problem."
        )
    )

    class Meta:
        model = Problem
        fields = '__all__'

    