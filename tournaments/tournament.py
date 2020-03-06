import os
import json
import tensorflow as tf
import sys
import rlcard
from tqdm import tqdm
from rlcard.agents.nfsp_agent import NFSPAgent
from rlcard.agents.dqn_agent import DQNAgent
from math import log10
# from rlcard.agents.random_agent import RandomAgent
from rlcard.utils.utils import set_global_seed
from rlcard.utils.logger import Logger
from pretrained_models import LeducHoldemDQNModel1, LeducHoldemNFSPModel, LeducHoldemCFRModel, LeducHoldemRandomModel, LeducHoldemRuleModel, LeducHoldemDQNModel2

class Tournament(object):
    
    def __init__(self, 
                agent1, 
                agent2, 
                agent3,
                agent4,
                agent5,
                env_id, 
                evaluate_num=10000):

        set_global_seed(0)
        self.env_id = env_id
        self.env1 = rlcard.make(env_id, allow_raw_data=True)
        self.env2 = rlcard.make(env_id, allow_raw_data=True)
        self.env3 = rlcard.make(env_id, allow_raw_data=True)
        self.agent1 = agent1.agents[0]
        self.agent2 = agent2.agents[0]
        self.agent3 = agent3.agents[0]
        self.agent4 = agent4.agents[0]
        self.agent5 = agent5.agents[0]
        self.evaluate_num = evaluate_num
        self.env1.set_agents([self.agent1, self.agent2])
        self.env2.set_agents([self.agent1, self.agent3])
        self.env3.set_agents([self.agent1, self.agent4])


    def competition(self):

        agent1_wins = 0
        agent2_wins = 0
        print("########## Play Against Random Agent ##########")
        for eval_episode in tqdm(range(self.evaluate_num)):
            _, payoffs = self.env1.run(is_training=False)
            
            agent1_wins += payoffs[0]
            agent2_wins += payoffs[1]

        agent1_rate = agent1_wins / self.evaluate_num
        agent2_rate = agent2_wins / self.evaluate_num
        print("DQN Agent average peroformance:", agent1_rate)
        print("Random Agent avgerage performance:", agent2_rate)
        print("\n")

        print("########## Play Against Rule-based Agent ##########")
        agent1_wins = 0
        agent2_wins = 0
        for eval_episode in tqdm(range(self.evaluate_num)):
            _, payoffs = self.env2.run(is_training=False)
            
            agent1_wins += payoffs[0]
            agent2_wins += payoffs[1]

        agent1_rate = agent1_wins / self.evaluate_num
        agent2_rate = agent2_wins / self.evaluate_num
        print("DQN Agent average peroformance:", agent1_rate)
        print("Rule-based Agent avgerage performance:", agent2_rate)
        print("\n")

        agent1_wins = 0
        agent2_wins = 0
        print("########## Play Against CFR Agent ##########")
        for eval_episode in tqdm(range(self.evaluate_num)):
            _, payoffs = self.env2.run(is_training=False)
            
            agent1_wins += payoffs[0]
            agent2_wins += payoffs[1]

        agent1_rate = agent1_wins / self.evaluate_num
        agent2_rate = agent2_wins / self.evaluate_num
        print("DQN Agent average peroformance:", agent1_rate)
        print("CFR Agent avgerage performance:", agent2_rate)

    def evaluate(self):
        agents = [self.agent1, self.agent2, self.agent3, self.agent4, self.agent5]
        for a1 in agents:
            avg_performance = 0.0
            print("########### Evaluating "+ str(a1) +" #########")
            for a2 in agents:
                if a1 == a2:
                    continue
                agent1_wins = 0
                env = rlcard.make(self.env_id, allow_raw_data=True)
                env.set_agents([a1, a2])
                for eval_episode in range(self.evaluate_num):
                    _, payoffs = env.run(is_training=False)
                    agent1_wins += payoffs[0]
                agent1_rate = agent1_wins / self.evaluate_num
                if agent1_rate > 0:
                    avg_performance += 1.0
                print("Against "+str(a2)+":", agent1_rate)
            avg_performance /= len(agents)-1
            print("Average Performance:", avg_performance)
            print("\n")


if __name__=='__main__':
    root_path = './models'
    agent1 = LeducHoldemDQNModel1(root_path)
    agent2 = LeducHoldemRandomModel(root_path)
    agent3 = LeducHoldemRuleModel()
    agent4 = LeducHoldemCFRModel(root_path)
    agent5 = LeducHoldemDQNModel2(root_path)
    t = Tournament(agent1, agent2, agent3, agent4, agent5, 'leduc-holdem')
    #t.competition()
    t.evaluate()
