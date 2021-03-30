// Run this like:
// node audioserver.js
//
// Requires wav https://github.com/TooTallNate/node-wav
// npm install wav 

var fs = require('fs');
var path = require('path');
var net = require('net');
var wav = require('wav');
const { Readable } = require('stream');
const io = require("socket.io-client");


// If changing the sample frequency in the Particle code, make sure you change this!
var wavOpts = {
    'channels': 1,
    'sampleRate': 48000,
    'bitDepth': 16
};


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
        httpsocket.emit('endAudio');
    });

});

server.listen(8124, function() { //'listening' listener
    console.log('server bound');
    console.log(server.address());
});