import path from "path";
import { join } from "path";
import { fileURLToPath } from "url";
import Prompt from "./prompts.mjs";
import ImageProcessor from "./image-processor.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const directoryPath = join(__dirname, "..");

const imageProcessor = new ImageProcessor();

const files = imageProcessor.setup();

const promptMaker = new Prompt();

let response;
let fileName;

(async () => {
  await imageProcessor.makePngCopies(files);

  const filesPngPath = join(directoryPath, "png");
  const filesPngConverted = imageProcessor.getFilesByExtension(
    filesPngPath,
    ".png"
  );

  // check there are files
  if (filesPngConverted.length === 0) {
    console.log("No files found to convert to PDF");
    return process.exit(1);
  }
  response = await promptMaker.selectFiles(filesPngConverted);
  // Check if the user selected any files
  if (response.value.length === 0) {
    console.log("No files selected");
    return process.exit(1);
  }
  fileName = await promptMaker.enterFileName();

  // Check if the user entered a name
  if (fileName.value === "") {
    console.log("No name entered");
    return process.exit(1);
  }

  // Convert the images to a PDF file
  imageProcessor.convertToPDF(response.value, fileName.value);

  console.log("Conversion complete");
})();
