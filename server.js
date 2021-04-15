const http = require('http')
const express = require('express')

//serve public folder on port 3000
const app = express()
app.use(express.static('public'))
app.set('port', '3000')

//create server on port 3000
const server = http.createServer(app)
server.on('listening', () => {
    console.log('Listening on port 3000')
})

//create socket to communicate with p5.js and TCP server
const wsock = require('socket.io')(server)

wsock.sockets.on('connection', (socket) => {

    //forward incoming mic data stream
    socket.on('httpData', function(data) {
        // We received data on this connection.
        socket.broadcast.emit('httpServer', data);

    });

})

//start server
server.listen('3000')