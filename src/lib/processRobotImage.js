const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/LEE/.gemini/antigravity-ide/brain/b38d21a7-a64f-4418-8e30-124307193ff5/media__1785733255201.jpg';
const outputPath = path.join(__dirname, '../../public/comment-alba-robot.png');

async function removeBlackBackground() {
  console.log('Processing image from:', inputPath);

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const threshold = 35; // Pure black threshold
  const fadeThreshold = 70; // Soft edge blending

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const brightness = Math.max(r, g, b);

    if (brightness <= threshold) {
      data[i + 3] = 0; // Completely transparent
    } else if (brightness < fadeThreshold) {
      // Soft alpha transition for antialiasing
      const alphaFraction = (brightness - threshold) / (fadeThreshold - threshold);
      data[i + 3] = Math.round(alphaFraction * 255);
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log('Successfully saved transparent PNG to:', outputPath);
}

removeBlackBackground().catch((err) => {
  console.error('Error processing image:', err);
});
