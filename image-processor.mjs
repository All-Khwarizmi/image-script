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
import pjson from "./package.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);

export default class ImageProcessor {
  constructor() {
    const extension = pjson.extension;
    if (!extension) {
      console.log("No extension found in package.json");
      return process.exit(1);
    }
    this.extension = extension;
    const saveTo = pjson.saveTo;
    if (!saveTo) {
      console.log("No saveTo found in package.json");
      return process.exit(1);
    }
    this.saveTo = saveTo;
    const entryPoint = pjson.entryPoint;
    if (!entryPoint || entryPoint === "." || entryPoint === "./" || entryPoint === "/" || entryPoint === "" ) {
      this.entryPoint = ""
    } else {
      this.entryPoint = ".."

    }
    const output = pjson.output;
    if (!output) {
      console.log("No output found in package.json");
      return process.exit(1);
    }
    const __dirname = path.dirname(__filename);
    this.directoryPath = join(__dirname, entryPoint);
    this.outputPath = join(this.directoryPath, output);
  }
  setup() {
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

    return files;
  }
  getFilesByExtension(directoryPath, extension) {
    let files = [];

    readdirSync(directoryPath).forEach((file) => {
      if (file.includes(extension)) {
        files.push(file);
      }
    });
    
    return files;
  }

  async makePngCopies(files) {
   
    for (const file of files) {
      const inputBuffer = readFileSync(join(this.directoryPath, file));
      const outputBuffer = await convert({
        buffer: inputBuffer, // the HEIC file buffer
        format: "PNG", // output format
        quality: 0.5, // the jpeg compression quality, between 0 and 1
      });

      // Copy file to original folder
      copyFileSync(
        join(this.directoryPath, file),
        join(this.directoryPath, this.saveTo, file)
      );
     
      writeFileSync(
        join(this.directoryPath, "png", `${file}.png`),
        outputBuffer
      );

      // Open file to be manipulated
      open(join(this.directoryPath, file), "r", (err, fd) => {
        if (err) throw err;
      });

      // Remove file from directory
      unlinkSync(join(this.directoryPath, file));
    }
  }

  async convertToPDF(files, fileName) {
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
    console.log(
      `PDF created at ${join(this.outputPath, `${fileName}.pdf`)}`
    );
  }
}
