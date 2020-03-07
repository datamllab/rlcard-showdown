from django.shortcuts import render
from .models import Agent
from .models import Game
import operator


def home(request):
    return render(request, 'leaderboard/home.html')


def about(request):
    return render(request, 'leaderboard/about.html')


def getting_started(request):
    return render(request, 'leaderboard/getting_started.html')


def blackjack(request):
    return render(request, 'leaderboard/blackjack.html')


def doudizhu(request):
    return render(request, 'leaderboard/doudizhu.html')


def leducholdem(request):
    context = {
        'agents': Agent.objects.all()
    }
    return render(request, 'leaderboard/leducholdem.html', context)


def limitholdem(request):
    return render(request, 'leaderboard/limitholdem.html')


def nolimitholdem(request):
    return render(request, 'leaderboard/nolimitholdem.html')


def mahjong(request):
    return render(request, 'leaderboard/mahjong.html')


def uno(request):
    return render(request, 'leaderboard/uno.html')


def nfsp(request):
    context = {
        'games': Game.objects.filter(agent1="NFSP")
    }
    return render(request, 'leaderboard/nfsp.html', context)


def cfr(request):
    context = {
        'games': Game.objects.filter(agent1="CFR")
    }
    return render(request, 'leaderboard/cfr.html', context)


def dqn(request):
    context = {
        'games': Game.objects.filter(agent1="DQN")
    }
    return render(request, 'leaderboard/dqn.html', context)

