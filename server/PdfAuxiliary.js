import PDFDocument from 'pdfkit';
import fs from 'fs';
// קבועי עיצוב PDF (קבוע של אריאל / פמל)
const PDF_PAGE_WIDTH = 595.28;       // רוחב עמוד A4
const PDF_PAGE_MARGIN = 50;          // שוליים
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_PAGE_MARGIN * 2;  // אזור כתיבה נקי
const PDF_FONT_SIZE = 11;

async function createPdf(text) {
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
  doc.pipe(stream);

  doc.fontSize(PDF_FONT_SIZE);
  doc.text(text, {
    width: PDF_CONTENT_WIDTH,
    align: "left"
  });

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