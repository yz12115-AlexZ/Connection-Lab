//Initialize the express 'app' object
let express = require('express');
let app = express();
app.use('/', express.static('public'));

//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, function() {
    console.log("Server listening at port: " + port);
});

//Initialize socket.io
let io = require('socket.io');
io = new io.Server(server);

//Listen for individual clients/users to connect
io.sockets.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);

    //Listen for a message named 'chat message' from this client
    socket.on('chat message', function(data) {
        //Data can be numbers, strings, objects
        console.log("Received a 'chat message' event");
        console.log(data);

        //Send a response to all clients, including this one
        io.sockets.emit('chat message', data);

        //Send a response to all other clients, not including this one
        // socket.broadcast.emit('chat message', data);

        //Send a response to just this client
        // socket.emit('chat message', data);
    });

    //Listen for this client to disconnect
    socket.on('disconnect', function() {
        console.log("A client has disconnected: " + socket.id);
    });
});

