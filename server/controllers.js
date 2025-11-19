import {  GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { fileToGenerativePart, createPdf , eraseOldFiles,extractTextBlock} from './PdfAuxiliary.js';
import dotnev, { config } from 'dotenv';
dotnev.config();
import multer from 'multer';
const geminiApiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
    apiKey: geminiApiKey,
});

const DownloadAdvancedCV = async (req, res) => {

}
const AnalyzeCV = async (req, res) => {
    console.log("AnalyzeCV called");
    //console.log("req ",req);
    const {description } = req.body;
    if (!description) {
        return res.status(400).json({ error: 'Job description is required' });
    }
    if (!req.file) {
        return res.status(401).json({ error: 'No file uploaded' });
    }

    const pdfBuffer = fileToGenerativePart(req.file.path, req.file.mimetype) || null;
    console.log("=".repeat(60));
    console.log("pdfBuffer ", pdfBuffer);
    if (!pdfBuffer) {
        return res.status(501).json({ error: 'Error processing file' });
    }
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: [
          {
            role: "user",
            parts: [{ text:"this is my CV: " },pdfBuffer,{ text:"this is the job description: "+ description}],
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
    //  const tipsText = responseTips.candidates[0].content[0];
console.log("TIPS Text:", responseTips.text);

    
    if (!responseTips) {
        return res.status(500).json({ error: 'Error generating content' });
    }
    console.log("=".repeat(60));
    const responseUpdatedCV=await chat.sendMessage({
       message:
            `analyze my CV and adjust it to better fit the job description provided,
            but dont change the truthfulness of the information in my CV.
            and dont change the structure of the CV too much.
            highlight key words and buzzwords from the job description in the updated CV.
            Make sure the CV is well-structured and professional.
            give me the updated CV as a text output.`
    });
   // const updatedCVText = responseUpdatedCV.candidates[0].content[0];
    console.log("Updated CV:", responseUpdatedCV.text);
    console.log("=".repeat(60));
    const justTextCV = extractTextBlock(responseUpdatedCV.text);
    //const justTextCV=(responseUpdatedCV.text).split("```")[1];
    console.log("=".repeat(60));
    console.log(justTextCV);
    //await createPdf(justTextCV);

    res.json({
        success: true,
        tips: responseTips.text,
    });
}

export { DownloadAdvancedCV, AnalyzeCV };