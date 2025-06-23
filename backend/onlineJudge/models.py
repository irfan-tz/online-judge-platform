from django.db import models

# Create your models here.
class Problem(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    time_limit = models.IntegerField()
    memory_limit = models.IntegerField()