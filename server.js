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

const rs = new Readable();
rs._read = () => {} // _read is required but you can noop it

const wsock = require('socket.io')(server)
    // var tcpsock = require('net');

// var tcp_HOST = 'localhost';
// var tcp_PORT = 8124;

wsock.sockets.on('connection', (socket) => {
    // console.log('Client connected: ' + socket.id)
    //socket.on('httpData', (data) => socket.broadcast.emit('httpServer', data))
    // socket.on('disconnect', () => console.log('Client has disconnected'))

    socket.on('httpData', function(data) {
        // We received data on this connection.
        //console.log("got data " + data);
        socket.broadcast.emit('httpServer', data);
        //var buf = Buffer.from(data, 'hex');

        //rs.push(buf);

    });
    // socket.on('end', function() {
    //     console.log('transmission complete, saved to ');
    // });

    // socket.on('tcp-manager', function(message) {
    //     console.log('"tcp" : ' + message);
    //     return;
    // });

    // socket.emit("httpServer", "Initial Data");



})

server.listen('3000')