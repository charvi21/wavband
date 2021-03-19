const http = require('http')
const express = require('express')
const { Readable } = require('stream');

const app = express()
app.use(express.static('public'))

app.set('port', '3000')

const server = http.createServer(app)
server.on('listening', () => {
    console.log('Listening on port 8124')
})

const rs = new Readable();
rs._read = () => {} // _read is required but you can noop it

const io = require('socket.io')(server)

io.sockets.on('connection', (socket) => {
    console.log('Client connected: ' + socket.id)
        //socket.on('mouse', (data) => socket.broadcast.emit('mouse', data))
    socket.on('disconnect', () => console.log('Client has disconnected'))

    socket.on('data', function(data) {
        // We received data on this connection.
        console.log("got data " + typeof(data));
        //var buf = Buffer.from(data, 'hex');

        //rs.push(buf);

    });
    socket.on('end', function() {
        console.log('transmission complete, saved to ');
    });



})

server.listen('3000')