''' Wrrapers of pretrained models. Designed for Tensorflow.
'''

import os
import tensorflow as tf

import rlcard
from rlcard.agents.nfsp_agent import NFSPAgent
from rlcard.agents.dqn_agent import DQNAgent
from rlcard.agents.cfr_agent import CFRAgent
from rlcard.agents.random_agent import RandomAgent
from rlcard.models.model import Model
from rlcard.models.leducholdem_rule_models import LeducholdemRuleAgentV1

class LeducHoldemRuleModel(Model):
    ''' Leduc holdem Rule Model version 1
    '''

    def __init__(self):
        ''' Load pretrained model
        '''
        env = rlcard.make('leduc-holdem', allow_raw_data=True)

        rule_agent = LeducholdemRuleAgentV1()
        self.rule_agents = [rule_agent for _ in range(env.player_num)]

    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return self.rule_agents

    @property
    def use_raw(self):
        ''' Indicate whether use raw state and action

        Returns:
            use_raw (boolean): True if using raw state and action
        '''
        return True

class LeducHoldemRandomModel(Model):
    ''' A pretrained model on Leduc Holdem with DQN
    '''

    def __init__(self, root_path):
        ''' Load pretrained model
        '''
        env = rlcard.make('leduc-holdem')
        model_path = os.path.join(root_path, 'leduc_holdem_cfr')
        self.agent = RandomAgent(action_num=env.action_num)

    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return [self.agent, self.agent]

    @property
    def use_raw(self):
        ''' Indicate whether use raw state and action

        Returns:
            use_raw (boolean): True if using raw state and action
        '''
        return False

class LeducHoldemCFRModel(Model):
    ''' A pretrained model on Leduc Holdem with DQN
    '''

    def __init__(self, root_path):
        ''' Load pretrained model
        '''
        env = rlcard.make('leduc-holdem')
        model_path = os.path.join(root_path, 'leduc_holdem_cfr')
        self.agent = CFRAgent(env, model_path=model_path)
        self.agent.load()  # If we have saved model, we first load the model
        
        #self.agents = [self.agent, self.agent]

    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return [self.agent, self.agent]

    @property
    def use_raw(self):
        ''' Indicate whether use raw state and action

        Returns:
            use_raw (boolean): True if using raw state and action
        '''
        return False

class LeducHoldemDQNModel2(Model):
    ''' A pretrained model on Leduc Holdem with DQN
    '''

    def __init__(self, root_path):
        ''' Load pretrained model
        '''
        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph)
        self.root_path = root_path
        

        env = rlcard.make('leduc-holdem')
        with self.graph.as_default():
            agent = DQNAgent(self.sess,
                        scope='dqn',
                        action_num=env.action_num,
                        replay_memory_size=int(1e5),
                        replay_memory_init_size=1000,
                        state_shape=env.state_shape,
                        mlp_layers=[128, 128])
            self.dqn_agents = [agent, agent]
            self.sess.run(tf.global_variables_initializer())

        check_point_path = os.path.join(self.root_path, 'leduc_holdem_dqn')
        with self.sess.as_default():
            with self.graph.as_default():
                saver = tf.train.Saver(tf.model_variables())
                saver.restore(self.sess, tf.train.latest_checkpoint(check_point_path))
    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return self.dqn_agents

class LeducHoldemDQNModel1(Model):
    ''' A pretrained model on Leduc Holdem with DQN
    '''

    def __init__(self, root_path):
        ''' Load pretrained model
        '''
        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph)
        self.root_path = root_path
        

        env = rlcard.make('leduc-holdem')
        with self.graph.as_default():
            agent = DQNAgent(self.sess,
                        scope='dqn',
                        action_num=env.action_num,
                        replay_memory_size=int(1e5),
                        replay_memory_init_size=1000,
                        state_shape=env.state_shape,
                        mlp_layers=[8, 8])
            self.dqn_agents = [agent, agent]
            self.sess.run(tf.global_variables_initializer())

        check_point_path = os.path.join(self.root_path, 'leduc_holdem_dqn_bad')
        with self.sess.as_default():
            with self.graph.as_default():
                saver = tf.train.Saver(tf.model_variables())
                saver.restore(self.sess, tf.train.latest_checkpoint(check_point_path))
    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return self.dqn_agents



class LeducHoldemNFSPModel(Model):
    ''' A pretrained model on Leduc Holdem with NFSP
    '''

    def __init__(self, root_path):
        ''' Load pretrained model
        '''
        self.graph = tf.Graph()
        self.sess = tf.Session(graph=self.graph)
        self.root_path = root_path

        env = rlcard.make('leduc-holdem')
        with self.graph.as_default():
            self.nfsp_agents = []
            for i in range(env.player_num):
                agent = NFSPAgent(self.sess,
                                  scope='nfsp' + str(i),
                                  action_num=env.action_num,
                                  state_shape=env.state_shape,
                                  hidden_layers_sizes=[128,128],
                                  q_mlp_layers=[128,128],
                                  evaluate_with='best_response'
                                  )
                self.nfsp_agents.append(agent)
            self.sess.run(tf.global_variables_initializer())

        check_point_path = os.path.join(self.root_path, 'leduc_holdem_nfsp')
        with self.sess.as_default():
            with self.graph.as_default():
                saver = tf.train.Saver(tf.model_variables())
                saver.restore(self.sess, tf.train.latest_checkpoint(check_point_path))
    @property
    def agents(self):
        ''' Get a list of agents for each position in a the game

        Returns:
            agents (list): A list of agents

        Note: Each agent should be just like RL agent with step and eval_step
              functioning well.
        '''
        return self.nfsp_agents
