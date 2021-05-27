# A wrap for rlcard
# Here, we include a random model as the default baseline
import rlcard
from rlcard.agents import RandomAgent
from rlcard.models.model import Model

class DoudizhuRandomModelSpec(object):
    def __init__(self):
        self.model_id = 'doudizhu-random'
        self._entry_point = DoudizhuRandomModel

    def load(self):
        model = self._entry_point()
        return model

class DoudizhuRandomModel(Model):
    ''' A random model
    '''

    def __init__(self):
        ''' Load random model
        '''
        env = rlcard.make('doudizhu')
        self.agent = RandomAgent(num_actions=env.num_actions)
        self.num_players = env.num_players

    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return [self.agent for _ in range(self.num_players)]

    @property
    def use_raw(self):
        ''' Indicate whether use raw state and action

        Returns:
            use_raw (boolean): True if using raw state and action
        '''
        return False
