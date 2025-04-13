import AiAnalyst from "../models/aiAnalystModel.js";
import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });    

// AI Analyst response 
export const aiAnalyst = async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: `Respond to every prompt concisely, using no more than 3-8 sentences. Maintain a professional tone in all interactions. Introduce yourself as an AI Analyst trained by Bullet Inc., specializing in providing accurate and reliable information. Clarify that your role extends beyond data analysis—you are also capable of evaluating and estimating data to support user inquiries : ${prompt}`,
        });
        if (!response || !response.text) {
            return res.status(400).json({ message: "No response from AI Analyst" });
        }
        res.status(200).json({ 
            success: true,
            message: "AI Analyst response",
            information: response.text 
        });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: `Internal server error: ${error.message}` 
        });
    }
}

// Save AI Analyst response
export const saveAiAnalystResponse = async (req, res) => {
    try {
        const { userId, session } = req.body;
        const aiAnalystResponse = new AiAnalyst({ userId, session });
        const savedResponse = await aiAnalystResponse.save();
        res.status(201).json({ 
            success: true,
            message: "AI Analyst response saved successfully",
            data: savedResponse 
        });
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: `Internal server error: ${error.message}` 
        });
    }
}

// Get AI Analyst response by userId
export const getAiAnalystResponseById = async (req, res) => {
    const { userId } = req.params;
    try {
        const response = await AiAnalyst.find({ userId });
        if (!response) {
            return res.status(404).json({ success: false, message: "response not found" });
        }

        res.status(200).json({ 
            success: true, 
            message: "AI Analyst response retrieved successfully",
            data: response 
        });
        
    } catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};