from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from strawberry.django.views import GraphQLView
from .graphql.schema import schema

urlpatterns = [
    path("graphql/", csrf_exempt(GraphQLView.as_view(schema=schema, graphiql=True)), name="graphql"),
]