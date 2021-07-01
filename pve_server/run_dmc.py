from utils.move_generator import MovesGener
from utils import move_selector as ms
from utils import move_detector as md
import rlcard
import itertools
import os
from collections import Counter, OrderedDict
from heapq import nlargest

import numpy as np
import torch
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


env = rlcard.make('doudizhu')

DouZeroCard2RLCard = {3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
                      8: '8', 9: '9', 10: 'T', 11: 'J', 12: 'Q',
                      13: 'K', 14: 'A', 17: '2', 20: 'B', 30: 'R'}

RLCard2DouZeroCard = {'3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
                      '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12,
                      'K': 13, 'A': 14, '2': 17, 'B': 20, 'R': 30}

EnvCard2RealCard = {'3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
                    '8': '8', '9': '9', 'T': 'T', 'J': 'J', 'Q': 'Q',
                    'K': 'K', 'A': 'A', '2': '2', 'B': 'X', 'R': 'D'}

RealCard2EnvCard = {'3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
                    '8': '8', '9': '9', 'T': 'T', 'J': 'J', 'Q': 'Q',
                    'K': 'K', 'A': 'A', '2': '2', 'X': 'B', 'D': 'R'}

pretrained_dir = 'pretrained/dmc_pretrained'
device = torch.device('cpu')
players = []
for i in range(3):
    model_path = os.path.join(pretrained_dir, str(i)+'.pth')
    agent = torch.load(model_path, map_location=device)
    agent.set_device(device)
    players.append(agent)


