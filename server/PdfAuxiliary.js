import PDFDocument from 'pdfkit';
import fs from 'fs';
async function createPdf(text) {
const fullPath = "uploads/CV After changes.pdf";

  const doc = new PDFDocument();
  const stream = fs.createWriteStream(fullPath);

  doc.pipe(stream);

  doc.fontSize(12);
  doc.text(text);

  doc.end();
          
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
function extractTextBlock(text) {
  if (!text) return "";

  const parts = text.split("```");

  let block = parts.length >= 2 ? parts[1] : text;

  return block
      .replace(/^(\w+)?\n?/, "") 
      .trim();
}

export { createPdf, fileToGenerativePart, eraseOldFiles ,extractTextBlock}