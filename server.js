const http = require('http')
const express = require('express')
const { Readable } = require('stream');

const app = express()
app.use(express.static('public'))

app.set('port', '3000')

const server = http.createServer(app)
server.on('listening', () => {
    console.log('Listening on port 3000')
})


const wsock = require('socket.io')(server)

wsock.sockets.on('connection', (socket) => {

    socket.on('httpData', function(data) {
        // We received data on this connection.
        //console.log("got data " + data);
        socket.broadcast.emit('httpServer', data);

    });

    socket.on('endAudio', function() {
        console.log('transmission complete');
        socket.broadcast.emit('serverEnd');
    });

})

server.listen('3000')