@app.route('/predict', methods=['POST'])
def predict():
    if request.method == 'POST':
        try:
            # Player postion
            player_position = request.form.get('player_position')
            if player_position not in ['0', '1', '2']:
                return jsonify({'status': 1, 'message': 'player_position must be 0, 1, or 2'})
            player_position = int(player_position)

            # Player hand cards
            player_hand_cards = ''.join(
                [RealCard2EnvCard[c] for c in request.form.get('player_hand_cards')])
            if player_position == 0:
                if len(player_hand_cards) < 1 or len(player_hand_cards) > 20:
                    return jsonify({'status': 2, 'message': 'the number of hand cards should be 1-20'})
            else:
                if len(player_hand_cards) < 1 or len(player_hand_cards) > 17:
                    return jsonify({'status': 3, 'message': 'the number of hand cards should be 1-17'})

            # Number cards left
            num_cards_left = [int(request.form.get('num_cards_left_landlord')), int(request.form.get(
                'num_cards_left_landlord_down')), int(request.form.get('num_cards_left_landlord_up'))]
            if num_cards_left[player_position] != len(player_hand_cards):
                return jsonify({'status': 4, 'message': 'the number of cards left do not align with hand cards'})
            if num_cards_left[0] < 0 or num_cards_left[1] < 0 or num_cards_left[2] < 0 or num_cards_left[0] > 20 or num_cards_left[1] > 17 or num_cards_left[2] > 17:
                return jsonify({'status': 5, 'message': 'the number of cards left not in range'})

            # Three landlord cards
            three_landlord_cards = ''.join(
                [RealCard2EnvCard[c] for c in request.form.get('three_landlord_cards')])
            if len(three_landlord_cards) < 0 or len(three_landlord_cards) > 3:
                return jsonify({'status': 6, 'message': 'the number of landlord cards should be 0-3'})

            # Card play sequence
            if request.form.get('card_play_action_seq') == '':
                card_play_action_seq = []
            else:
                tmp_seq = [''.join([RealCard2EnvCard[c] for c in cards])
                           for cards in request.form.get('card_play_action_seq').split(',')]
                for i in range(len(tmp_seq)):
                    if tmp_seq[i] == '':
                        tmp_seq[i] = 'pass'
                card_play_action_seq = []
                for i in range(len(tmp_seq)):
                    card_play_action_seq.append((i % 3, tmp_seq[i]))

            # Other hand cards
            other_hand_cards = ''.join(
                [RealCard2EnvCard[c] for c in request.form.get('other_hand_cards')])
            if len(other_hand_cards) != sum(num_cards_left) - num_cards_left[player_position]:
                return jsonify({'status': 7, 'message': 'the number of the other hand cards do not align with the number of cards left'})

            # Played cards
            played_cards = []
            for field in ['played_cards_landlord', 'played_cards_landlord_down', 'played_cards_landlord_up']:
                played_cards.append(
                    ''.join([RealCard2EnvCard[c] for c in request.form.get(field)]))

            # RLCard state
            state = {}
            state['current_hand'] = player_hand_cards
            state['landlord'] = 0
            state['num_cards_left'] = num_cards_left
            state['others_hand'] = other_hand_cards
            state['played_cards'] = played_cards
            state['seen_cards'] = three_landlord_cards
            state['self'] = player_position
            state['trace'] = card_play_action_seq

            # Get rival move and legal_actions
            rival_move = 'pass'
            if len(card_play_action_seq) != 0:
                if card_play_action_seq[-1][1] == 'pass':
                    rival_move = card_play_action_seq[-2][1]
                else:
                    rival_move = card_play_action_seq[-1][1]
            if rival_move == 'pass':
                rival_move = ''
            rival_move = [RLCard2DouZeroCard[c] for c in rival_move]
            state['actions'] = _get_legal_card_play_actions(
                [RLCard2DouZeroCard[c] for c in player_hand_cards], rival_move)
            state['actions'] = [
                ''.join([DouZeroCard2RLCard[c] for c in a]) for a in state['actions']]
            for i in range(len(state['actions'])):
                if state['actions'][i] == '':
                    state['actions'][i] = 'pass'

            # Prediction
            state = _extract_state(state)
            action, info = players[player_position].eval_step(state)
            if action == 'pass':
                action = ''
            for i in info['values']:
                if i == 'pass':
                    info['values'][''] = info['values']['pass']
                    del info['values']['pass']
                    break

            actions = nlargest(3, info['values'], key=info['values'].get)
            actions_confidence = [info['values'].get(
                action) for action in actions]
            actions = [''.join([EnvCard2RealCard[c] for c in action])
                       for action in actions]
            result = {}
            win_rates = {}
            for i in range(len(actions)):
                # Here, we calculate the win rate
                win_rate = min(actions_confidence[i], 1)
                win_rate = max(win_rate, 0)
                win_rates[actions[i]] = str(round(win_rate, 4))
                result[actions[i]] = str(round(actions_confidence[i], 6))

            ############## DEBUG ################
            if app.debug:
                print('--------------- DEBUG START --------------')
                command = 'curl --data "'
                parameters = []
                for key in request.form:
                    parameters.append(key+'='+request.form.get(key))
                    print(key+':', request.form.get(key))
                command += '&'.join(parameters)
                command += '" "http://127.0.0.1:5000/predict"'
                print('Command:', command)
                print('Rival Move:', rival_move)
                print('legal_actions:', state['legal_actions'])
                print('Result:', result)
                print('--------------- DEBUG END --------------')
            ############## DEBUG ################
            return jsonify({'status': 0, 'message': 'success', 'result': result, 'win_rates': win_rates})
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'status': -1, 'message': 'unkown error'})


@app.route('/legal', methods=['POST'])
def legal():
    if request.method == 'POST':
        try:
            player_hand_cards = [RealCard2EnvCard[c]
                                 for c in request.form.get('player_hand_cards')]
            rival_move = [RealCard2EnvCard[c]
                          for c in request.form.get('rival_move')]
            if rival_move == '':
                rival_move = 'pass'
            player_hand_cards = [RLCard2DouZeroCard[c]
                                 for c in player_hand_cards]
            rival_move = [RLCard2DouZeroCard[c] for c in rival_move]
            legal_actions = _get_legal_card_play_actions(
                player_hand_cards, rival_move)
            legal_actions = [''.join([DouZeroCard2RLCard[c]
                                      for c in a]) for a in legal_actions]
            for i in range(len(legal_actions)):
                if legal_actions[i] == 'pass':
                    legal_actions[i] = ''
            legal_actions = ','.join(
                [''.join([EnvCard2RealCard[c] for c in action]) for action in legal_actions])
            return jsonify({'status': 0, 'message': 'success', 'legal_action': legal_actions})
        except:
            import traceback
            traceback.print_exc()
            return jsonify({'status': -1, 'message': 'unkown error'})


