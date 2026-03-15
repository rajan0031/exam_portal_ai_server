import express from "express";
import { getAIResponse, generateMCQS } from "../Controllers/mcqs.controller.js";

const router = express.Router();

// Route to evaluate the user answers
router.post("/check", getAIResponse);

// Route to generate new MCQs
router.post("/generate", generateMCQS);

export default router;