from django.apps import AppConfig
from typing import ClassVar


class OnlinejudgeConfig(AppConfig):
    default_auto_field: ClassVar[str] = 'django.db.models.BigAutoField'
    name = 'onlineJudge'