def _extract_state(state):
    current_hand = _cards2array(state['current_hand'])
    others_hand = _cards2array(state['others_hand'])

    last_action = ''
    if len(state['trace']) != 0:
        if state['trace'][-1][1] == 'pass':
            last_action = state['trace'][-2][1]
        else:
            last_action = state['trace'][-1][1]
    last_action = _cards2array(last_action)

    last_9_actions = _action_seq2array(_process_action_seq(state['trace']))

    if state['self'] == 0:  # landlord
        landlord_up_played_cards = _cards2array(state['played_cards'][2])
        landlord_down_played_cards = _cards2array(state['played_cards'][1])
        landlord_up_num_cards_left = _get_one_hot_array(
            state['num_cards_left'][2], 17)
        landlord_down_num_cards_left = _get_one_hot_array(
            state['num_cards_left'][1], 17)
        obs = np.concatenate((current_hand,
                              others_hand,
                              last_action,
                              last_9_actions,
                              landlord_up_played_cards,
                              landlord_down_played_cards,
                              landlord_up_num_cards_left,
                              landlord_down_num_cards_left))
    else:
        landlord_played_cards = _cards2array(state['played_cards'][0])
        for i, action in reversed(state['trace']):
            if i == 0:
                last_landlord_action = action
        last_landlord_action = _cards2array(last_landlord_action)
        landlord_num_cards_left = _get_one_hot_array(
            state['num_cards_left'][0], 20)

        teammate_id = 3 - state['self']
        teammate_played_cards = _cards2array(
            state['played_cards'][teammate_id])
        last_teammate_action = 'pass'
        for i, action in reversed(state['trace']):
            if i == teammate_id:
                last_teammate_action = action
        last_teammate_action = _cards2array(last_teammate_action)
        teammate_num_cards_left = _get_one_hot_array(
            state['num_cards_left'][teammate_id], 17)
        obs = np.concatenate((current_hand,
                              others_hand,
                              last_action,
                              last_9_actions,
                              landlord_played_cards,
                              teammate_played_cards,
                              last_landlord_action,
                              last_teammate_action,
                              landlord_num_cards_left,
                              teammate_num_cards_left))

    legal_actions = {env._ACTION_2_ID[action]: _cards2array(
        action) for action in state['actions']}
    extracted_state = OrderedDict({'obs': obs, 'legal_actions': legal_actions})
    extracted_state['raw_obs'] = state
    extracted_state['raw_legal_actions'] = [a for a in state['actions']]
    return extracted_state


