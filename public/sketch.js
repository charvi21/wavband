// function callAPI() {
//     //call this once every 15ms
//     //get 1024byte size buffer for L and R
//     //make a Sound object out of it
//     //return the object
// }


let socket;


let logo;
let headphonesym;
let batt;
let statusgreen;
let statusred;
const hometext = 'home';
const settingstext = 'settings';
const helptext = 'help';
let font;
let inputcolour;
let outputcolour;
let correctioncolour;
let adjustmentscolour;
const inputtext = 'mic input';
const outputtext = 'output';
let correctionisOn = true;
const correctiontext = 'correction mode';
const adjustmentstext = 'reference signal';
let loggrid;
let band3 = true;
let band8;
let bandtext = 'bands';
let corrON;
let corrOFF;
let corrisON = true;
let eqtext = 'eq';
let band3Pic;
let band8Pic;
let connectedCheck = false;

//slider stuff
let ypos1 = 220;
let ypos2 = 220;
let box;
let ogmousey;
let sliderlength = 180;
let linestarty = 220;
let linestartx = 1240;
let drywetlevel = 180;
const drywettext1 = 'dry/wet';
const drywettext2 = 'mix';
const drywettext3 = '100%';
const drywettext4 = '0%';
const responsetimetext1 = "response";
const responsetimetext2 = "time";
const responsetimetext3 = "10 sec";
const responsetimetext4 = "1 sec";

let lw = 1065;
let lh = 90;
let sx = 120;

let ex = sx + lw;

let ey = 220;
let sy = ey + lh;


let eqLength = 3;
let ref;
const lFreq = 20;
const hFreq = 20000;
let ranges = [];

//let testMicData = new p5.SoundFile();

function preload() {

    logo = loadImage('assets/logo.png');
    headphonesym = loadImage('assets/headphonesym.png');
    batt = loadImage('assets/batt.png');
    statusgreen = loadImage('assets/statusgreen.png');
    statusred = loadImage('assets/statusred.png');

    font = loadFont('assets/abeatbyKaiRegular.otf');

    loggrid = loadImage('assets/loggrid3.png');

    filtered = loadSound('assets/fyatt.wav');
    ref = loadSound('assets/fyatt.wav');
    testMicData = loadSound('assets/fyatt.wav');



    togglebuttON = loadImage('assets/corrON.png');

    togglebuttOFF = loadImage('assets/corrOFF.png');

    band3Pic = loadImage('assets/3band.png');
    band8Pic = loadImage('assets/8band.png');


}

function setup() {

    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.background('white');
    cnv.mouseClicked(togglePlay);

    // cnv.position(80, 150);
    // cnv.parent('canvas-area');

    drawBackground();
    //CHARVI's STUFF

    //    setup test mic data
    fil = new p5.Filter();
    fil.freq(2880);
    fil.gain(-20);
    testMicData.disconnect();
    testMicData.connect(fil);
    fil.disconnect();

    // Start the socket connection
    socket = io('http://localhost:3000')

    // Callback function
    socket.on('httpServer', data => {

        var buf = bops.from(data, 'hex');
        //        var spBuf = Buffer.from(buf, 'hex');

        // The Photon sends up unsigned data for both 8 and 16 bit
        // The wav file format is unsigned for 8 bit and signed two-complement for 16-bit. Go figure.
        for (var ii = 0; ii < buf.length; ii += 2) {
            var unsigned = bops.readUInt16LE(buf, ii);
            var signed = unsigned - 32768;
            bops.writeInt16LE(buf, signed, ii);
        }

        connectedCheck = true;

        let flBuf = Float32Array.from(buf);

        print("BUFFER LENGTH: ", flBuf);
        //print("chris dickinson: ", [flBuf]);

        //just do fft here?
        //create a sound file object, replace testMidData buffer with incoming buffer 
        //testMicData.setBuffer([flBuf]);

        //print(testMicData);


        //      print('GOT DATA BITCHESSS');
    })

    eq = new p5.EQ(eqLength);
    setupEQ();
    filtered.disconnect();
    eq.process(filtered);
    //eq.disconnect();

    fft = new p5.FFT();
    fft.setInput(ref);
    ref.disconnect();
    print(fft);

    fftFiltered = new p5.FFT();
    fftFiltered.setInput(eq);

    fftMic = new p5.FFT();
    fftMic.setInput(testMicData);

}


function setupEQ() {
    let BW = Math.log10(hFreq / lFreq) / eqLength;
    let cfreq = 0;
    let h = 0;
    let l = 0;

    for (let i = 0; i < eqLength; i++) {
        cfreq = pow(10, Math.log10(lFreq) + BW * (i + 0.5));
        eq.bands[i].freq(cfreq);
        print("FREQ: ", cfreq);
        h = pow(10, Math.log10(cfreq) + (BW / 2));
        l = pow(10, Math.log10(cfreq) - (BW / 2));
        ranges.push({ high: h, low: l });

    }

}

