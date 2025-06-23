from typing import List

import strawberry
from strawberry import auto
import strawberry_django

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

schema = strawberry.Schema(query=Query)