def _get_legal_card_play_actions(player_hand_cards, rival_move):
    mg = MovesGener(player_hand_cards)

    rival_type = md.get_move_type(rival_move)
    rival_move_type = rival_type['type']
    rival_move_len = rival_type.get('len', 1)
    moves = list()

    if rival_move_type == md.TYPE_0_PASS:
        moves = mg.gen_moves()

    elif rival_move_type == md.TYPE_1_SINGLE:
        all_moves = mg.gen_type_1_single()
        moves = ms.filter_type_1_single(all_moves, rival_move)

    elif rival_move_type == md.TYPE_2_PAIR:
        all_moves = mg.gen_type_2_pair()
        moves = ms.filter_type_2_pair(all_moves, rival_move)

    elif rival_move_type == md.TYPE_3_TRIPLE:
        all_moves = mg.gen_type_3_triple()
        moves = ms.filter_type_3_triple(all_moves, rival_move)

    elif rival_move_type == md.TYPE_4_BOMB:
        all_moves = mg.gen_type_4_bomb() + mg.gen_type_5_king_bomb()
        moves = ms.filter_type_4_bomb(all_moves, rival_move)

    elif rival_move_type == md.TYPE_5_KING_BOMB:
        moves = []

    elif rival_move_type == md.TYPE_6_3_1:
        all_moves = mg.gen_type_6_3_1()
        moves = ms.filter_type_6_3_1(all_moves, rival_move)

    elif rival_move_type == md.TYPE_7_3_2:
        all_moves = mg.gen_type_7_3_2()
        moves = ms.filter_type_7_3_2(all_moves, rival_move)

    elif rival_move_type == md.TYPE_8_SERIAL_SINGLE:
        all_moves = mg.gen_type_8_serial_single(repeat_num=rival_move_len)
        moves = ms.filter_type_8_serial_single(all_moves, rival_move)

    elif rival_move_type == md.TYPE_9_SERIAL_PAIR:
        all_moves = mg.gen_type_9_serial_pair(repeat_num=rival_move_len)
        moves = ms.filter_type_9_serial_pair(all_moves, rival_move)

    elif rival_move_type == md.TYPE_10_SERIAL_TRIPLE:
        all_moves = mg.gen_type_10_serial_triple(repeat_num=rival_move_len)
        moves = ms.filter_type_10_serial_triple(all_moves, rival_move)

    elif rival_move_type == md.TYPE_11_SERIAL_3_1:
        all_moves = mg.gen_type_11_serial_3_1(repeat_num=rival_move_len)
        moves = ms.filter_type_11_serial_3_1(all_moves, rival_move)

    elif rival_move_type == md.TYPE_12_SERIAL_3_2:
        all_moves = mg.gen_type_12_serial_3_2(repeat_num=rival_move_len)
        moves = ms.filter_type_12_serial_3_2(all_moves, rival_move)

    elif rival_move_type == md.TYPE_13_4_2:
        all_moves = mg.gen_type_13_4_2()
        moves = ms.filter_type_13_4_2(all_moves, rival_move)

    elif rival_move_type == md.TYPE_14_4_22:
        all_moves = mg.gen_type_14_4_22()
        moves = ms.filter_type_14_4_22(all_moves, rival_move)

    if rival_move_type not in [md.TYPE_0_PASS,
                               md.TYPE_4_BOMB, md.TYPE_5_KING_BOMB]:
        moves = moves + mg.gen_type_4_bomb() + mg.gen_type_5_king_bomb()

    if len(rival_move) != 0:  # rival_move is not 'pass'
        moves = moves + [[]]

    for m in moves:
        m.sort()

    moves.sort()
    moves = list(move for move, _ in itertools.groupby(moves))

    # Remove Quad with black and red joker
    for i in [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 17]:
        illegal_move = [i]*4 + [20, 30]
        if illegal_move in moves:
            moves.remove(illegal_move)

    return moves


Card2Column = {'3': 0, '4': 1, '5': 2, '6': 3, '7': 4, '8': 5, '9': 6, 'T': 7,
               'J': 8, 'Q': 9, 'K': 10, 'A': 11, '2': 12}

NumOnes2Array = {0: np.array([0, 0, 0, 0]),
                 1: np.array([1, 0, 0, 0]),
                 2: np.array([1, 1, 0, 0]),
                 3: np.array([1, 1, 1, 0]),
                 4: np.array([1, 1, 1, 1])}


def _cards2array(cards):
    if cards == 'pass':
        return np.zeros(54, dtype=np.int8)

    matrix = np.zeros([4, 13], dtype=np.int8)
    jokers = np.zeros(2, dtype=np.int8)
    counter = Counter(cards)
    for card, num_times in counter.items():
        if card == 'B':
            jokers[0] = 1
        elif card == 'R':
            jokers[1] = 1
        else:
            matrix[:, Card2Column[card]] = NumOnes2Array[num_times]
    return np.concatenate((matrix.flatten('F'), jokers))


def _get_one_hot_array(num_left_cards, max_num_cards):
    one_hot = np.zeros(max_num_cards, dtype=np.int8)
    one_hot[num_left_cards - 1] = 1

    return one_hot


def _action_seq2array(action_seq_list):
    action_seq_array = np.zeros((len(action_seq_list), 54), np.int8)
    for row, cards in enumerate(action_seq_list):
        action_seq_array[row, :] = _cards2array(cards)
    action_seq_array = action_seq_array.flatten()
    return action_seq_array


def _process_action_seq(sequence, length=9):
    sequence = [action[1] for action in sequence[-length:]]
    if len(sequence) < length:
        empty_sequence = ['' for _ in range(length - len(sequence))]
        empty_sequence.extend(sequence)
        sequence = empty_sequence
    return sequence


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='DouZero backend')
    parser.add_argument('--debug', action='store_true')
    args = parser.parse_args()
    app.run(debug=args.debug)
