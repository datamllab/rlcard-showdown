from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='leaderboard-home'),
    path('about/', views.about, name='leaderboard-about'),
    path('leaderboards/blackjack', views.blackjack, name='leaderboard-blackjack'),
    path('leaderboards/doudizhu', views.doudizhu, name='leaderboard-doudizhu'),
    path('leaderboards/leducholdem', views.leducholdem, name='leaderboard-leducholdem'),
    path('leaderboards/limitholdem', views.limitholdem, name='leaderboard-limitholdem'),
    path('leaderboards/nolimitholdem', views.nolimitholdem, name='leaderboard-nolimitholdem'),
    path('leaderboards/mahjong', views.mahjong, name='leaderboard-mahjong'),
    path('leaderboards/uno', views.uno, name='leaderboard-uno'),
    path('getting_started/', views.getting_started, name='leaderboard-getting_started'),
    path('leaderboards/nfsp', views.nfsp, name='leaderboard-nfsp'),
    path('leaderboards/cfr', views.cfr, name='leaderboard-cfr'),
    path('leaderboards/dqn', views.dqn, name='leaderboard-dqn'),
]
