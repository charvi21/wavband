// function drawGraph() {
//     //make graph background 
// }

// function callAPI() {
//     //call this once every 15ms
//     //get 1024byte size buffer for L and R
//     //make a Sound object out of it
//     //return the object
// }

let eqLength = 3;
let ref;

function preload() {
    filtered = loadSound('ddaeng.wav');
    ref = loadSound('ddaeng.wav');
    testMicData = loadSound('ddaeng.wav');
}

function setup() {
    let cnv = createCanvas(500, 500);
    cnv.mouseClicked(togglePlay);


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

function draw() {
    background(220);

    if (filtered.isPlaying()) {
        analyzeNodes();
    } else {

        stroke(0);
        text('tap to play', 20, 20);
    }

}

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
    fill(255, 0, 25);
    let px = 0;
    let py = micDataFFT[0];
    for (let i = 0; i < micDataFFT.length; i++) {
        if (i % 100 == 0) {
            let x = map(i, 0, micDataFFT.length, 0, width);
            let h = map(micDataFFT[i], -140, 0, height, 0);

            //let x = i * (width / (micDataFFT.length - 1));
            ellipse(x, h, 3);
            stroke(255, 0, 25);
            line(px, py, x, h);

            px = x;
            py = h;

        }
    }

    //draw filtered signal
    noStroke();
    fill(40, 0, 200);
    px = 0;
    py = filteredFFT[0];
    for (let i = 0; i < filteredFFT.length; i++) {
        if (i % 100 == 0) {
            let x = map(i, 0, filteredFFT.length, 0, width);
            let h = map(filteredFFT[i], -140, 0, height, 0);

            ellipse(x, h, 3);
            stroke(40, 0, 200);
            line(px, py, x, h);

            px = x;
            py = h;
        }
    }

    //draw ref signal
    noStroke();
    fill(40, 250, 0);
    px = 0;
    py = refFFT[0];
    for (let i = 0; i < refFFT.length; i++) {
        if (i % 100 == 0) {
            let x = map(i, 0, refFFT.length, 0, width);
            let h = map(refFFT[i], -140, 0, height, 0);

            ellipse(x, h, 3);
            stroke(40, 250, 0);
            line(px, py, x, h);

            px = x;
            py = h;
        }
    }
}