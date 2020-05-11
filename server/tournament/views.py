from django.shortcuts import render
from django.http import HttpResponse
from django.db import transaction
from django.core import serializers

from .models import Game, Payoff

from .rlcard_wrap import rlcard, MODEL_IDS
from .tournament import Tournament

def replay(request):
    if request.method == 'GET':
        name = request.GET['name']
        agent0 = request.GET['agent0']
        agent1 = request.GET['agent1']
        index = request.GET['index']
        g = Game.objects.get(name=name, agent0=agent0, agent1=agent1, index=index)
        json_data = g.replay
        return HttpResponse(json_data)

def query_game(request):
    if request.method == 'GET':
        filter_dict = {key: request.GET.get(key) for key in dict(request.GET).keys()}
        result = Game.objects.filter(**filter_dict)
        result = serializers.serialize('json', result, fields=('name', 'index', 'agent0', 'agent1', 'win', 'payoff'))
        return HttpResponse(result)

def query_payoff(request):
    if request.method == 'GET':
        filter_dict = {key: request.GET.get(key) for key in dict(request.GET).keys()}
        result = Payoff.objects.filter(**filter_dict)
        result = serializers.serialize('json', result)
        return HttpResponse(result)


@transaction.atomic
def launch(request):
    if request.method == 'GET':
        eval_num = int(request.GET['eval_num'])
        game = request.GET['name']
        games_data, payoffs_data = Tournament(game, MODEL_IDS[game], eval_num).launch()
        Game.objects.filter(name=game).delete()
        Payoff.objects.filter(name=game).delete()
        for game_data in games_data:
            g = Game(name=game_data['name'],
                     index=game_data['index'],
                     agent0=game_data['agent0'],
                     agent1=game_data['agent1'],
                     win=game_data['win'],
                     payoff=game_data['payoff'],
                     replay=game_data['replay'])
            g.save()
        for payoff_data in payoffs_data:
            p = Payoff(name=payoff_data['name'],
                     agent0=payoff_data['agent0'],
                     agent1=payoff_data['agent1'],
                     payoff=payoff_data['payoff'])
            p.save()
        return HttpResponse(1)

