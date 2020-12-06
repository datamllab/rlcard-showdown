import json
import os
import importlib.util
import math
import copy

from django.shortcuts import render
from django.http import HttpResponse
from django.db import transaction
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from django.dispatch import receiver
from django.db import models
from django.conf import settings
from django.db.models import Avg

from .rlcard_wrap import rlcard, MODEL_IDS
from .models import Game, Payoff, UploadedAgent

from .tournament import Tournament
from .rlcard_wrap import rlcard, MODEL_IDS
MODEL_IDS_ALL = copy.deepcopy(MODEL_IDS)

def _reset_model_ids():
    agents = UploadedAgent.objects.all()
    for agent in agents:
        path = os.path.join(settings.MEDIA_ROOT, agent.f.name)
        name = agent.name
        game = agent.game
        entry = agent.entry
        module_name = path.split('/')[-1].split('.')[0]
        spec = importlib.util.spec_from_file_location(module_name, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        M = getattr(module, entry)

        class ModelSpec(object):
            def __init__(self):
                self.model_id = name
                self._entry_point = M

            def load(self):
                model = self._entry_point()
                return model
        rlcard.models.registration.model_registry.model_specs[name] = ModelSpec()
        MODEL_IDS_ALL[game].append(name)
_reset_model_ids()

PAGE_FIELDS = ['elements_every_page', 'page_index']

def _get_page(result, elements_every_page, page_index):
    elements_every_page = int(elements_every_page)
    page_index = int(page_index)
    total_row = len(result)
    total_page = math.ceil(len(result) / float(elements_every_page))
    begin = page_index * elements_every_page
    end = min((page_index+1) * elements_every_page, len(result))
    result = result[begin:end]
    return result, total_page, total_row

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
        if not PAGE_FIELDS[0] in request.GET or not PAGE_FIELDS[1] in request.GET:
            return HttpResponse(json.dumps({'value': -1, 'info': 'elements_every_page and page_index should be given'}))
        filter_dict = {key: request.GET.get(key) for key in dict(request.GET).keys() if key not in PAGE_FIELDS}
        result = Game.objects.filter(**filter_dict).order_by('index')
        result, total_page, total_row = _get_page(result, request.GET['elements_every_page'], request.GET['page_index'])
        result = serializers.serialize('json', result, fields=('name', 'index', 'agent0', 'agent1', 'win', 'payoff'))
        return HttpResponse(json.dumps({'value': 0, 'data': json.loads(result), 'total_page': total_page, 'total_row': total_row}))

def query_payoff(request):
    if request.method == 'GET':
        filter_dict = {key: request.GET.get(key) for key in dict(request.GET).keys()}
        result = Payoff.objects.filter(**filter_dict)
        result = serializers.serialize('json', result)
        return HttpResponse(result)

def query_agent_payoff(request):
    if request.method == 'GET':
        if not PAGE_FIELDS[0] in request.GET or not PAGE_FIELDS[1] in request.GET:
            return HttpResponse(json.dumps({'value': -1, 'info': 'elements_every_page and page_index should be given'}))
        if not 'name' in request.GET:
            return HttpResponse(json.dumps({'value': -2, 'info': 'name should be given'}))
        result = list(Payoff.objects.filter(name=request.GET['name']).values('agent0').annotate(payoff = Avg('payoff')).order_by('-payoff'))
        print(result)
        result, total_page, total_row = _get_page(result, request.GET['elements_every_page'], request.GET['page_index'])
        return HttpResponse(json.dumps({'value': 0, 'data': result, 'total_page': total_page, 'total_row': total_row}))

@transaction.atomic
def launch(request):
    if request.method == 'GET':
        try:
            eval_num = int(request.GET['eval_num'])
            game = request.GET['name']
        except:
            return HttpResponse(json.dumps({'value': -1, 'info': 'parameters error'}))

        games_data, payoffs_data = Tournament(game, MODEL_IDS_ALL[game], eval_num).launch()
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
        return HttpResponse(json.dumps({'value': 0, 'info': 'success'}))

@csrf_exempt
def upload_agent(request):
    if request.method == 'POST':
        f = request.FILES['model']
        name = request.POST['name']
        game = request.POST['game']
        entry = request.POST['entry']
        if UploadedAgent.objects.filter(name=name).exists():
            return HttpResponse(json.dumps({'value': -1, 'info': 'name exists'}))

        a = UploadedAgent(name=name, game=game, f=f, entry=entry)
        a.save()
        _reset_model_ids()
        return HttpResponse(json.dumps({'value': 0, 'info': 'success'}))

def delete_agent(request):
    if request.method == 'GET':
        name = request.GET['name']
        if not UploadedAgent.objects.filter(name=name).exists():
            return HttpResponse(json.dumps({'value': -1, 'info': 'name not exists'}))

        UploadedAgent.objects.filter(name=name).delete()
        Game.objects.filter(agent0=name).delete()
        Game.objects.filter(agent1=name).delete()
        _reset_model_ids()
        return HttpResponse(json.dumps({'value': 0, 'info': 'success'}))

def list_uploaded_agents(request):
    if request.method == 'GET':
        filter_dict = {key: request.GET.get(key) for key in dict(request.GET).keys()}
        result = UploadedAgent.objects.filter(**filter_dict)
        result = serializers.serialize('json', result)
        return HttpResponse(result)

def list_baseline_agents(request):
    if request.method == 'GET':
        if not 'game' in request.GET:
            return HttpResponse(json.dumps({'value': -2, 'info': 'game should be given'}))
        result = MODEL_IDS[request.GET['game']]
        return HttpResponse(json.dumps({'value': 0, 'data': result}))

@receiver(models.signals.post_delete, sender=UploadedAgent)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    if instance.f:
        if os.path.isfile(instance.f.path):
            os.remove(instance.f.path)
