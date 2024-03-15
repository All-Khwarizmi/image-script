import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  readdirSync,
  existsSync,
  mkdirSync,
  unlinkSync,
  copyFileSync,
  open,
} from "fs";
import path from "path";
import { join } from "path";
import { fileURLToPath } from "url";
import convert from "heic-convert";
import PDFDocument from "pdfkit";

const __filename = fileURLToPath(import.meta.url);

export default class ImageProcessor {
  constructor() {
    const __dirname = path.dirname(__filename);
    this.directoryPath = join(__dirname, "..");
    this.outputPath = join(this.directoryPath, "aaaoutput");
  }
  setup() {
    console.log(`
    Setting up the image processor`);
    // Ensure the output folder exists
    if (!existsSync(this.outputPath)) {
      mkdirSync(this.outputPath);
    }

    const files = this.getFilesByExtension(this.directoryPath, ".HEIC");

    // check there are files
    if (files.length === 0) {
      console.log("No files .HEIC found to convert to PDF");
      return process.exit(1);
    }

    // Create a folder called original
    mkdirSync(`${this.directoryPath}/original`, { recursive: true });

    // Create a folder called png
    mkdirSync(`${this.directoryPath}/png`, { recursive: true });

    console.log(`
    Setup complete`);
    return files;
  }
  getFilesByExtension(directoryPath, extension) {
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
    console.log(`
    Files found: ${files}`);
    return files;
  }

  async makePngCopies(files) {
    console.log(`
    Making PNG copies of files`);
    for (const file of files) {
      console.log(`Reading file: ${file}`);
      const inputBuffer = readFileSync(join(this.directoryPath, file));
      const outputBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: "PNG", // output format
        quality: 0.5, // the jpeg compression quality, between 0 and 1
      });

      // Copy file to original folder
      copyFileSync(
        join(this.directoryPath, file),
        join(this.directoryPath, "original", file)
      );
      console.log(`
        File copied to original folder: ${file}`);
      console.log(`Writing file: ${file}`);
      writeFileSync(
        join(this.directoryPath, "png", `${file}.png`),
        outputBuffer
      );
      console.log(`File ${file} written`);
      // Open file to be manipulated
      open(join(this.directoryPath, file), "r", (err, fd) => {
        if (err) throw err;
        console.log(`File ${file} opened`);
      });
      // Remove file from directory
      unlinkSync(join(this.directoryPath, file));
      console.log(`File ${file} removed`);
    }
  }

  async convertWthPDFKit(files, fileName) {
    console.log({ "files in convertWthPDFKit": files });

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      bufferPages: true,
    });

    const pdfStream = createWriteStream(
      join(this.outputPath, `${fileName}.pdf`)
    );
    doc.pipe(pdfStream);

    files.forEach((file) => {
      doc.image(join(this.directoryPath, "png", file), {
        fit: [842, 400],
        align: "center",
        valign: "center",
      });
      doc.addPage();
    });

    doc.end();
    console.log("The PDF has been created");
  }

}
