import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
config();

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });    

export const aiAnalyst = async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
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