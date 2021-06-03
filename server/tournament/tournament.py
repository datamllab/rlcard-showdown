import os
import json
from tqdm import tqdm
import numpy as np

from .rlcard_wrap import rlcard

class Tournament(object):
    
    def __init__(self, game, model_ids, num_eval_games=100):
        """ Default for two player games
            For Dou Dizhu, the two peasants use the same model
        """
        self.game = game
        self.model_ids = model_ids
        self.num_eval_games = num_eval_games
        # Load the models
        self.models = [rlcard.models.load(model_id) for model_id in model_ids]

    def launch(self):
        """ Currently for two-player game only
        """
        num_models = len(self.model_ids)
        games_data = []
        payoffs_data = []
        for i in range(num_models):
            for j in range(num_models):
                if j == i:
                    continue
                print(self.game, '-', self.model_ids[i], 'VS', self.model_ids[j])
                if self.game == 'doudizhu':
                    agents = [self.models[i].agents[0], self.models[j].agents[1], self.models[j].agents[2]]
                    names = [self.model_ids[i], self.model_ids[j], self.model_ids[j]]
                    data, payoffs, wins = doudizhu_tournament(self.game, agents, names, self.num_eval_games)
                elif self.game == 'leduc-holdem':
                    agents = [self.models[i].agents[0], self.models[j].agents[1]]
                    names = [self.model_ids[i], self.model_ids[j]]
                    data, payoffs, wins = leduc_holdem_tournament(self.game, agents, names, self.num_eval_games)
                mean_payoff = np.mean(payoffs)
                print('Average payoff:', mean_payoff)
                print()

                for k in range(len(data)):
                    game_data = {}
                    game_data['name'] = self.game
                    game_data['index'] = k
                    game_data['agent0'] = self.model_ids[i]
                    game_data['agent1'] = self.model_ids[j]
                    game_data['win'] = wins[k]
                    game_data['replay'] = data[k]
                    game_data['payoff'] = payoffs[k]

                    games_data.append(game_data)

                payoff_data = {}
                payoff_data['name'] = self.game
                payoff_data['agent0'] = self.model_ids[i]
                payoff_data['agent1'] = self.model_ids[j]
                payoff_data['payoff'] = mean_payoff
                payoffs_data.append(payoff_data)
        return games_data, payoffs_data

def doudizhu_tournament(game, agents, names, num_eval_games):
    env = rlcard.make(game, config={'allow_raw_data': True})
    env.set_agents(agents)
    payoffs = []
    json_data = []
    wins = []
    for _ in tqdm(range(num_eval_games)):
        data = {}
        roles = ['landlord', 'peasant', 'peasant']
        data['playerInfo'] = [{'id': i, 'index': i, 'role': roles[i], 'agentInfo': {'name': names[i]}} for i in range(env.num_players)]
        state, player_id = env.reset()
        perfect = env.get_perfect_information()
        data['initHands'] = perfect['hand_cards_with_suit']
        current_hand_cards = perfect['hand_cards_with_suit'].copy()
        for i in range(len(current_hand_cards)):
            current_hand_cards[i] = current_hand_cards[i].split()
        data['moveHistory'] = []
        while not env.is_over():
            action, info = env.agents[player_id].eval_step(state)
            history = {}
            history['playerIdx'] = player_id
            if env.agents[player_id].use_raw:
                _action = action
            else:
                _action = env._decode_action(action)
            history['move'] = _calculate_doudizhu_move(_action, player_id, current_hand_cards)
            history['info'] = info

            data['moveHistory'].append(history)
            state, player_id = env.step(action, env.agents[player_id].use_raw)
        data = json.dumps(str(data))
        #data = json.dumps(data, indent=2, sort_keys=True)
        json_data.append(data)
        if env.get_payoffs()[0] > 0:
            wins.append(True)
        else:
            wins.append(False)
        payoffs.append(env.get_payoffs()[0])
    return json_data, payoffs, wins

def _calculate_doudizhu_move(action, player_id, current_hand_cards):
    if action == 'pass':
        return action
    trans = {'B': 'BJ', 'R': 'RJ'}
    cards_with_suit = []
    for card in action:
        if card in trans:
            cards_with_suit.append(trans[card])
            current_hand_cards[player_id].remove(trans[card])
        else:
            for hand_card in current_hand_cards[player_id]:
                if hand_card[1] == card:
                    cards_with_suit.append(hand_card)
                    current_hand_cards[player_id].remove(hand_card)
                    break
    return ' '.join(cards_with_suit)

def leduc_holdem_tournament(game, agents, names, num_eval_games):
    env = rlcard.make(game, config={'allow_raw_data': True})
    env.set_agents(agents)
    payoffs = []
    json_data = []
    wins = []
    for _ in tqdm(range(num_eval_games)):
        data = {}
        data['playerInfo'] = [{'id': i, 'index': i, 'agentInfo': {'name': names[i]}} for i in range(env.num_players)]
        state, player_id = env.reset()
        perfect = env.get_perfect_information()
        data['initHands'] = perfect['hand_cards']
        data['moveHistory'] = []
        round_history = []
        round_id = 0
        while not env.is_over():
            action, info = env.agents[player_id].eval_step(state)
            history = {}
            history['playerIdx'] = player_id
            if env.agents[player_id].use_raw:
                history['move'] = action
            else:
                history['move'] = env._decode_action(action)

            history['info'] = info
            round_history.append(history)
            state, player_id = env.step(action, env.agents[player_id].use_raw)
            perfect = env.get_perfect_information()
            if round_id < perfect['current_round'] or env.is_over():
                round_id = perfect['current_round']
                data['moveHistory'].append(round_history)
                round_history = []
        perfect = env.get_perfect_information()
        data['publicCard'] = perfect['public_card']
        data = json.dumps(str(data))
        #data = json.dumps(data, indent=2, sort_keys=True)
        json_data.append(data)
        if env.get_payoffs()[0] > 0:
            wins.append(True)
        else:
            wins.append(False)
        payoffs.append(env.get_payoffs()[0])
    return json_data, payoffs, wins


if __name__=='__main__':
    game = 'leduc-holdem'
    model_ids = ['leduc-holdem-random', 'leduc-holdem-rule-v1', 'leduc-holdem-cfr']
    t = Tournament(game, model_ids)
    games_data = t.launch()
    print(len(games_data))
    print(games_data[0])
    #root_path = './models'
    #agent1 = LeducHoldemDQNModel1(root_path)
    #agent2 = LeducHoldemRandomModel(root_path)
    #agent3 = LeducHoldemRuleModel()
    #agent4 = LeducHoldemCFRModel(root_path)
    #agent5 = LeducHoldemDQNModel2(root_path)
    #t = Tournament(agent1, agent2, agent3, agent4, agent5, 'leduc-holdem')
    ##t.competition()
    #t.evaluate()
