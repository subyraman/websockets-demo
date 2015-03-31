# To get this to work, run "sudo pip install -r requirements.txt" and use socket-io version < 1.0 in the client

from gevent import monkey
monkey.patch_all()

import time
import json
import random
from threading import Thread
import requests
from flask import Flask, render_template, session, request, make_response
from flask.ext.socketio import SocketIO, emit


app = Flask(__name__)
app.config['DEBUG'] = True
socketio = SocketIO(app)

thread = None

tweets = json.load(file('tweets.json'))


def background_thread():
    # Return a Hipster Hacker tweet every 10 seconds
    while True:
        time.sleep(10)
        tweet = random.choice(tweets)
        socketio.emit('tweetFromServer', {'data': tweet}, namespace='/my_socket')


@app.route('/')
def index():
    global thread
    if thread is None:
        thread = Thread(target=background_thread)
        thread.start()

    return make_response(file('templates/index.html').read())


@socketio.on('getChuckQuote', namespace='/my_socket')
def get_chuck_quote():
    r = requests.get('http://api.icndb.com/jokes/random')
    quote = r.json()
    emit('chuckQuoteFromServer', {'data': quote['value']})


@socketio.on('commentToServer', namespace='/my_socket')
def comment_to_server(data):
    emit('commentFromServer', data)


if __name__ == '__main__':
    socketio.run(app, port=9000)
