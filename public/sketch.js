// setup ui variables
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
const legend1 = "0 db";
const legend2 = '0 norm.';

// setup slider variables
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
let ey = 190;
let sy = 425;

// setup EQ filter variables
let eqLength = 8;
let ref;
const lFreq = 20;
const hFreq = 20000;
let ranges = [];
let cFreqs = [];
var gains = [0, 0, 0, 0, 0, 0, 0, 0];

// setup steady state variables
var steadyStateErrors = [];
var steadyStateTimes = [];
let store = true;

// setup socket connection
let socket;
// setup global variable for incoming mic data
let micDataGlobal = new Array();

// preload assets (photos, .wav files)
function preload() {

    // load images
    logo = loadImage('assets/logo.png');
    headphonesym = loadImage('assets/headphonesym.png');
    batt = loadImage('assets/batt.png');
    statusgreen = loadImage('assets/statusgreen.png');
    statusred = loadImage('assets/statusred.png');
    loggrid = loadImage('assets/loggrid3.png');
    togglebuttON = loadImage('assets/corrON.png');
    togglebuttOFF = loadImage('assets/corrOFF.png');

    // load font
    font = loadFont('assets/abeatbyKaiRegular.otf');

    // load test song
    filtered = loadSound('assets/imma.wav');
    ref = loadSound('assets/imma.wav');
    testMicData = loadSound('assets/char.wav');
    //LOAD WALKING SOUND TO CORRECT FOR 10x10FT room requirement
    //testMicData = loadSound('assets/walkingmic.wav');



}

// runs once before draw()
function setup() {

    //create canvas
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.background('white');
    cnv.mouseClicked(togglePlay);
    noStroke();

    //draw UI background
    drawBackground();

    // Start the socket connection
    socket = io('http://localhost:3000')

    // Callback function
    socket.on('httpServer', data => {

        // if the song is playing, receive data, 
        // perform FFT and set to global mic data var
        if (filtered.isPlaying()) {
            var buf = bops.from(data, 'hex');

            var bufAr = Array.from(buf);
            var ip = resizeArray(bufAr, 1024);

            for (var i = 0; i < buf.length; i++) {
                ip[i] = bufAr[i];
            }

            var fftMic = new p5.FastFourierTransform(1024, 20000, 1024);
            fftMic.doFrequency = true;

            fftMic.forward(ip);

            //could use MAGNITUDE
            var op = fftMic.real;

            //kill the DC gain
            op[0] = 0;

            let min = Math.min(...op);
            let max = Math.max(...op);

            //normalize to 0 to 255 
            for (var i = 0; i < op.length; i++) {
                op[i] = norm(op[i], min, max) * 255;
            }

            micDataGlobal = op;
        }
    })

    // setup EQ for filtered audio
    eq = new p5.EQ(eqLength);
    setupEQ(eq);
    filtered.disconnect();
    eq.process(filtered);

    //setup EQ for emulated mic data
    eqMic = new p5.EQ(eqLength);
    setupEQ(eqMic);
    testMicData.disconnect();
    eqMic.process(testMicData);
    eqMic.disconnect();

    // setup FFT object for ref audio
    fft = new p5.FFT();
    fft.setInput(ref);
    ref.disconnect();

    // setup FFT object for filtered audio
    fftFiltered = new p5.FFT();
    fftFiltered.setInput(eq);

    // setup FFT object for mic audio
    fftMic = new p5.FFT();
    fftMic.setInput(eqMic);

}

// custom function to get average amplitude for each freq. band
// only used with photon mic data
// not updated for 8 bands
function getAverage(op, band) {

    let sum = 0;

    if (band == 0) {
        ind1 = 1;
        ind2 = 11;
    }

    if (band == 1) {
        ind1 = 11;
        ind2 = 103;
    }

    if (band == 2) {
        ind1 = 103;
        ind2 = 1024;
    }

    for (let i = ind1; i < ind2; i++) {
        sum = sum + op[i];
    }

    let av = sum / (ind2 - ind1);

    return av
}

// function to set the low freq., high freq, and center freq. for each band
function setupEQ(obj) {
    let BW = Math.log10(hFreq / lFreq) / eqLength;
    let cfreq = 0;
    let h = 0;
    let l = 0;

    for (let i = 0; i < eqLength; i++) {
        cfreq = pow(10, Math.log10(lFreq) + BW * (i + 0.5));
        obj.bands[i].freq(cfreq);
        cFreqs[i] = cfreq;
        h = pow(10, Math.log10(cfreq) + (BW / 2));
        l = pow(10, Math.log10(cfreq) - (BW / 2));
        ranges.push({ high: h, low: l });

    }
}

