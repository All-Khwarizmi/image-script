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

export default class ImageProcessor {
  constructor() {
    const __dirname = path.dirname(__filename);
    this.directoryPath = join(__dirname, "..");
    this.outputPath = join(this.directoryPath, "aaaoutput");
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
      console.log(`Writing file: ${file}`);
      writeFileSync(
        join(this.directoryPath, "png", `${file}.png`),
        outputBuffer
      );
    }
  }

  async #copyFilesFromHeicToPng(files, directoryPath) {
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
  async #convertImageWthImgToPDF(files, fileName) {
    console.log({ "files in convertImage": files });

    // Open the files and convert them to buffer
    const images = files.map((file) => {
      const buffer = readFileSync(join(directoryPath, "png", file));
      return buffer;
    });

    console.log({ images });
    const pdf = imgToPDF(images, imgToPDF.sizes.A4).pipe(
      createWriteStream(
        join(directoryPath, "aaaoutput", `${fileName.value}.pdf`)
      )
    );
    console.log(pdf);
    console.log("The PDF has been created");
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

  async shrinkPdfFile(fileName) {
    // Compress the pdf file
    const pdfConvert = new PdfConvert(join(this.outputPath, `${fileName}.pdf`));
    const shrunkenPdf = await pdfConvert.shrink({
      compress: true,
      log: true,
      resolution: 72,
    });
    writeFileSync(
      join(this.outputPath, `${fileName}-compressed.pdf`),
      shrunkenPdf
    );

    console.log("The PDF has been compressed");
  }
}
