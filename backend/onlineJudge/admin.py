from django.contrib import admin
from .models import Problem

# Register your models here.

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'description', 'time_limit', 'memory_limit')
    readonly_fields = ('id',)
