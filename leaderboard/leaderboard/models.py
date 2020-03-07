from django.db import models
import uuid


class Agent(models.Model):
    gamesPlayed = models.IntegerField(default = 1)
    winRate = models.DecimalField(max_digits=3, decimal_places=3, default = 0.5)
    gamesWon = models.IntegerField(default = 1)
    rank = models.IntegerField(default = 1)
    agentID = models.CharField(max_length=100, unique = True, default = uuid.uuid4())
    agentName = models.CharField(max_length=100, default = 'DQN')
    totalGamesPlayed = models.IntegerField(default = 1)


class Game(models.Model):
    gameID = models.CharField(max_length=100, unique = True, default = uuid.uuid4())
    gameName = models.CharField(max_length=100, default="Leduc Hold'em")
    agent1 = models.CharField(max_length=100, default="agent")
    agent2 = models.CharField(max_length=100, default="agent")
    replayID = models.CharField(max_length=100, unique = True, default = uuid.uuid4())
    replayLink = models.CharField(max_length=100, default = 'replay00001')

    







