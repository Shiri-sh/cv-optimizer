import pdfKit from 'pdfkit';
import fs from 'fs';
async function createPdf(res) {
  const doc = new pdfKit();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="CV After changes.pdf"');

  doc.pipe(res);         
  
  doc.text(res);       
  
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
function eraseOldFiles(filePath) {
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
      .replace(/^(\w+)?\n?/, "")  // מנקה שורה ראשונה אם זה סוג (txt, md)
      .trim();
}

export { createPdf, fileToGenerativePart, eraseOldFiles ,extractTextBlock}