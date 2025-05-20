// motion-drawing-enhanced.js
// This sketch includes: fade-out, mirrored motion detection, sound, UI, save feature, fullscreen toggle, and intro screen

let video;
let prevFrame;
let buffer;
let gradient = [];
let colorIndex = 0;
let threshold = 20;
let sensitivitySlider, fadeSlider;
let saveButton, fullscreenButton, startButton;
let mic, fft;
let started = false;

function setup() {
  createCanvas(1920, 1080);
  pixelDensity(1);

  // UI (hidden until started)
  sensitivitySlider = createSlider(5, 100, threshold);
  sensitivitySlider.position(width / 2 - 60, 20);
  sensitivitySlider.hide();

  fadeSlider = createSlider(0, 100, 30);
  fadeSlider.position(width / 2 + 140, 20);
  fadeSlider.hide();

  saveButton = createButton('Save Canvas');
  saveButton.position(width / 2 - 260, 20);
saveButton.style('background-color', 'black');
saveButton.style('color', 'white');
saveButton.style('border-radius', '12px');
saveButton.style('padding', '10px 20px');
saveButton.style('border', 'none');
saveButton.style('cursor', 'pointer');
saveButton.style('font-weight', 'bold');
saveButton.style('text-transform', 'uppercase');
saveButton.style('font-family', 'sans-serif');
saveButton.mousePressed(() => saveCanvas('motion_art', 'png'));
  saveButton.hide();

  fullscreenButton = createButton('Fullscreen');
  fullscreenButton.position(width / 2 - 120, 20);
fullscreenButton.style('background-color', 'black');
fullscreenButton.style('color', 'white');
fullscreenButton.style('border-radius', '12px');
fullscreenButton.style('padding', '10px 20px');
fullscreenButton.style('border', 'none');
fullscreenButton.style('cursor', 'pointer');
fullscreenButton.style('font-weight', 'bold');
fullscreenButton.style('text-transform', 'uppercase');
fullscreenButton.style('font-family', 'sans-serif');
fullscreenButton.mousePressed(() => fullscreen(!fullscreen()));
  fullscreenButton.hide();

  startButton = createButton('START');
  startButton.position(width / 2 - 100, height / 2);
  startButton.size(200, 60);
  startButton.style('background-color', 'white');
  startButton.style('color', 'black');
  startButton.style('font-weight', 'bold');
  startButton.style('font-size', '20px');
  startButton.style('text-transform', 'uppercase');
  startButton.style('border', 'none');
  startButton.style('border-radius', '12px');
  startButton.style('cursor', 'pointer');

  let camNote = createP('Enable your camera');
  camNote.position(width / 2 - 70, height / 2 + 70);
  camNote.style('color', 'white');
  camNote.style('font-size', '14px');
  camNote.style('text-align', 'center');
  camNote.style('font-family', 'sans-serif');
  camNote.hide();

  startButton.mousePressed(() => {
    started = true;
    startButton.hide();
    camNote.hide();
    started = true;
    startButton.hide();
    sensitivitySlider.show();
    fadeSlider.show();
    saveButton.show();
    fullscreenButton.show();
  });

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  prevFrame = createImage(video.width, video.height);

  buffer = createGraphics(width, height);
  buffer.background(255); // Initialize buffer with white background
  buffer.stroke(0);
  buffer.strokeWeight(1);

  gradient = [
    [216, 9, 17], [215, 8, 16], [217, 6, 15], [214, 4, 14], [213, 7, 17],
    [212, 9, 19], [210, 16, 24], [206, 24, 29], [203, 30, 33], [200, 36, 37],
    [196, 44, 42], [193, 50, 45], [187, 62, 53], [182, 72, 59], [180, 76, 62],
    [100, 100, 180], [80, 90, 200], [60, 80, 220], [40, 70, 240], [20, 50, 255]
  ];

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);
}

function draw() {
  // background(255); // Removed to prevent clearing canvas on each frame

  if (!started) {
    background(0);
    return;
  }

  threshold = sensitivitySlider.value();
  let fadeOpacity = fadeSlider.value();

  video.loadPixels();
  prevFrame.loadPixels();
  let motionDetected = false;

  for (let y = 0; y < video.height; y += 4) {
    for (let x = 0; x < video.width; x += 4) {
      let i = (x + y * video.width) * 4;

      let r1 = video.pixels[i], g1 = video.pixels[i+1], b1 = video.pixels[i+2];
      let r2 = prevFrame.pixels[i], g2 = prevFrame.pixels[i+1], b2 = prevFrame.pixels[i+2];
      let diff = dist(r1, g1, b1, r2, g2, b2);

      if (diff > threshold) {
        motionDetected = true;
        let canvasX = map(x, 0, video.width, width, 0);
        let canvasY = map(y, 0, video.height, 0, height);

        let c = gradient[colorIndex % gradient.length];
        buffer.fill(c[0], c[1], c[2]);
        let size = map(diff, threshold, 255, 5, 30);

        let spectrum = fft.analyze();
        let volBoost = map(spectrum[0], 0, 255, 1, 1.5);

        buffer.ellipse(canvasX, canvasY, size * volBoost);
        colorIndex++;
      }
    }
  }

  if (!motionDetected) {
    buffer.noStroke();
    buffer.fill(255, fadeOpacity);
    buffer.rect(0, 0, width, height);
  }

  image(buffer, 0, 0);
  prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

  fill(0);
  textSize(14);
  text('Sensitivity', sensitivitySlider.x, sensitivitySlider.y - 10);
  text('Fade Speed', fadeSlider.x, fadeSlider.y - 10);
}