// function to draw background
function drawBackground() {

    image(logo, 30, 5);
    image(headphonesym, 1145, 15);

    textFont(font);

    strokeWeight(0); // reset so it doesnt show up on text

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

    //light purple
    fill(222, 192, 247);
    ellipse(120, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(adjustmentstext, 490, 163);

    //yellow
    fill(255, 230, 0);
    ellipse(730, 155, 20, 20);
    noStroke();

    textSize(20);
    fill(105, 105, 109);
    text(eqtext, 750, 163);

    //button toggle
    textSize(20);
    fill(105, 105, 109);
    text(correctiontext, 910, 163);

    textSize(10);
    fill(105, 105, 109);
    text(drywettext1, 1220, 185);
    textSize(10);
    fill(105, 105, 109);
    text(drywettext2, 1230, 195);
    textSize(10);
    fill(105, 105, 109);
    text(drywettext3, 1230, 215);




}

// draw() runs at 60frames/s 
function draw() {

    // UI for correction mode on
    if (corrisON == true) {
        togglebuttON.resize(40, 20);
        image(togglebuttON, 855, 145);

        noStroke();
        fill('white');
        rect(linestartx - 15, linestarty, 30, sliderlength + 25);
        fill(155, 137, 138);
        rect(linestartx, linestarty, 2, sliderlength);
        fill(197, 164, 163);
        box = rect(linestartx - 12, ypos1, 25, 10);
        ogmousey = mouseY;
        fill('white');
        noStroke();

    }

    // UI for correction mode off
    if (corrisON == false) {
        togglebuttOFF.resize(40, 20);
        image(togglebuttOFF, 855, 145);

        noStroke();
        fill('white');
        rect(linestartx - 15, linestarty, 30, sliderlength + 25);
        fill(155, 137, 138);
        rect(linestartx, linestarty, 2, sliderlength);
        fill(197, 164, 163);
        box = rect(linestartx - 12, sliderlength + ypos1 - 10, 25, 10);
        ogmousey = mouseY;
        fill('white');
        //noStroke();
        textSize(10);
        fill(105, 105, 109);
        text(drywettext4, 1235, sliderlength + 235);
        fill('white');

    }

    image(statusgreen, 1167.5, 35);


    //plot background
    rect(100, 175, 1105.76, 285);
    fill('white');

    //tint(250, 240);
    image(loggrid, 100, 175);


    //if the sound is playing, then analyze nodes
    if (filtered.isPlaying()) {
        analyzeNodes();
    }

    //redraw the plot every time to avoid stacking 
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

    textSize(8.5);
    fill(255, 230, 0);
    text(legend1, 110, 295);

    textSize(8.5);
    fill(232, 198, 194);
    text(legend2, 110, 420);

    fill('white');

}

// if user presses on plot, the song will toggle between play and pause
function togglePlay() {


    if (mouseY >= 165 && mouseY <= 465 && mouseX >= 100 && mouseX <= 1200) {
        if (getAudioContext().state !== 'running') {
            getAudioContext().resume();
        }

        if (filtered.isPlaying()) {
            filtered.pause();
            ref.pause();
            testMicData.pause();
        } else {
            filtered.loop();
            ref.loop();
            testMicData.loop();
        }
    }

    if (mouseY <= 160 && mouseY >= 140 && mouseX >= 850 && mouseX <= 900) {
        if (corrisON == true) {

            corrisON = false;
        } else {
            corrisON = true;
        }
    }

    if (mouseY >= 465 && mouseY <= 550) {
        if (band3 == true) {

            band3 = false;
        } else {
            band3 = true;
        }

    }
    noStroke();
}

// logic to determine error in each freq. band
function analyzeNodes() {

    // perform FFT on each audio
    let refFFT = fft.analyze();
    let filteredFFT = fftFiltered.analyze();
    let micDataFFT = fftMic.analyze();

    // draw each audio signal with freq. data
    drawSignals(refFFT, filteredFFT, micDataFFT);

    var vals = [0, 0, 0, 0, 0, 0, 0, 0];
    var low = 0;
    var high = 0;

    //for each band
    for (var i = 0; i < eqLength; i++) {

        low = ranges[i].low;
        high = ranges[i].high;

        // get average amplitude in current band
        let refEnergy = fft.getEnergy(low, high);
        let micEnergy = fftMic.getEnergy(low, high);
        //let micEnergy = getAverage(testMicData, i);

        //calculate error
        let err = refEnergy - micEnergy;

        if (isNaN(err) || err == Infinity || err == -Infinity) {
            err = 0;
        }

        //store error value
        vals[i] = err;
    }

    //CODE FOR STEADY STATE ERROR CALCULATION
    //only push back err vals for first 100 ms 
    // if (filtered.currentTime() <= 5) {
    //     steadyStateErrors.push(vals);
    //     steadyStateTimes.push(filtered.currentTime());
    // } else if (store) {
    //     save(steadyStateErrors, "sse.txt");
    //     save(steadyStateTimes, "sseTime.txt");
    //     store = false;
    // }

    //if correction mode on, adjust filter gains
    if (corrisON) {
        adjustFilterGains(vals);
    }
}

// function to adjust filter gains
function adjustFilterGains(vals) {

    // for each freq. band
    // apply P-control logic with error band of -/+ 1dB
    for (var i = 0; i < eqLength; i++) {

        let err = vals[i];
        let curGain = gains[i];

        if (err < -1) {
            curGain = curGain - 0.3;
            eq.bands[i].gain(curGain);
            eqMic.bands[i].gain(curGain);

        } else if (err > 1) {
            curGain = curGain + 0.3;
            eq.bands[i].gain(curGain);
            eqMic.bands[i].gain(curGain);
        }

        gains[i] = curGain;

    }

}

// function to draw signals
function drawSignals(refFFT, filteredFFT, micDataFFT) {

    //draw micData signal
    noStroke();
    fill(222, 192, 247);
    let px = map(Math.log10(1), 0, Math.log10(micDataFFT.length), sx, ex);
    let py = map(micDataFFT[1], 0, 255, sy, ey);
    ellipse(px, py, 5);

    for (let i = 1; i <= micDataFFT.length; i++) {

        if (i < 5 || i % 50 == 0) {
            let x = map(Math.log10(i), 0, Math.log10(micDataFFT.length), sx, ex);
            let h = map(micDataFFT[i], 0, 255, sy, ey);

            ellipse(x, h, 5);

            stroke(222, 192, 247);
            strokeWeight(3);
            line(px, py, x, h);

            px = x;
            py = h;


        }
    }

    //draw filtered signal
    noStroke();
    fill(192, 244, 247);
    px = map(Math.log10(1), 0, Math.log10(filteredFFT.length), sx, ex);
    py = map(filteredFFT[1], 0, 255, sy, ey);
    ellipse(px, py, 5);

    for (let i = 1; i <= filteredFFT.length; i++) {
        if (i < 5 || i % 50 == 0) {
            let x = map(Math.log10(i), 0, Math.log10(filteredFFT.length), sx, ex);
            let h = map(filteredFFT[i], 0, 255, sy, ey);

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
    px = map(Math.log10(1), 0, Math.log10(refFFT.length), sx, ex);
    py = map(refFFT[1], 0, 255, sy, ey);
    ellipse(px, py, 5);

    for (let i = 1; i <= refFFT.length; i++) {
        if (i < 5 || i % 50 == 0) {
            let x = map(Math.log10(i), 0, Math.log10(refFFT.length), sx, ex);
            let h = map(refFFT[i], 0, 255, sy, ey);

            ellipse(x, h, 5);

            stroke(217, 247, 192);
            strokeWeight(3);
            line(px, py, x, h);

            px = x;
            py = h;
        }
    }

    //draw filter eqs
    noStroke();
    fill(255, 230, 0);
    noStroke();

    let bins = [];

    if (eqLength == 3) {
        //index of center frequencies: 60, 600, 6000
        bins = [4, 31, 256];
    } else {
        //index of cFreqs: 30, 73, 173, 410, 973, 2309, 5476, 12987
        bins = [1.5, 3.7, 7.7, 20.5, 48, 111, 275, 555];
    }

    for (let i = 0; i < eqLength; i++) {

        let x = map(Math.log10(bins[i]), 0, Math.log10(1024), sx, ex);
        let h = map(gains[i], -60, 60, sy, ey);

        fill(255, 230, 0);
        ellipse(x, h, 7);

        stroke(255, 230, 0);
        strokeWeight(3);
        line(x, sy, x, h);
    }

    noStroke();
}