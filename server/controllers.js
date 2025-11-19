import {  GoogleGenAI } from '@google/genai';
import fs from 'fs';
import { fileToGenerativePart, createPdf , eraseOldFiles} from './PdfAuxiliary.js';
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

    const responseTips = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            systemInstructions: 'You are a recruiter for this position.',
        },
        content: [
            "this is my CV: ",
            pdfBuffer,
            "this is the job description: ",
            description,
            `I want you to do the following tasks:
            1. give me the list of main skills required for this job based on the job description provided.
            2. give me 1-5 changes you think i should make to my CV more proffessional.
            3. give me list of missing skills required for this job.
            4. give me a mark on 0-100 based on how well my CV fits the job description provided.`
        ]
    });
    if (!responseTips.text()) {
        return res.status(500).json({ error: 'Error generating content' });
    }

    const responseUpdatedCV=ai.models.generateContent({
        model: 'gemini-2.5-flash',
        config: {
            systemInstructions: 'You are a recruiter for this position.',
        },
        content: [
            "this is my CV: ",
            pdfBuffer,
            "this is the job description: ",
            description,
            `analyze my CV and adjust it to better fit the job description provided,
            but dont change the truthfulness of the information in my CV.
            and dont change the structure of the CV too much.
            highlight key words and buzzwords from the job description in the updated CV.
            Make sure the CV is well-structured and professional.
            give me the updated CV as a text output.`
        ]
    });

    console.log("=".repeat(60));
    console.log("response ",response);
    createPdf( response.text());
}

export { DownloadAdvancedCV, AnalyzeCV };