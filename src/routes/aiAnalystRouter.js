import { aiAnalyst, saveAiAnalystResponse, getAiAnalystResponseById } from "../aiAnalyst/aiAnalyst.js";
import { Router } from "express";

const router = Router();

router.post("/ai-analyst", aiAnalyst); // AI Analyst route
router.post("/save-ai-analyst-response", saveAiAnalystResponse); // Save AI Analyst response route
router.get("/ai-analyst-response/:userId", getAiAnalystResponseById); // Get

export default router;