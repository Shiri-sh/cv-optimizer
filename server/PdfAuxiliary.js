import PDFDocument from 'pdfkit';
import fs from 'fs';

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_MARGIN = 50;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_PAGE_MARGIN * 2;
const PDF_FONT_SIZE = 11;

function parseBoldSegments(line) {
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), bold: false });
    }

    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push({ text: line.slice(lastIndex), bold: false });
  }
  return parts;
}

async function createPdf(text) {
  return new Promise((resolve, reject) => {
    try {
      const fullPath = "uploads/CV After changes.pdf";
      const doc = new PDFDocument({
        size: "A4",
        margins: {
          top: PDF_PAGE_MARGIN,
          bottom: PDF_PAGE_MARGIN,
          left: PDF_PAGE_MARGIN,
          right: PDF_PAGE_MARGIN,
        }
      });

      const stream = fs.createWriteStream(fullPath);
      stream.on("error", (err) => {
        console.error("PDF stream error:", err);
        reject(err);
      });
      stream.on("finish", () => {
        console.log("PDF finished writing.");
        resolve();
      });

      doc.pipe(stream);
      doc.fontSize(PDF_FONT_SIZE);

      const lines = text.split("\n");

      for (const line of lines) {
        if (line.trim() === "") {
          doc.moveDown();
          continue;
        }

        const segments = parseBoldSegments(line);

        segments.forEach((seg, index) => {
          doc.font(seg.bold ? "Helvetica-Bold" : "Helvetica")
            .text(seg.text, {
              width: PDF_CONTENT_WIDTH,
              continued: index < segments.length - 1
            });
        });

        doc.text("");
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}


function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function eraseOldFiles(filePath) {
   fs.unlink(filePath, (err) => {
     if (err) {
       console.error(`Error deleting file: ${err}`);
     } else {
       console.log(`File deleted: ${filePath}`);
     }
    });
};

export { createPdf, fileToGenerativePart, eraseOldFiles }