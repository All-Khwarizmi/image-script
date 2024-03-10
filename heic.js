const convert = require("heic-convert");
const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "..");
const outputPath = path.join(directoryPath, "aaaoutput");

const img = fs.readFileSync(path.join(directoryPath, "IMG_2125.HEIC"));
(async () => {
  const jpgBuffer = await convert({
    buffer: img, // the HEIC file buffer
    format: "PNG", // output format
    quality: 1, // the jpeg compression quality, between 0 and 1
  });
  console.log(`Writing file: IMG_2125.png`);
  fs.writeFileSync(path.join(directoryPath, "png", "IMG_2125.png"), jpgBuffer);
  console.log("Saved!");
})();
