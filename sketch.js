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
const inputtext = 'input';
const outputtext = 'output';
let correctionisOn = true;
const correctiontext = 'correction mode';
const adjustmentstext = 'adjustments filter';
let loggrid;

let lw = 1200;
let lh = 95;
let sx = 150;
let ex = sx + lw;
let sy = 175 + lh;
let ey = 175;


let eqLength = 3;
let ref;

function preload() {

    logo = loadImage('assets/logo.png');
    headphonesym = loadImage('assets/headphonesym.png');
    batt = loadImage('assets/batt.png');
    statusgreen = loadImage('assets/statusgreen.png');

    font = loadFont('assets/abeatbyKaiRegular.otf');

    loggrid = loadImage('assets/loggrid.png');

    filtered = loadSound('ddaeng.wav');
    ref = loadSound('ddaeng.wav');
    testMicData = loadSound('ddaeng.wav');

}

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    //cnv.background(0, 255, 255);
    cnv.mouseClicked(togglePlay);
    // cnv.position(80, 150);
    // cnv.parent('canvas-area');

    drawBackground();

    //CHARVI's STUFF

    //setup test mic data
    fil = new p5.Filter();
    fil.freq(2880);
    fil.gain(-20);
    testMicData.disconnect();
    testMicData.connect(fil);
    fil.disconnect();


    eq = new p5.EQ(eqLength);
    filtered.disconnect();
    eq.process(filtered);

    fft = new p5.FFT();
    fft.setInput(ref);
    ref.disconnect();

    fftFiltered = new p5.FFT();
    fftFiltered.setInput(eq);

    fftMic = new p5.FFT();
    fftMic.setInput(fil);

}

function drawBackground() {
    image(logo, 30, 5);
    image(headphonesym, 1550, 15);
    image(batt, 1625, 15);
    image(statusgreen, 1573, 35);

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

    fill(217, 247, 192);
    ellipse(120, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(inputtext, 140, 163);

    fill(192, 244, 247);
    ellipse(300, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(outputtext, 320, 163);

    fill(247, 195, 192);
    rect(470, 145, 40, 20, 50);

    fill(231, 231, 231);
    ellipse(480, 155, 20, 20);


    textSize(20);
    fill(105, 105, 109);
    text(correctiontext, 520, 163);


    fill(222, 192, 247);
    ellipse(120, 555, 20, 20);


    textSize(20);
    fill(105, 105, 109);
    text(inputtext, 140, 555 + (163 - 155));
}

function draw() {

    //background(220);
    //fill(155, 137, 138);
    //placeholders for plots
    rect(100, 175, 1300, 200);
    fill(247, 195, 192);

    tint(250, 240);
    image(loggrid, 100, 175, 1300, 200);


    rect(100, 575, 1300, 200);
    fill(247, 195, 192);

    tint(250, 240);
    image(loggrid, 100, 575, 1300, 200);

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

        if (i == 0) {
            low = 20;
            high = 400;
        } else if (i == 1) {
            low = 400;
            high = 2600;
        } else {
            low = 2600;
            high = 14000;
        }

        let refEnergy = fft.getEnergy(low, high);
        //print("REF: ", refEnergy);
        let micEnergy = fftMic.getEnergy(low, high);
        //print("MIC: ", micEnergy);

        vals[i] = refEnergy - micEnergy;
        gains[i] = eq.bands[i].gain();
    }
    //    print("Vals: ", vals);
    //    print("Gains: ", gains);

    adjustFilterGains(vals);
}

function adjustFilterGains(vals) {
    //gonna get 3 vals, compare each val to 0
    //if < 0 then reduce gain (ref-mic)
    //if > 0 then increase gain
    //if within 5% of 0, don't change gain

    for (var i = 0; i < eqLength; i++) {

        if (vals[i] != Infinity) {
            eq.bands[i].gain(vals[i]);
        }

    }

}

function drawSignals(refFFT, filteredFFT, micDataFFT) {


    //draw micData signal
    noStroke();
    fill(222, 192, 247);
    let px = sx;
    let py = map(micDataFFT[0], -140, 0, sy, ey);
    for (let i = 0; i < micDataFFT.length; i++) {
        if (i % 100 == 0) {
            let x = map(i, 0, micDataFFT.length, sx, ex);
            let h = map(micDataFFT[i], -140, 0, sy, ey);

            //let x = i * (width / (micDataFFT.length - 1));
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
    px = sx;
    py = map(filteredFFT[0], -140, 0, sy, ey);;
    for (let i = 0; i < filteredFFT.length; i++) {
        if (i % 100 == 0) {
            let x = map(i, 0, filteredFFT.length, sx, ex);
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
    px = sx;
    py = map(refFFT[0], -140, 0, sy, ey);
    for (let i = 0; i < refFFT.length; i++) {
        if (i % 100 == 0) {
            let x = map(i, 0, refFFT.length, sx, ex);
            let h = map(refFFT[i], -140, 0, sy, ey);

            ellipse(x, h, 5);

            stroke(217, 247, 192);
            strokeWeight(3);
            line(px, py, x, h);

            px = x;
            py = h;
        }
    }
}