function drawBackground() {

    image(logo, 30, 5);
    //image(headphonesym, 1050, 15);
    image(headphonesym, 1145, 15);
    //image(batt, 1125, 15);


    textFont(font);

    //textSize(20);
    //fill(247, 195, 192);
    //text(hometext, 400, 55);
    //stroke(247, 195, 192);
    //strokeWeight(2); // line colour
    //line(400, 70, 475, 70);
    strokeWeight(0); // reset so it doesnt show up on text
    //fill(105, 105, 109);
    //text(settingstext, 575, 55);
    //text(helptext, 775, 55);

    fill(217, 247, 192); //green
    ellipse(470, 155, 20, 20);


    textSize(20);
    fill(105, 105, 109);
    text(inputtext, 140, 163);

    fill(192, 244, 247); //blue
    ellipse(300, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(outputtext, 320, 163);



    //liht purple
    fill(222, 192, 247);
    ellipse(120, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(adjustmentstext, 490, 163);

    //yellow
    fill(255, 230, 0);
    ellipse(730, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(eqtext, 750, 163);

    //button toggle

    textSize(20);
    fill(105, 105, 109);
    text(correctiontext, 910, 163);

    textSize(20);
    fill(105, 105, 109);
    text(bandtext, 100, 505);



}

function draw() {

    if (corrisON == true) {
        togglebuttON.resize(40, 20);
        image(togglebuttON, 855, 145);

    }

    if (corrisON == false) {
        togglebuttOFF.resize(40, 20);
        image(togglebuttOFF, 855, 145);

    }

    if (band3 == true) {
        band3Pic.resize(100, 40);
        image(band3Pic, 180, 480);

    }

    if (band3 == false) {
        band8Pic.resize(100, 40);
        image(band8Pic, 180, 480);

    }

    if (connectedCheck == true) {
        image(statusgreen, 1167.5, 35);
    }
    if (connectedCheck == false) {
        image(statusred, 1167.5, 35);
    }


    if (filtered.isPlaying()) {
        analyzeNodes();
    }

    //background(220);
    //fill(155, 137, 138);
    //placeholders for plots
    rect(100, 175, 1105.76, 285);
    fill('white');

    //tint(250, 240);
    image(loggrid, 100, 175);



    noStroke();
    fill('white');
    rect(linestartx - 15, linestarty, 30, sliderlength + 25);
    fill(155, 137, 138);
    let line = rect(linestartx, linestarty, 2, sliderlength);
    fill(197, 164, 163);
    box = rect(linestartx - 12, ypos1, 25, 10);
    ogmousey = mouseY;
    fill('white');
    //const context = canvas.getContext('2d');
    //context.clearRect(0, 0, canvas.width, canvas.height);

    noStroke();
    fill('white');
    rect(linestartx - 15 + 50, linestarty, 50, sliderlength + 25);
    fill(155, 137, 138);
    line = rect(linestartx + 50, linestarty, 2, sliderlength);
    fill(197, 164, 163);
    let box2 = rect(linestartx - 12 + 50, ypos2, 25, 10);
    ogmousey = mouseY;
    fill('white');
    //const context = canvas.getContext('2d');
    //context.clearRect(0, 0, canvas.width, canvas.height);

    textSize(10);
    fill(105, 105, 109);
    text(drywettext1, 1220, 185);
    textSize(10);
    fill(105, 105, 109);
    text(drywettext2, 1230, 195);
    textSize(10);
    fill(105, 105, 109);
    text(drywettext3, 1230, 215);
    textSize(10);
    fill(105, 105, 109);
    text(drywettext4, 1235, 235 + sliderlength);

    textSize(10);
    fill(105, 105, 109);
    text(responsetimetext1, 1270, 185);
    textSize(10);
    fill(105, 105, 109);
    text(responsetimetext2, 1280, 195);
    textSize(10);
    text(responsetimetext3, 1270, 215);
    textSize(10);
    fill(105, 105, 109);
    text(responsetimetext4, 1280, 235 + sliderlength);

    fill('white');
}



function togglePlay() {


    if (mouseY >= 165 && mouseY <= 465 && mouseX >= 100 && mouseX <= 1200) {
        if (getAudioContext().state !== 'running') {
            getAudioContext().resume();
        }

        if (testMicData.isPlaying()) {
            filtered.pause();
            ref.pause();
            testMicData.pause();
        } else {
            filtered.loop();
            ref.loop();
            testMicData.play();
        }
    }

    if (mouseY <= 160 && mouseY >= 140 && mouseX >= 850 && mouseX <= 900) {
        if (corrisON == true) {

            corrisON = false;
            // print("bool is now false ", corrisON);
        } else {
            corrisON = true;
            //print("bool is now true ", corrisON);
        }
    }

    if (mouseY >= 465 && mouseY <= 550) {
        if (band3 == true) {

            band3 = false;
            // print("bool is now false ", corrisON);
        } else {
            band3 = true;
            //print("bool is now true ", corrisON);
        }
    }

}

function analyzeNodes() {
    //delay(10ms here)

    let refFFT = fft.analyze("dB");

    let filteredFFT = fftFiltered.analyze("dB");
    let micDataFFT = fftMic.analyze("dB");

    drawSignals(refFFT, filteredFFT, micDataFFT);

    var vals = [0, 0, 0];
    var gains = [0, 0, 0];
    var low = 0;
    var high = 0;

    for (var i = 0; i < eqLength; i++) {

        low = ranges[i].low;
        high = ranges[i].high;

        let refEnergy = fft.getEnergy(low, high);
        let micEnergy = fftMic.getEnergy(low, high);

        // print("REF ENERGY: ", refEnergy);
        // print("MIC ENERGY: ", micEnergy);

        //        let gain = 0;

        // if (micEnergy == Infinity || micEnergy == -Infinity) {
        //     micEnergy = refEnergy;
        // }

        let gain = refEnergy - micEnergy;
        if (isNaN(gain) || gain == Infinity || gain == -Infinity) {
            gain = 0;
        }

        vals[i] = gain;
        gains[i] = gain;
        //gains[i] = eq.bands[i].gain();
    }
    //    print("Vals: ", vals);
    print("Gains: ", gains);

    adjustFilterGains(vals);
}

function adjustFilterGains(vals) {
    //gonna get 3 vals, compare each val to 0
    //if < 0 then reduce gain (ref-mic)
    //if > 0 then increase gain
    //if within 5% of 0, don't change gain

    for (var i = 0; i < eqLength; i++) {

        eq.bands[i].gain(vals[i]);

    }

}

function drawSignals(refFFT, filteredFFT, micDataFFT) {

    //draw micData signal
    noStroke();
    fill(222, 192, 247);
    let px = map(0, 0, Math.log10(micDataFFT.length), sx, ex);
    let py = map(micDataFFT[0], -140, 0, sy, ey);
    ellipse(px, py, 5);

    for (let i = 1; i <= micDataFFT.length; i++) {

        if (i < 5 || i % 50 == 0) {
            let x = map(Math.log10(i), 0, Math.log10(micDataFFT.length), sx, ex);
            let h = map(micDataFFT[i], -140, 0, sy, ey);

            ellipse(x, h, 5);

            stroke(222, 192, 247);
            strokeWeight(3);
            line(px, py, x, h);

            px = x;
            py = h;

        }
    }


    print("BUFFER L: ", refFFT.length);


    //draw filtered signal
    noStroke();
    fill(192, 244, 247);
    px = map(0, 0, Math.log10(filteredFFT.length), sx, ex);
    py = map(filteredFFT[0], -140, 0, sy, ey);
    ellipse(px, py, 5);

    for (let i = 1; i <= filteredFFT.length; i++) {
        if (i < 5 || i % 50 == 0) {
            let x = map(Math.log10(i), 0, Math.log10(filteredFFT.length), sx, ex);
            let h = map(filteredFFT[i], -140, 0, sy, ey);

            ellipse(x, h, 5);

            stroke(192, 244, 247);
            strokeWeight(3);
            line(px, py, x, h);

            px = x;
            py = h;
        }
    }

    //draw ref signal
    noStroke();
    fill(217, 247, 192);
    px = map(0, 0, Math.log10(refFFT.length), sx, ex);
    py = map(refFFT[0], -140, 0, sy, ey);
    ellipse(px, py, 5);

    for (let i = 1; i <= refFFT.length; i++) {
        if (i < 5 || i % 50 == 0) {
            let x = map(Math.log10(i), 0, Math.log10(refFFT.length), sx, ex);
            let h = map(refFFT[i], -140, 0, sy, ey);

            ellipse(x, h, 5);

            stroke(217, 247, 192);
            strokeWeight(3);
            line(px, py, x, h);

            px = x;
            py = h;
        }
    }

    //draw the eq
    //get bin of freq

    //n = ceil(f*2048/samplingRate())
    //3 frequencies, map (n, 0, 1024, sx, ex);
    //map (gain, -140,140, sy, ey);
    //
}

function mouseDragged() {


    if (mouseY >= (sliderlength + linestarty)) { mouseY = (linestarty + sliderlength); } else if (mouseY <= linestarty) { mouseY = linestarty; } else {
        if (mouseX >= (linestartx + 50)) {
            ypos2 = mouseY;
            ypos1 = ypos1;
        } else { ypos1 = mouseY; }

    }


}