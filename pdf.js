const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const directoryPath = path.join(__dirname, "..");
const outputPath = path.join(directoryPath, "aaaoutput");
// Create a document
const doc = new PDFDocument();

// Pipe its output somewhere, like to a file or HTTP response
// See below for browser usage
doc.pipe(fs.createWriteStream(path.join(outputPath, "bat.pdf")));

fs.open("bat.png", "w", function (err, file) {
  if (err) throw err;
  console.log("Saved!");
});
doc.image(path.join(directoryPath, "bat.png"));

doc.end();
