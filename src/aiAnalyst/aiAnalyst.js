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
        res.status(200).json({ response: response.text });
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
}