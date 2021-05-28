# RLCard Showdown
This is the GUI support for the [RLCard](https://github.com/datamllab/rlcard) project and DouZero project. The project provides evaluation and visualization tools to help understand the performance of the agents. Currently, we only support Leduc Hold'em and Dou Dizhu. The frontend is developed with [React](https://reactjs.org/). The backend is based on [Django](https://www.djangoproject.com/) and [Flask](https://flask.palletsprojects.com/). Have fun!

*   Official Website: [http://www.rlcard.org](http://www.rlcard.org)
*   Tutorial in Jupyter Notebook: [https://github.com/datamllab/rlcard-tutorial](https://github.com/datamllab/rlcard-tutorial)
*   Paper: [https://www.ijcai.org/Proceedings/2020/764](https://www.ijcai.org/Proceedings/2020/764)
*   Document: [Click Here](docs/README.md)

## Cite this work
Zha, Daochen, Kwei-Herng Lai, Songyi Huang, Yuanpu Cao, Keerthana Reddy, Juan Vargas, Alex Nguyen, Ruzhe Wei, Junyu Guo, and Xia Hu. "RLCard: A Platform for Reinforcement Learning in Card Games." In IJCAI. 2020.

```bibtex
@inproceedings{zha2020rlcard,
  title={RLCard: A Platform for Reinforcement Learning in Card Games},
  author={Zha, Daochen and Lai, Kwei-Herng and Huang, Songyi and Cao, Yuanpu and Reddy, Keerthana and Vargas, Juan and Nguyen, Alex and Wei, Ruzhe and Guo, Junyu and Hu, Xia},
  booktitle={IJCAI},
  year={2020}
}
```

## Installation
RLCard-Showdown has separated frontend and backend. The frontend is built with React and the backend is based on Django and Flask.

### Prerequisite
To set up the frontend, you should make sure you have [Node.js](https://nodejs.org/) and NPM installed. Normally you just need to manually install Node.js, and the NPM package would be automatically installed together with Node.js for you. Please refer to its official website for installation of Node.js.

You can run the following commands to verify the installation
```
node -v
npm -v
```
For backend, make sure that you have **Python 3.6+** and **pip** installed.

### Install Frontend and Backend
The frontend can be installed with the help of NPM:
```
git clone -b master --single-branch --depth=1 https://github.com/datamllab/rlcard-showdown.git
cd rlcard-showdown
npm install
```
The backend of leaderboard can be installed with
```
pip3 install -r requirements.txt
cd server
python3 manage.py migrate
cd ..
```

### Run RLCard-Showdown
1. Launch the backend of leaderboard with
```
cd server
python3 manage.py runserver
```
2. In a new terminal, start the PvE server (i.e., human vs AI) of DouZero with
```
cd pve_server
python3 run_douzero.py
```
3. Run the following command in another new terminal under the project folder to start frontend:
```
npm start
```
You can view leaderboard at [http://127.0.0.1:3000/](http://127.0.0.1:3000/) and PvE demo of Dou Dizhu at [http://127.0.0.1:3000/pve/doudizhu-demo](http://127.0.0.1:3000/pve/doudizhu-demo). The backend of leaderboard will run in [http://127.0.0.1:8000/](http://127.0.0.1:8000/). The PvE backend will run in [http://127.0.0.1:5000/](http://127.0.0.1:5000/).

More documentation can be found [here](docs/api.md). User guide is [here](docs/guide.md).

## Demos
![leaderboards](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/leaderboards.png?raw=true)
![upload](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/upload.png?raw=true)
![doudizhu-replay](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/doudizhu-replay.png?raw=true)
![leduc-replay](https://github.com/datamllab/rlcard-showdown/blob/master/docs/imgs/leduc-replay.png?raw=true)

## Contact Us
If you have any questions or feedback, feel free to drop an email to [Songyi Huang](https://github.com/hsywhu) for the frontend or [Daochen Zha](https://github.com/daochenzha) for backend.

## Acknowledgements
We would like to thank JJ World Network Technology Co., LTD for the generous support, [Chieh-An Tsai](https://anntsai.myportfolio.com/) for user interface design, and [Lei Pan](https://github.com/lpan18) for the help in visualizations.
