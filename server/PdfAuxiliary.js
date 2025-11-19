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

function fileToGenerativePart(file, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(file).toString("base64"),
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

export { createPdf, fileToGenerativePart, eraseOldFiles };