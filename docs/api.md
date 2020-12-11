# API Documentation

## Changing the Configuration of Frontend

The default configuration for backend server URL is [http://127.0.0.1:8000/](http://127.0.0.1:8000/), you can also change it in `/src/utils/config.js`.

You will see blank tables on the frontend if you haven't started the backend Django server, or the backend server URL is configured incorrectly.

## REST API of Backend
The definitions of the fields are as follows:
*   `eval_num`: Integer. The number of evaluation times.
*   `name`: String. The name of the environment.
*   `agent0`: String. Model name.
*   `agent1`: String. Model name.
*   `win`: Boolean. True if model in the first seat wins.
*   `payoff`: Float. The payoff of the agent in the first seat.
*   `index`: Integer. The index of the game of the same environent and same agent. It is in the range \[0, eval_num-1\]

| type | Resource                            |  Parameters                                                                               |  Description                                                                                                       |
|------|-------------------------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| GET  | tournament/launch                   | `eval_num`, `name`                                                                        | Launch tournment on the game. Each pair of models will play `eval_num` times. Results will be saved in database.   |
| GET  | tournament/query\_game              | `name`, `index`, `agent0`, `agent1`, `win`, `payoff`, `elements_every_page`, `page_index` | Query the games with the given parameters                                                                          |
| GET  | tournament/query\_payoff            | `name`, `agent0`, `agent1`, `payoff`                                                      | Query the payoffs with the given parameters                                                                        |
| GET  | tournament/query\_agent\_payoff     | `name`, `elements_every_page`, `page_index`,                                              | Query the payoffs of all the agents                                                                                |
| GET  | tournament/replay                   | `name`, `agent0`, `agent1`, `index`                                                       | Return the replay data                                                                                             |
| POST | tournament/upload\_agent            | `model`(Python file), `name`, `game`, `entry`                                             | Upload a model file. `name` is model ID, `entry` is the class name of the model                                    |
| GET  | tournament/delete\_agent            | `name`                                                                                    | Delete the agent of the given name                                                                                 |
| GET  | tournament/list\_uploaded\_agents   | `game`                                                                                    | list all the uploaded agents                                                                                       |
| GET  | tournament/list\_baseline\_agents   | `game`                                                                                    | list all the baseline agents                                                                                       |
| GET  | download\_examples                  | `name`                                                                                    | download the example agents                                                                                        |

### Example API
| API                                                                                                                                      | Description                                                                              |
|------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| http://127.0.0.1:8000/tournament/launch?eval\_num=200&name=leduc-holdem                                                                  | Evaluate on Leduc Holdem with 200 games for each pair of models                          |
| http://127.0.0.1:8000/tournament/replay?name=leduc-holdem&agent0=leduc-holdem-rule-v1&agent1=leduc-holdem-cfr&index=3                    | Obtain the replay data between rule model and CFR model. Obtain the data of the 3rd game |
| http://127.0.0.1:8000/tournament/query\_game&elements\_every\_page=10&page\_index=0                                                      | Get all the game data                                                                    |
| http://127.0.0.1:8000/tournament/query\_game?name=leduc-holdem&elements\_every\_page=10&page\_index=0                                    | Get all the game data of Leduc Holdem                                                    |
| http://127.0.0.1:8000/tournament/query\_payoff                                                                                           | Get all the payoffs                                                                      |
| http://127.0.0.1:8000/tournament/query\_payoff?agent0=leduc-holdem-cfr&agent1=leduc-holdem-rule-v1                                       | Get all the payoffs between rule and CFR models                                          |
| http://127.0.0.1:8000/tournament/query\_agent\_payoff?name=leduc-holdem&elements\_every\_page=1&page\_index=1                            | Get the payoffs of all the agents of leduc-holdem                                        |
| http://127.0.0.1:8000/tournament/list\_uploaded\_agents?game=leduc-holdem                                                                | List the uploaded agents of leduc-holdem                                                 |
| http://127.0.0.1:8000/tournament/list\_baseline\_agents?game=leduc-holdem                                                                | List the baseline agents of leduc-holdem                                                 |
| http://127.0.0.1:8000/tournament/download\_examples?name=example\_luduc\_nfsp\_model                                                     | Download the NFSP example model for Leduc Hold'em                                        |

## Registered Models
Some models have been pre-registered as baselines
| Model                | Game         | Description                           |
|----------------------|--------------|---------------------------------------|
| leduc-holdem-random  | leduc-holdem | A random model                        |
| leduc-holdem-cfr     | leduc-holdem | Pre-trained CFR model on Leduc Holdem |
| leduc-holdem-rule-v1 | leduc-holdem | A rule model that plays greedily      |
| doudizhu-random      | doudizhu     | A random model                        |
| doudizhu-rule-v1     | doudizhu     | Dou Dizhu rule model                  |

### Example of uploading a new model
A example model file is prepared:
```
cd server/upload_test
```
Upload the model with `curl`:
```
curl -F 'model=@example_model.py' -F "name=leduc-new" -F "entry=LeducHoldemRuleModelV2" -F "game=leduc-holdem" http://127.0.0.1:8000/tournament/upload_agent
```
Launch the tounament with:
```
curl 'http://127.0.0.1:8000/tournament/launch?eval_num=200&name=leduc-holdem'
```
We list the uploaded agent with
```
curl http://127.0.0.1:8000/tournament/list_uploaded_agents
```
We can delete the agent with
```
curl 'http://127.0.0.1:8000/tournament/delete_agent?name=leduc-new'
```

