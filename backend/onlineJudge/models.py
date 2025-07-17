from django.db import models
from taggit.managers import TaggableManager

DIFFICULTY_CHOICES = [
    ('Easy', 'Easy'),
    ('Medium', 'Medium'),
    ('Hard', 'Hard'),
]

class Problem(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    time_limit = models.CharField(max_length=8)
    memory_limit = models.CharField(max_length=8)
    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES, default='Medium')
    tags = TaggableManager()

class TestCase(models.Model):
    problem = models.ForeignKey(Problem, related_name='test_cases', on_delete=models.CASCADE)
    input_data = models.TextField()
    expected_output = models.TextField()
    is_sample = models.BooleanField(default=False, help_text="Is this a sample test case visible to users?")

    def __str__(self):
        return f"Test case for {self.problem.title}"