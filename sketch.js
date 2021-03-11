// function preload(){
//   sound = loadSound('ddaeng.wav');
//   sound1 = loadSound('ddaeng.wav');
// }

// function setup(){
//   let cnv = createCanvas(500,500);
//   cnv.mouseClicked(togglePlay);
//   fft = new p5.FFT();
//   filter = new p5.BandPass();
//   sound.disconnect();
//   sound.connect(filter);
//   filter.disconnect();
//   filter.connect(sound1);
// }

// function draw(){
//   background(220);

//   let spectrum = fft.analyze(sound);

//   // set the BandPass frequency based on mouseX
//   let freq = 8000;
//   //freq = constrain(freq, 0, 22050);
//   filter.freq(freq);
//   // give the filter a narrow band (lower res = wider bandpass)
//   filter.res(50);
//   filter.toggle();

//   noStroke();
//   fill(255, 0, 255);
//   for (let i = 0; i< spectrum.length; i++){
//     let x = map(i, 0, spectrum.length, 0, width);
//     let h = -height + map(spectrum[i], 0, 255, height, 0);
//     rect(x, height, width / spectrum.length, h )
//   }

//   let waveform = fft.waveform();
//   noFill();
//   beginShape();
//   stroke(20);
//   for (let i = 0; i < waveform.length; i++){
//     let x = map(i, 0, waveform.length, 0, width);
//     let y = map( waveform[i], -1, 1, 0, height);
//     vertex(x,y);
//   }
//   endShape();

//   text('tap to play', 20, 20);
// }

// function togglePlay() {
//   if (sound1.isPlaying()) {
//     sound1.pause();
//   } else {
//     sound1.loop();
//   }
// }

// function callAPI() {
//   //call this once every 15ms
//   //get 1024byte size buffer for L and R
//   //make a Sound object out of it
//   //return the object
// }

let eq, soundFile
let eqBandIndex = 0;
let eqBandNames = ['lows', 'mids', 'highs'];
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

function preload() {
    soundFile = loadSound('ddaeng.wav');
    logo = loadImage('assets/logo.png');
    headphonesym = loadImage('assets/headphonesym.png');
    batt = loadImage('assets/batt.png');
    statusgreen = loadImage('assets/statusgreen.png');

    font = loadFont('assets/abeatbyKaiRegular.otf');

    loggrid = loadImage('assets/loggrid.png');

}

function setup() {
    let cnv = createCanvas(windowWidth, windowHeight);
    //cnv.background(0, 255, 255);
    cnv.mousePressed(toggleSound);
    // cnv.position(80, 150);
    // cnv.parent('canvas-area');


    eq = new p5.EQ(eqBandNames.length);
    soundFile.disconnect();
    eq.process(soundFile);

    loadImage('assets/logo.jpg', logo => {
        // image(logo, 0, 0);
    });

    loadImage('assets/headphonesym.jpg', headphonesym => {
        // image(headphonesym, 1525, 15);
    });

    loadImage('assets/batt.png', batt => {
        // image(batt, 1650, 15);
    });

    loadImage('assets/statusgreen.png', statusgreen => {
        // image(statusgreen, 1600, 15);
    });

    loadImage('assets/loggrid.png', loggrid => {
        //resize(100, 50);
        //image(loggrid, 100, 175);

    });


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

    //placeholders for plots
    rect(100, 175, 1300, 200);
    fill(247, 195, 192);

    tint(250, 240);
    image(loggrid, 100, 175, 1300, 200);


    rect(100, 575, 1300, 200);
    fill(247, 195, 192);

    tint(250, 240);
    image(loggrid, 100, 575, 1300, 200);

    fill(217, 247, 192);
    inputcolour = circle(120, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(inputtext, 140, 163);

    fill(192, 244, 247);
    outputcolour = circle(300, 155, 20, 20);

    textSize(20);
    fill(105, 105, 109);
    text(outputtext, 320, 163);

    fill(247, 195, 192);
    rect(470, 145, 40, 20, 50);

    fill(231, 231, 231);
    correctioncolour = circle(480, 155, 20, 20);


    textSize(20);
    fill(105, 105, 109);
    text(correctiontext, 520, 163);


    fill(222, 192, 247);
    adjustmentscolour = circle(120, 555, 20, 20);


    textSize(20);
    fill(105, 105, 109);
    text(inputtext, 140, 555 + (163 - 155));




}

function draw() {

    //background(30);
    // noStroke();
    //fill(255);
    textAlign(CENTER);
    text('filtering ', 50, 25);



    //TOGGLE BUTTON FOR CORRECTION MODE ON OR OFF
    //if (isOn) {
    //    fill(247, 195, 192);
    // } else {
    fill(155, 137, 138);
    // }




    fill(255, 40, 255);
    textSize(26);
    text(eqBandNames[eqBandIndex], 50, 55);

    fill(255);
    textSize(9);

    if (!soundFile.isPlaying()) {
        text('tap to play', 50, 80);
    } else {
        text('tap to filter next band', 50, 80)
    }
}

function toggleSound() {
    if (!soundFile.isPlaying()) {
        soundFile.play();
    } else {
        eqBandIndex = (eqBandIndex + 1) % eq.bands.length;
    }

    for (let i = 0; i < eq.bands.length; i++) {
        eq.bands[i].gain(0);
    }
    // filter the band we want to filter
    //eq.bands[eqBandIndex].gain(-40);
}


function mouseClicked() {
    if (dist(480, 148, mouseX, mouseY) < radius) {
        if (isOn == true) isOn = false;
        else isOn = true;
    }
}