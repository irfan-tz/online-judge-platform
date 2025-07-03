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
