**NOTE: This project is under final tesing. The one in the repo only supports the visualization of some sampled data. The full version will be available soon!**

# Django Server
## Server Setup
Install dependencies:
```
pip install -r requirements.txt
```
Migrate the databases:
```
cd server
python manage.py makemigrations
python manage.py migrate
```
Run server:
```
python manage.py runserver
```
The default URL is [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## REST API
The definitions of the fields are as follows:
*   `eval_num`: Integer. The number of evaluation times.
*   `name`: String. The name of the environment.
*   `agent0`: String. Model name.
*   `agent1`: String. Model name.
*   `win`: Boolean. True if model in the first seat wins.
*   `payoff`: Float. The payoff of the agent in the first seat.
*   `index`: Integer. The index of the game of the same environent and same agent. It is in the range \[0, eval_num-1\]

| type | Resource                  |  Parameters                                          |  Description                                                                                                       |
|------|---------------------------|------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| GET  | tournament/launch         | `eval_num`, `name`                                                                        | Launch tournment on the game. Each pair of models will play `eval_num` times. Results will be saved in database.   |
| GET  | tournament/query\_game    | `name`, `index`, `agent0`, `agent1`, `win`, `payoff`, `elements_every_page`, `page_index` | Query the games with the given parameters                                                                          |
| GET  | tournament/query\_payoff  | `name`, `agent0`, `agent1`, `payoff`                                                      | Query the payoffs with the given parameters                                                                        |
| GET  | tournament/replay         | `name`, `agent0`, `agent1`, `index`                                                       | Return the replay data                                                                                             |
| POST | tournament/upload\_agent  | `model`(Python file), `name`, `game`, `entry`                                             | Upload a model file. `name` is model ID, `entry` is the class name of the model                                    |
| GET  | tournament/delete\_agent  | `name`                                                                                    | Delete the agent of the given name                                                                                 |
| GET  | tournament/list\_agents   |                                                                                           | list all the agents                                                                                                |

## Example API
| API                                                                                                                   | Description                                                                              |
|-----------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| http://127.0.0.1:8000/tournament/launch?eval_num=200&name=leduc-holdem                                                                   | Evaluate on Leduc Holdem with 200 games for each pair of models                          |
| http://127.0.0.1:8000/tournament/replay?name=leduc-holdem&agent0=leduc-holdem-rule-v1&agent1=leduc-holdem-cfr                   &index=3 | Obtain the replay data between rule model and CFR model. Obtain the data of the 3rd game |
| http://127.0.0.1:8000/tournament/query_game&elements_every_page=10&page_index=0                                                          | Get all the game data                                                                    |
| http://127.0.0.1:8000/tournament/query_game?name=leduc-holdem&elements_every_page=10&page_index=0                                        | Get all the game data of Leduc Holdem                                                    |
| http://127.0.0.1:8000/tournament/query_payoff                                                                                            | Get all the payoffs                                                                      |
| http://127.0.0.1:8000/tournament/query_payoff?agent0=leduc-holdem-cfr&agent1=leduc-holdem-rule-v1                                        | Get all the payoffs between rule and CFR models                                          |

## Registered Models
Some models have been pre-registered as baselines
| Model                | Game         | Description                           |
|----------------------|--------------|---------------------------------------|
| leduc-holdem-random  | leduc-holdem | A random model                        |
| leduc-holdem-cfr     | leduc-holdem | Pre-trained CFR model on Leduc Holdem |
| leduc-holdem-rule-v1 | leduc-holdem | A rule model that plays greedily      |
| doudizhu-random      | doudizhu     | A random model                        |
| doudizhu-rule-v1     | doudizhu     | Dou Dizhu rule model                  |

## Example of uploading a new model
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
curl http://127.0.0.1:8000/tournament/list_agents
```
We can delete the agent with
```
curl 'http://127.0.0.1:8000/tournament/delete_agent?name=leduc-new'
```


# Others
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
