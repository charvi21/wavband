// function preload() {
//     sound = loadSound('ddaeng.wav');
//     sound1 = loadSound('ddaeng.wav');
// }

// function setup() {
//     let cnv = createCanvas(500, 500);
//     cnv.mouseClicked(togglePlay);
//     fft = new p5.FFT();
//     filter = new p5.BandPass();
//     sound.disconnect();
//     sound.connect(filter);
//     filter.disconnect();
//     filter.connect(sound1);
//     print(sound.sampleRate());
// }

// function draw() {
//     background(220);

//     let spectrum = fft.analyze(sound, "dB");
//     // print(spectrum)


//     // set the BandPass frequency based on mouseX
//     let freq = 8000;
//     //freq = constrain(freq, 0, 22050);
//     filter.freq(freq);
//     // give the filter a narrow band (lower res = wider bandpass)
//     filter.res(50);
//     filter.toggle();

//     noStroke();
//     fill(255, 0, 255);
//     for (let i = 0; i < spectrum.length; i++) {
//         let x = map(i, 0, spectrum.length, 0, width);
//         let h = -height + map(spectrum[i], 0, 255, height, 0);
//         rect(x, height, width / spectrum.length, h)
//     }

//     let waveform = fft.waveform();
//     noFill();
//     beginShape();
//     stroke(20);
//     for (let i = 0; i < waveform.length; i++) {
//         let x = map(i, 0, waveform.length, 0, width);
//         let y = map(waveform[i], -1, 1, 0, height);
//         vertex(x, y);
//     }
//     endShape();

//     text('tap to play', 20, 20);
// }

function togglePlay() {
    if (sound2.isPlaying()) {
        sound2.pause();
    } else {
        sound2.loop();
    }
}

// function callAPI() {
//     //call this once every 15ms
//     //get 1024byte size buffer for L and R
//     //make a Sound object out of it
//     //return the object
// }

let eq, soundFile
let eqBandIndex = 0;
let eqBandNames = ['lows', 'mids', 'highs'];
this.audiocontext = new AudioContext({ sampleRate: 44100 });

function preload() {
    soundFile = loadSound('ddaeng1.wav');
    sound2 = loadSound('ddaeng1.wav');
}

function setup() {
    let cnv = createCanvas(500, 500);
    cnv.mousePressed(togglePlay);
    let ctx = new AudioContext({ sampleRate: 44100 });
    //let baseCtx = getAudioContext();
    //baseCtx = ctx;
    print(ctx)

    // eq = new p5.EQ(3);
    // soundFile.disconnect();
    // eq.process(soundFile);
    // print(soundFile)

    // const track = ctx.createMediaElementSource('ddaeng.wav');
    // Get an AudioBufferSourceNode.
    // // This is the AudioNode to use when we want to play an AudioBuffer
    // var source = ctx.createBufferSource();
    // // set the buffer in the AudioBufferSourceNode
    // source.buffer = sound2.buffer;
    // // connect the AudioBufferSourceNode to the
    // // destination so we can hear the sound
    // source.connect(ctx.destination);
    // // start the source playing
    // source.start();

    // get the audio element
    const audioElement = document.querySelector('audio');

    // pass it into the audio context
    const track = ctx.createMediaElementSource(audioElement);
    track.connect(ctx.destination);
    //track.start();
    //audioElement.play();
    print(track);

    fft = new p5.FFT();
    fft.setInput(track);
    print(fft)
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

    //print(sound2)

    // let spectrum = fft.analyze(soundFile, "dB");
    // //  noStroke();
    // //fill(255, 0, 255);
    // for (let i = 0; i < spectrum.length; i++) {
    //     let x = map(i, 0, spectrum.length, 0, width);
    //     let h = -height + map(spectrum[i], -140, 0, height, 0);
    //     rect(x, height, width / spectrum.length, h)
    // }


    //  sound2.play();


    // if (!soundFile.isPlaying()) {
    //     text('tap to play', 50, 80);
    // } else {
    //     text('tap to filter next band ' + eq.bands[eqBandIndex].freq() + ' ' + eqBandIndex, 100, 80)
    // }
}

function toggleSound() {

    let curF = eq.bands[eqBandIndex].freq()

    if (!soundFile.isPlaying()) {
        soundFile.play();
    } else {
        //soundFile.pause();
        eqBandIndex = (eqBandIndex + 1) % eq.bands.length;
    }

    if (eqBandIndex == 0) {
        curF = 10;
    }


    let f = eq.bands[eqBandIndex].freq()
        // print("Energy: ", fft.getEnergy(10))
        // let n = f * 2048 / soundFile.sampleRate();
        // print("Bin: ", spectrum[0])

    for (let i = 0; i < eq.bands.length; i++) {
        eq.bands[i].gain(0);
    }
    //filter the band we want to filter
    print(curF)
    print(f)

    eq.bands[eqBandIndex].gain(-40);
}