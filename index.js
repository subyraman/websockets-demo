// load in the modules we need to get socket.io up and running
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// other modules used for convenience
var request = require('request');
var path = require('path');
var q = require('q');
var _ = require('lodash');

// an array of pre-downloaded tweets
var tweets = require('./tweets.json');

// set up directory for static files
app.use(express.static(path.join(__dirname, '')));

// send down index.html for the root URL
app.get('/', function(req, res){
  res.sendFile(__dirname + '/templates/index.html');
});

// establish our namespace (a pool of sockets) with name 'my_socket'
var namespace = io.of('/my_socket');

namespace.on('connection', function(socket) {
  // Inside the connection event, the "socket" arg represents a unique client

  console.log("New client joined with id: " + socket.id)
  console.log("Number of users: " + _.keys(namespace.connected).length) 

  socket.on('getChuckQuote', function() {
    chuckNorrisApiCall()
      .then(function(quote) {
        socket.emit('chuckQuoteFromServer', {data: quote.value});
    });
  });

  // When a user posts a comment, relay that to all users
  socket.on('commentToServer', function(data) {
    namespace.emit('commentFromServer', data);
  });
});

// Broadcast a Hipster Hacker tweet to all clients every 10 seconds
setInterval(function() {
  var tweet = _.sample(tweets);
  namespace.emit('tweetFromServer', {data: tweet});
}, 10000);


function chuckNorrisApiCall() {
  var deferred = q.defer();

  request.get('http://api.icndb.com/jokes/random', function(error, response, body) {
      var quote = JSON.parse(body);
      deferred.resolve(quote);    
    });

  return deferred.promise;
}


http.listen(9000, function(){
  console.log('listening on *:9000');
});