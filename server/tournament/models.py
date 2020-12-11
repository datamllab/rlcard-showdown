from django.db import models
from django.conf import settings

class Game(models.Model):
    # The name of the game
    name = models.CharField(max_length=100)

    # The ID of repeated games
    index = models.CharField(max_length=100)

    # The first agent
    agent0 = models.CharField(max_length=100)

    # The second agent
    agent1 = models.CharField(max_length=100)

    # Whether the first agent wins
    win = models.BooleanField()

    # The payoff of the first agent
    payoff = models.FloatField()

    # The JSON file
    replay = models.TextField(blank=True)

class Payoff(models.Model):
    # The name of the game
    name = models.CharField(max_length=100)

    # The first agent
    agent0 = models.CharField(max_length=100)

    # The second agent
    agent1 = models.CharField(max_length=100)
 
    # The average payoff of the first agent
    payoff = models.FloatField()

class UploadedAgent(models.Model):
    # The name of the agent
    name = models.CharField(max_length=100)

    # The game of the agent
    game = models.CharField(max_length=100)

    # File
    f = models.FileField(upload_to='uploaded_agents')

