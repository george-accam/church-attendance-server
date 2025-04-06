import { aiAnalyst } from "../aiAnalyst/aiAnalyst.js";
import { Router } from "express";

const router = Router();

router.get("/ai-analyst", aiAnalyst); // AI Analyst route

export default router;