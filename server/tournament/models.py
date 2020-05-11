from django.db import models

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

