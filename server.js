const http = require('http')
const express = require('express')

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
        socket.broadcast.emit('httpServer', data);

    });

})

server.listen('3000')