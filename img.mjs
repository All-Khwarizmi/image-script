import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  readdirSync,
  existsSync,
  mkdirSync,
} from "fs";
import path from "path";
import { join } from "path";
import { fileURLToPath } from "url";
import convert from "heic-convert";
import PDFDocument from "pdfkit";
import { PdfConvert } from "pdf-convert-js";
import prompts from "prompts";
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const directoryPath = join(__dirname, "..");
const outputPath = join(directoryPath, "aaaoutput");

// Ensure the output folder exists
const files = setup(directoryPath, outputPath);

// Prompt user to select the file or files to convert
let response;
let fileName;

(async () => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputBuffer = readFileSync(join(directoryPath, file));
    const outputBuffer = await convert({
      buffer: inputBuffer, // the HEIC file buffer
      format: "PNG", // output format
      quality: 0.5, // the jpeg compression quality, between 0 and 1
    });

    writeFileSync(join(directoryPath, "png", `${file}.png`), outputBuffer);
  }

  // copyFilesFromHeicToPng(files);
  const filesPngPath = join(directoryPath, "png");
  const filesPngConverted = getFilesByExtension(filesPngPath, ".png");

  // check there are files
  if (filesPngConverted.length === 0) {
    console.log("No files found to convert to PDF");
    return process.exit(1);
  }

  response = await prompts({
    type: "multiselect",
    name: "value",
    message: "Select the files to convert",
    choices: filesPngConverted.map((file) => ({ title: file, value: file })),
  });

  // Check if the user selected any files
  if (response.value.length === 0) {
    console.log("No files selected");
    return process.exit(1);
  }
  console.log(response.value);

  fileName = await prompts({
    type: "text",
    name: "value",
    message: "Enter the name of the file",
  });

  // Check if the user entered a name
  if (fileName.value === "") {
    console.log("No name entered");
    return process.exit(1);
  }
  console.log(fileName.value);

  // Create a document
  const doc = new PDFDocument(
    {
      size: "A4",
      layout: "landscape",
      margin: 0,
    },
    {
      autoFirstPage: false,
    }
  );

  // Pipe its output somewhere, like to a file or HTTP response
  // See below for browser usage
  doc.pipe(createWriteStream(join(outputPath, `${fileName.value}.pdf`)));

  // Add the images to the PDF
  for (let file of response.value) {
    doc.image(join(directoryPath, "png", file), {
      fit: [842, 400],
      valign: "center",
      align: "center",
    });
  }

  // Finalize PDF file
  doc.end();

  console.log("The PDF has been created");

  // Compress the pdf file
  const pdfConvert = new PdfConvert(join(outputPath, `${fileName.value}.pdf`));
  const shrunkenPdf = await pdfConvert.shrink({
    compress: true,
    log: true,
    resolution: 72,
  });

  writeFileSync(
    join(outputPath, `${fileName.value}-compressed.pdf`),
    shrunkenPdf
  );

  console.log("The PDF has been compressed");

  // Convert the file to PDF
  // convertImage(filesPngConverted, fileName);
})();

// Convert image to pdf
async function convertImage(files, fileName) {
  console.log({ "files in convertImage": files });

  // Open the files and convert them to buffer
  const images = files.map((file) => {
    const buffer = readFileSync(join(directoryPath, "png", file));
    return buffer;
  });

  console.log({ images });
  const pdf = imgToPDF(images, imgToPDF.sizes.A4).pipe(
    createWriteStream(join(directoryPath, "aaaoutput", `${fileName.value}.pdf`))
  );
  console.log(pdf);
  console.log("The PDF has been created");
}

// Copy the original files to the original folder with 'heic-convert'
async function copyFilesFromHeicToPng(files, directoryPath) {
  console.log(`
  Copying files from HEIC to PNG`);
  files.forEach(async (file) => {
    console.log(`Reading file: ${file}`);
    const inputBuffer = readFileSync(join(directoryPath, file));
    convert({
      buffer: inputBuffer, // the HEIC file buffer
      format: "PNG", // output format
      quality: 1, // the jpeg compression quality, between 0 and 1
    }).then((jpgBuffer) => {
      console.log(`Writing file: ${file}`);
      writeFileSync(join(directoryPath, "png", `${file}.png`), jpgBuffer);
    });
  });
}

// Read the file path synchronously and sele
function getFilesByExtension(directoryPath, extension) {
  console.log(`
  Getting files by extension ${extension} in directory: ${directoryPath}`);
  let files = [];

  readdirSync(directoryPath).forEach((file) => {
    if (file.includes(extension)) {
      console.log(`
      File: ${file}`);
      files.push(file);
    }
  });

  return files;
}

function setup(directoryPath, outputPath) {
  // Ensure the output folder exists
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath);
  }

  const files = getFilesByExtension(directoryPath, ".HEIC");

  // check there are files
  if (files.length === 0) {
    console.log("No files .HEIC found to convert to PDF");
    return process.exit(1);
  }

  // Create a folder called original
  mkdirSync(`${directoryPath}/original`, { recursive: true });

  // Create a folder called png
  mkdirSync(`${directoryPath}/png`, { recursive: true });

  return files;
}
