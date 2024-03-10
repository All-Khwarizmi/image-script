const imgToPDF = require("image-to-pdf");
const fs = require("fs");
const path = require("path");

const directoryPath = path.join("/Users/jasonsuarez/Downloads");
const outputPath = path.join(directoryPath, "aaaoutput");

// Ensure the output folder exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

// Read the file path synchronously and select the file to convert
function getFilesByExtension(directoryPath, extension) {
  let files = [];

  fs.readdirSync(directoryPath).forEach((file) => {
    if (file.includes(extension)) {
      files.push(file);
    }
  });

  return files;
}

const icon = fs.readFileSync(path.join(directoryPath, "mer.jpeg"));

const iconPdf = imgToPDF([icon], "A4");
fs.writeFileSync(path.join(outputPath, "mer.pdf"), iconPdf);