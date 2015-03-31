(function(angular) {

    var socketDemo = angular.module('socketDemo', ['ngAnimate', 'btford.socket-io']);

    function MyController($scope, mySocket) {
        $scope.jokes = []
        $scope.tweets = [];
        $scope.connected = false;
        $scope.commentToSubmit = {};
        $scope.comments = [];

        mySocket.on('connect', function() {
            $scope.connected = true;
        })

        mySocket.on('disconnect', function() {
            $scope.connected = false;
        })

        // The server sent down a tweet! Add it to our tweets array.
        mySocket.on('tweetFromServer', function(response) {
            $scope.tweets.unshift(response.data);
        })

        // When a user clicks the "Get Quote" button, emit the event to the server
        $scope.getChuckQuote = function() {
            mySocket.emit('getChuckQuote')
        }

        // The server has sent us a joke. Add it to our jokes array.
        mySocket.on('chuckQuoteFromServer', function(response) {
            $scope.jokes.unshift(response.data.joke)
        })

        // When a user clicks the "post comment" button, add a timestamp and
        // send the data to the server
        $scope.postComment = function() {
            $scope.commentToSubmit.timestamp = Date.now();

            // We have to convert objects into strings before sending them over the socket
            mySocket.emit('commentToServer', JSON.stringify($scope.commentToSubmit))

            $scope.commentToSubmit.body = ""
        }

        // A comment by me or another user has been relayed to me. Add it to our comments array.
        mySocket.on('commentFromServer', function(response) {
            // We have to convert an object from a string into an object after receiving it
            $scope.comments.unshift(JSON.parse(response))
        })

    };

    angular.module('socketDemo').controller('MyController', ['$scope', 'MySocket', MyController])

    // The angular implementation of socket.io. Sets up a socket object as a "factory" that can be
    // used across our application
    function MySocket(socketFactory) {

        return socketFactory({
            ioSocket: io.connect('http://' + document.domain + ':' + location.port + '/my_socket')
        })
    }

    angular.module('socketDemo').factory('MySocket', MySocket)

})(angular);
