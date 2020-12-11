from django.urls import path

from . import views

urlpatterns = [
        path('replay', views.replay, name='replay'),
        path('launch', views.launch, name='launch'),
        path('query_agent_payoff', views.query_agent_payoff, name='query_agent_payoff'),
        path('query_payoff', views.query_payoff, name='query_payoff'),
        path('query_game', views.query_game, name='query_game'),
        path('upload_agent', views.upload_agent, name='upload_agent'),
        path('delete_agent', views.delete_agent, name='delete_agent'),
        path('list_uploaded_agents', views.list_uploaded_agents, name='list_uploaded_agents'),
        path('list_baseline_agents', views.list_baseline_agents, name='list_baseline_agents'),
        path('download_examples', views.download_examples, name='download_examples'),
        ]
