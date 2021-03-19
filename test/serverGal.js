// Run this like:
// node audioserver.js
//
// Requires wav https://github.com/TooTallNate/node-wav
// npm install wav 

var fs = require('fs');
var path = require('path');
var net = require('net');
const portAudio = require('naudiodon');
const { Readable } = require('stream');


// const { Readable } = require('stream');

// For this simple test, just create wav files in the "out" directory in the directory
// where audioserver.js lives.
var outputDir = path.join(__dirname, "out");

//var dataPort = 7123; // this is the port to listen on for data from the Photon

// If changing the sample frequency in the Particle code, make sure you change this!
var wavOpts = {
    'channels': 1,
    'sampleRate': 44100,
    'bitDepth': 8
};


// Output files in the out directory are of the form 00001.wav. lastNum is used 
// to speed up scanning for the next unique file.
var lastNum = 0;

// Create the out directory if it does not exist
try {
    fs.mkdirSync(outputDir);
} catch (e) {}


function formatName(num) {
    var s = num.toString();

    while (s.length < 5) {
        s = '0' + s;
    }
    return s + '.wav';
}

function getUniqueOutputPath() {
    for (var ii = lastNum + 1; ii < 99999; ii++) {
        var outPath = path.join(outputDir, formatName(ii));
        try {
            fs.statSync(outPath);
        } catch (e) {
            // File does not exist, use this one
            lastNum = ii;
            return outPath;
        }
    }
    lastNum = 0;
    return "00000.wav";
}


var os = require('os');


//console.log(networkInterfaces);

const rs = new Readable();
rs._read = () => {} // _read is required but you can noop it

// Create an instance of AudioIO with outOptions (defaults are as below), which will return a WritableStream
var ao = new portAudio.AudioIO({
    outOptions: {
        channelCount: 1,
        sampleFormat: portAudio.SampleFormat8Bit,
        sampleRate: 44100,
        deviceId: -1, // Use -1 or omit the deviceId to select the default device
        closeOnError: false // Close the stream if an audio error is detected, if set false then just log the error
    }
});
// handle errors from the AudioOutput
ao.on('error', err => console.error);

ao.start();

var server = net.createServer(function(c) { //'connection' listener
    console.log('server connected');

    console.log('data connection started from ' + c.remoteAddress);

    // The server sends a 8-bit byte value for each sample. Javascript doesn't really like
    // binary values, so we use setEncoding to read each byte of a data as 2 hex digits instead.
    c.setEncoding('hex');

    var outPath = getUniqueOutputPath();

    c.on('data', function(data) {
        // We received data on this connection.
        //console.log("got data " + typeof(data));
        var buf = Buffer.from(data, 'hex');

        rs.push(buf);

    });
    c.on('end', function() {
        console.log('transmission complete, saved to ' + outPath);
        //        rs.push(null);

        rs.pipe(ao);
        //  ao.start();

        //rs.on('end', () => ao.end());

    });
});



server.listen(8124, function() { //'listening' listener
    console.log('server bound');
    console.log(server.address());
});