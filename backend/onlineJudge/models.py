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
    time_limit = models.IntegerField(help_text='Time limit in milliseconds')
    memory_limit = models.IntegerField(help_text='Memory limit in MB')
    difficulty = models.CharField(max_length=6, choices=DIFFICULTY_CHOICES, default='Medium')
    tags = TaggableManager()
    
    # Additional fields for problem details
    constraints = models.TextField(blank=True, null=True)
    hints = models.TextField(blank=True, null=True)
    examples = models.JSONField(default=list, blank=True)  # List of example objects
    default_code = models.JSONField(default=dict, blank=True)  # Dict with language keys
    
    def __str__(self):
        return f"{self.id}. {self.title}"
    
    class Meta:
        ordering = ['id']
