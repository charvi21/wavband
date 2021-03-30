var net = require('net');
const io = require("socket.io-client");


// Start the socket connection
const httpsocket = io('http://localhost:3000')


// Start a TCP Server. This is what receives data from the Particle Photon
// https://gist.github.com/creationix/707146
var server = net.createServer(function(socket) {
    console.log('data connection started from ' + socket.remoteAddress);

    // The server sends a 8-bit byte value for each sample. Javascript doesn't really like
    // binary values, so we use setEncoding to read each byte of a data as 2 hex digits instead.
    socket.setEncoding('hex');

    socket.on('data', function(data) {
        console.log('data received')

        httpsocket.emit('httpData', data);
    });

    socket.on('end', function() {
        //socket emit here to signify recorded clip
        console.log('transmission complete');
    });

});

server.listen(8124, function() { //'listening' listener
    console.log('server bound');
    console.log(server.address());
});