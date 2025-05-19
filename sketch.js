let video;
let prevFrame;
let gradient = [];
let colorIndex = 0;
let threshold = 20;
let buffer;

function setup() {
  createCanvas(1920, 1080);
  pixelDensity(1);

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  prevFrame = createImage(video.width, video.height);

  buffer = createGraphics(width, height);
  buffer.background(255);
  buffer.stroke(0);
  buffer.strokeWeight(1);

  gradient = [
    [216, 9, 17], [215, 8, 16], [217, 6, 15], [214, 4, 14], [213, 7, 17],
    [212, 9, 19], [210, 16, 24], [206, 24, 29], [203, 30, 33], [200, 36, 37],
    [196, 44, 42], [193, 50, 45], [187, 62, 53], [182, 72, 59], [180, 76, 62],
    [100, 100, 180], [80, 90, 200], [60, 80, 220], [40, 70, 240], [20, 50, 255]
  ];
}

function draw() {
  video.loadPixels();
  prevFrame.loadPixels();

  let motionDetected = false;

  for (let y = 0; y < video.height; y += 4) {
    for (let x = 0; x < video.width; x += 4) {
      let index = (x + y * video.width) * 4;

      let r1 = video.pixels[index];
      let g1 = video.pixels[index + 1];
      let b1 = video.pixels[index + 2];

      let r2 = prevFrame.pixels[index];
      let g2 = prevFrame.pixels[index + 1];
      let b2 = prevFrame.pixels[index + 2];

      let diff = dist(r1, g1, b1, r2, g2, b2);

      if (diff > threshold) {
        motionDetected = true;

        let canvasX = map(x, 0, video.width, width, 0);  // mirror
        let canvasY = map(y, 0, video.height, 0, height);

        let c = gradient[colorIndex % gradient.length];
        buffer.fill(c[0], c[1], c[2]);

        let size = map(diff, threshold, 255, 5, 30);
        buffer.ellipse(canvasX, canvasY, size, size);

        colorIndex++;
      }
    }
  }

  // Only apply gentle fade when no motion
  if (!motionDetected) {
    buffer.noStroke();
    buffer.fill(255, 30); // fade opacity tuned for ~1s decay
    buffer.rect(0, 0, width, height);
  }

  // Draw everything from the buffer
  image(buffer, 0, 0);

  // Save current frame for comparison
  prevFrame.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);
}
