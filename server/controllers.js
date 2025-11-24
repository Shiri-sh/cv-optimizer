import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { fileToGenerativePart, createPdf, eraseOldFiles } from './PdfAuxiliary.js';
import dotnev from 'dotenv';

dotnev.config();

const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

const DownloadAdvancedCV = async (req, res) => {
  try {
    const filePath = path.resolve("uploads/CV After changes.pdf");

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath, "CV After changes.pdf", (err) => {
      if (err) {
        console.error("Download error:", err);
        return res.status(500).json({ error: "Server error" });
      }
    });

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


const AnalyzeCV = async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: 'Job description is required' });
  }
  if (!req.file) {
    return res.status(401).json({ error: 'No file uploaded' });
  }

  const pdfBuffer = fileToGenerativePart(req.file.path, req.file.mimetype) || null;
  if (!pdfBuffer) {
    return res.status(501).json({ error: 'Error processing file' });
  }
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      {
        role: "user",
        parts: [{ text: "this is my CV: " }, pdfBuffer, { text: "this is the job description: " + description }],
      },
    ],
    config: {
      systemInstructions: 'You are a recruiter for this position.',
    },
  });
  const responseTips = await chat.sendMessage({
    message: `I want you to do the following tasks:
        1. give me the list of main skills required for this job based on the job description provided.
        2. give me 1-5 changes you think i should make to my CV more proffessional.
        3. give me list of missing skills required for this job.
        4. give me a mark on 0-100 based on how well my CV fits the job description provided.`,
  });
  if (!responseTips) {
    return res.status(500).json({ error: 'Error generating content' });
  }
  const responseUpdatedCV = await chat.sendMessage({
    message:
    `Analyze my resume and rewrite it to match the job description provided.

    Constraints:
    - Do NOT add any introductions, explanations, or AI wording. Output ONLY the resume.
    - Keep my first name and title exactly as in the original resume.
    - Maintain the original structure as much as possible.
    - Do NOT invent information. Improve wording but keep full factual accuracy.
    - Mark keywords from the job description using bold formatting.
    - The final resume MUST fit on ONE A4 page when rendered in PDF with the following parameters:
        • Font size: 11
        • Page width: 595px (A4)
        • Margins: 50px on all sides
        • Usable text width: 495px
    - To ensure the resume fits on one page:
        • Limit the entire output to MAXIMUM 2500 characters.
        • No individual line should exceed 90 characters.
        • Keep paragraphs concise.
        • Remove content that does not support the role.
    
    Output requirements:
    - Output ONLY the final CV text.
    - No greetings, no explanations, no “Here is your improved resume”.
    - Direct resume text only.
    
    .`
  });
  const justTextCV =responseUpdatedCV.text;
  await eraseOldFiles('uploads/CV before Changes.pdf');
  await createPdf(justTextCV);
    res.json({
    success: true,
    tips: responseTips.text,
  });
}

export { DownloadAdvancedCV, AnalyzeCV };