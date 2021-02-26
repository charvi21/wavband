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

function preload() {
  soundFile = loadSound('ddaeng.wav');
}

function setup() {
  let cnv = createCanvas(500, 500);
  cnv.mousePressed(toggleSound);

  eq = new p5.EQ(eqBandNames.length);
  soundFile.disconnect();
  eq.process(soundFile);
}

function draw() {
  background(30);
  noStroke();
  fill(255);
  textAlign(CENTER);
  text('filtering ', 50, 25);

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