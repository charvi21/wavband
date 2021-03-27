// function drawGraph() {
//     //make graph background 
// }

// function callAPI() {
//     //call this once every 15ms
//     //get 1024byte size buffer for L and R
//     //make a Sound object out of it
//     //return the object
// }

let logo;
let headphonesym;
let batt;
let statusgreen;
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

function preload() {

    logo = loadImage('assets/logo.png');
    headphonesym = loadImage('assets/headphonesym.png');
    batt = loadImage('assets/batt.png');
    statusgreen = loadImage('assets/statusgreen.png');

    font = loadFont('assets/abeatbyKaiRegular.otf');

    loggrid = loadImage('assets/loggrid3.png');

    filtered = loadSound('assets/fyatt.wav');
    ref = loadSound('assets/fyatt.wav');
    testMicData = loadSound('assets/ddaengMIC.wav');

}

function setup() {

    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.background('white');
    cnv.mouseClicked(togglePlay);
    // cnv.position(80, 150);
    // cnv.parent('canvas-area');

    drawBackground();
    //CHARVI's STUFF

    //setup test mic data
    // fil = new p5.Filter();
    // fil.freq(2880);
    // fil.gain(-20);
    // testMicData.disconnect();
    // testMicData.connect(fil);
    // fil.disconnect();

    eq = new p5.EQ(eqLength);
    setupEQ();
    filtered.disconnect();
    eq.process(filtered);

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
    image(headphonesym, 1050, 15);
    image(batt, 1125, 15);
    image(statusgreen, 1073, 35);

    textFont(font);

    textSize(20);
    fill(247, 195, 192);
    text(hometext, 400, 55);
    stroke(247, 195, 192);
    strokeWeight(2); // line colour
    line(400, 70, 475, 70);
    strokeWeight(0); // reset so it doesnt show up on text
    fill(105, 105, 109);
    text(settingstext, 575, 55);
    text(helptext, 775, 55);

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

    //button toggle

    fill(247, 195, 192);
    rect(720, 145, 40, 20, 50);

    fill(231, 231, 231);
    ellipse(730, 155, 20, 20);



    textSize(20);
    fill(105, 105, 109);
    text(correctiontext, 770, 163);



}

function draw() {

    //background(220);
    //fill(155, 137, 138);
    //placeholders for plots
    rect(100, 175, 1105.76, 285);
    fill('white');

    //tint(250, 240);
    image(loggrid, 100, 175);


    //rect(100, 575, 1105.76, 285);
    // fill(247, 195, 192);

    //tint(250, 240);
    //image(loggrid, 100, 575);

    if (filtered.isPlaying()) {
        analyzeNodes();
    }

}

// function mouseClicked() {
//     if (dist(480, 148, mouseX, mouseY) < radius) {
//         if (isOn == true) isOn = false;
//         else isOn = true;
//     }
// }

function togglePlay() {

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

        print("REF ENERGY: ", refEnergy);
        print("MIC ENERGY: ", micEnergy);

        //        let gain = 0;

        if (micEnergy == Infinity || micEnergy == -Infinity) {
            micEnergy = refEnergy;
        }

        let gain = refEnergy - micEnergy;
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

        if (vals[i] != Infinity || vals[i] != -Infinity || !isNaN(vals[i])) {
            eq.bands[i].gain(vals[i]);
        }

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