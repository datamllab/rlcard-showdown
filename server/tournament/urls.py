from django.urls import path

from . import views

urlpatterns = [
        path('replay', views.replay, name='replay'),
        path('launch', views.launch, name='launch'),
        path('query_payoff', views.query_payoff, name='query_payoff'),
        path('query_game', views.query_game, name='query_game'),
        path('upload_agent', views.upload_agent, name='upload_agent'),
        path('delete_agent', views.delete_agent, name='delete_agent'),
        path('list_agents', views.list_agents, name='list_agents'),
        ]
