import pdfKit from 'pdfkit';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import multer from 'multer';
import { GenerativeAIClient, TextPrompt } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;
const geminiApiKey = process.env.GEMINI_API_KEY;

const aiClient = new GenerativeAIClient({
  apiKey: geminiApiKey,
});
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}
function createPdf(res, content) {
  const doc = new pdfKit();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="file.pdf"');

  doc.pipe(res);         
  
  doc.text(content);       
  
  doc.end();             
}