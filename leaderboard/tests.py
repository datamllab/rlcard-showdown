# when done python3 manage.py syncdb 
import os, sys

proj_path = "/Users/juanvargas/Desktop/Research/rlcard-leaderboard/research_env/"
# This is so Django knows where to find stuff.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "research_env.settings")
sys.path.append(proj_path)

# This is so my local_settings.py gets loaded.
os.chdir(proj_path)

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

data = [
    {
        'agent' : '1',
        'gamesWon' : 'int',
        'gamesPlayed': 'int',
        'winRate' : 'float',
        'path' : '~/Test',
        'opponent' : 'opp'
    },
        {
        'agent' : '2',
        'gamesWon' : 'int',
        'gamesPlayed': 'int',
        'winRate' : 'float',
        'path' : '~/Test',
        'opponent' : 'opp'
    }

]

agents = []
games_won = []
games_played = []
win_rates = []
opponents = []
for item in range(len(data)):
    agents.append(data[item]['agent'])
    games_won.append(data[item]['gamesWon'])
    games_played.append(data[item]['gamesPlayed'])
    win_rates.append(data[item]['winRate'])
    opponents.append(data[item]['opponent'])


def add_agent(games_Played, win_Rate, games_Won, _opponent, agent_ID, total_GamesPlayed):
    agent = Agent(gamesPlayed = games_Played, winRate = win_Rate, gamesWon = games_Won, opponent = _opponent, agentID = agent_ID, totalGamesPlayed = total_GamesPlayed)
    agent.save()

def add_game(game_ID, agent_1, agent_2, replay_ID, replay_Link):
    game = Game(gameID = game_ID, agent1 = agent_1, agent2 = agent_2, replayID = replay_ID, replayLink = replay_Link)
    game.save()

# Will return true on new entry, false otherwise
def checkAgentID(agent_ID):
    if len(Agent.obejects.filter(agentID = agent_ID)) == 0
        return True
    return False

# Function to update agentID
def updateAgentID(opponent, gamesWon, gamesPlayed):
    #if agent is new, then add to database, else modify agent
    for i in range(len(data)):
        if checkAgentID(agents[i]) == True:
            add_agent(games_won[i], win_rates[i], games_won[i], opponents[i], agents[i, games_played[i]])
        else:
            agent = Agent.objects.get(agentID = agents[i])
            
            agent.save()


# Will return true on new entry, false otherwise
# def checkAgentID(agentID):
#     command_line = os.popen("python3 manage.py shell < agenthelper.py").read()
#     if command_line == '0':
#         return True
#     else:
#         return False

# #Should return a tuple in format ([agent1, winrate1], [agent2, winrate2])
# def calculateWinRate(agent1ID, agent2ID, gamesAgent1, gamesAgent2, gamesPlayed):
#     #Check to see if ID is in DB if so update currrent info else just return
#     return([[agent1ID, gamesAgent1/gamesPlayed], [agent2ID, gamesAgent2/gamesPlayed]])

# # Function to update game
# def updateGame(replayID, gameID):
#     os.system("a = Game(gameID='int',agent1='agent-name',agent2='agent-name',replayID='int',replayLink='path')")
#     time.sleep(0.5)
#     os.system("a.save()")




def updateRanking():
    print("brb")

# when done python3 manage.py syncdb 