# when done python3 manage.py syncdb 
import os, sys
import uuid

PATH = "/Users/juanvargas/Desktop/Research/rlcard-leaderboard/research_env/"
# This is so Django knows where to find stuff.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "research_env.settings")
sys.path.append(PATH)

# This is so my local_settings.py gets loaded.
os.chdir(PATH)

# This is so models get loaded.
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
from leaderboard.models import Agent, Game

# a = Agent(gamesPlayed = 100, winRate = 0.123, gamesWon = 12, opponent = '123', agentID = '321', totalGamesPlayed = 100)
# a.save()

# game = Game(gameID='int',agent1='agent-name',agent2='agent-name',replayID='int',replayLink="http://link")
# game.save()
# a = Agent(gamesPlayed='int',winRate='1.234',gamesWon='int',opponent='char',totalGamesPlayed="http://link")
# a.save()

# We may need a function to generate a unique random id or append to current

# We need to unpack user data
# Should be in the form

# These need to be gotten from DB
# replayID = 10000
# gameID = 10000 

agentData = [
    {
        'gamesPlayed': 1,
        'winRate' : 0.5,
        'gamesWon' : 1,
        'opponent' : 'DQN',
        'agentID' : uuid.uuid4(),
        'agentName' : 'DQN',
        'totalGames' : 1
    }
]

games_played = []
win_rates = []
games_won = []
opponents = []
agent_ids = []
agent_names = []
total_games = []

# b = Agent(gamesPlayed = 100, winRate = 0.5, gamesWon = 1, opponent = 'NFSP' , agentID = 'NFSP123', agentName = 'DQN', totalGamesPlayed = 100)   

for item in range(len(agentData)):
    games_played.append(agentData[item]['gamesPlayed'])
    win_rates.append(agentData[item]['winRate'])
    games_won.append(agentData[item]['gamesWon'])
    opponents.append(agentData[item]['opponent'])
    agent_ids.append(agentData[item]['agentID'])
    agent_names.append(agentData[item]['agentName'])
    total_games.append(agentData[item]['totalGames'])

gameData = [
    {
        'gameID' : 1,
        'agent1' : uuid.uuid4(),
        'agent2' : uuid.uuid4(),
        'replayID' : uuid.uuid4(),
        'replayLink' : '~/Test'
    }
]

game_ids = []
agent_1_IDs = []
agent_2_IDs = []
replay_IDs = []
replay_Links = []

for item in range(len(gameData)):
    game_ids.append(gameData[item]['gameID'])
    agent_1_IDs.append(gameData[item]['agent1'])
    agent_2_IDs.append(gameData[item]['agent2'])
    replay_IDs.append(gameData[item]['replayID'])
    replay_Links.append(gameData[item]['replayLink'])


def add_agent(games_Played, win_Rate, games_Won, _opponent, agent_ID, agent_Name, total_GamesPlayed):
    agent = Agent(gamesPlayed = games_Played, winRate = win_Rate, gamesWon = games_Won, opponent = _opponent, agentID = agent_ID, agentName = agent_Name, totalGamesPlayed = total_GamesPlayed)
    agent.save()

def add_game(game_ID, agent_1, agent_2, replay_ID, replay_Link):
    game = Game(gameID = game_ID, agent1 = agent_1, agent2 = agent_2, replayID = replay_ID, replayLink = replay_Link)
    game.save()

# Will return true on new entry, false otherwise
def checkAgentID(agent_ID):
    if len(Agent.obejects.filter(agentID = agent_ID)) == 0:
        return True
    return False

# Function to update agentID
def updateAgentID(_opponent, games_Won, games_Played):
    #if agent is new, then add to database, else modify agent
    for i in range(len(data)):
        if checkAgentID(agents[i]) == True:
            add_agent(games_played[i], win_rates[i], games_won[i], opponents[i], agent_ids[i], agent_names[i], games_played[i])
        else:
            agent = Agent.objects.get(agentID = agents[i])
            agent.gamesWon = agent.gamesWon + games_Won
            agent.gamesPlayed = agent.gamesPlayed + games_Played
            agent.winRate = agent.gamesWon / agent.gamesPlayed
            agent.save()


# At the end of the game, update the rankings
def updateRanking():
    db_size = Agent.objects.all().count()
    for i in range(db_size):
        agent = Agent.objects.order_by('winRate')[i]
        agent.Rank = i+1
        agent.save()

updateRanking()