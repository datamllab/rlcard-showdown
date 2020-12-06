# RLCard Showdown
This is the GUI support for the [RLCard](https://github.com/datamllab/rlcard) project. The project provides evaluation and visualization tools to help understand the performance of the agents. Currently, we only support Leduc Hold'em and Dou Dizhu. The frontend is developed using [Node.js](https://nodejs.org/). The backend is based on [Django](https://www.djangoproject.com/). Have fun!

*   Official Website: [http://www.rlcard.org](http://www.rlcard.org)
*   Tutorial in Jupyter Notebook: [https://github.com/datamllab/rlcard-tutorial](https://github.com/datamllab/rlcard-tutorial)
*   Paper: [https://www.ijcai.org/Proceedings/2020/764](https://www.ijcai.org/Proceedings/2020/764)

## Cite this work
If you find this repo useful, you may cite:
```bibtext
@inproceedings{ijcai2020-764,
  title     = {RLCard: A Platform for Reinforcement Learning in Card Games},
  author    = {Zha, Daochen and Lai, Kwei-Herng and Huang, Songyi and Cao, Yuanpu and Reddy, Keerthana and Vargas, Juan and Nguyen, Alex and Wei, Ruzhe and Guo, Junyu and Hu, Xia},
  booktitle = {Proceedings of the Twenty-Ninth International Joint Conference on
               Artificial Intelligence, {IJCAI-20}},
  publisher = {International Joint Conferences on Artificial Intelligence Organization},             
  editor    = {Christian Bessiere},	
  pages     = {5264--5266},
  year      = {2020},
  month     = {7},
  note      = {Demos}
  doi       = {10.24963/ijcai.2020/764},
  url       = {https://doi.org/10.24963/ijcai.2020/764},
}
```

## Installation
RLCard-Showdown has separated frontend and backend. The frontend part is built with React and the backend is with Django.

### Prerequisite
To set up the frontend, you should make sure you have [Node.js](https://nodejs.org/) and NPM installed. Normally you just need to manually install Node.js, and the NPM package would be automatically installed together with Node.js for you. Please refer to its official website for installation of Node.js.

You can run the following commands to verify the installation
```
node -v
npm -v
```
For backend, make sure that you have **Python 3.5+** and **pip** installed.

### Install Frontend and Backend
The frontend can be installed with the help of NPM:
```
git clone https://github.com/datamllab/rlcard-showdown.git
cd rlcard-showdown
npm install
```
The backend can be installed with
```
pip install -r requirements.txt
cd server
python manage.py makemigrations
python manage.py migrate
cd ..
```

### Run RLCard-Showdown
Run the following command under the project folder to start frontend in development mode.
```
npm start
```
Then launch the backend in a new terminal with
```
python manage.py runserver
```
The frontend would be started in port 3000 in localhost by default. You can view it at [http://127.0.0.1:3000/](http://127.0.0.1:3000/). The backend will run by default in [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

More documentation can be found [here](docs/api.md).

### Demos
![leaderboards](https://github.com/datamllab/rlcard-showdown/blob/master/imgs/leaderboards.png?raw=true)
![upload](https://github.com/datamllab/rlcard-showdown/blob/master/imgs/upload.png?raw=true)
![doudizhu-replay](https://github.com/datamllab/rlcard-showdown/blob/master/imgs/doudizhu-replay.png?raw=true)
![leduc-replay](https://github.com/datamllab/rlcard-showdown/blob/master/imgs/leduc-replay.png?raw=true)

### Contact Us
If you have any questions or feedback, feel free to drop an email to [Songyi Huang](mailto:songyih@sfu.ca) for the frontend or [Daochen Zha](http://dczha.com/) for backend.

### Acknowledgements
We would like to thank JJ World Network Technology Co., LTD for the generous support, [Chieh-An Tsai](https://anntsai.myportfolio.com/) for user interface design, and [Lei Pan](mailto:lpa25@sfu.ca) for the help in visualizations.
