import { getAICompletion } from "../helper/modelSelection.js";
import { getMCQGenerationPrompt, getEvaluationPrompt } from "../helper/promptHelper.js";

/**
 * 🛠️ Extracts and PARSES JSON to ensure it's a valid Object/Array
 */
const parseAIJson = (text, startChar) => {
  const startIndex = text.indexOf(startChar);
  const endChar = startChar === '[' ? ']' : '}';
  const endIndex = text.lastIndexOf(endChar);
  
  if (startIndex !== -1 && endIndex !== -1) {
    const jsonString = text.substring(startIndex, endIndex + 1);
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
      return null;
    }
  }
  return null;
};

// 🌟 Generate MCQ Questions
export const generateAIResponse = async (examName, numQuestions, difficulty) => {
  // 📥 Get prompt from helper
  const prompt = getMCQGenerationPrompt(examName, numQuestions, difficulty);

  const rawOutput = await getAICompletion(prompt, 0.7); 
  const parsedData = parseAIJson(rawOutput, '[');
  
  if (!parsedData) throw new Error("AI failed to generate valid question format 📉");
  return parsedData; 
};

// 📊 Evaluate Test Answers
export const evaluateTestAnswers = async (submittedAnswers) => {
  // 📥 Get prompt from helper
  const prompt = getEvaluationPrompt(submittedAnswers);

  const rawOutput = await getAICompletion(prompt, 0.1);
  const parsedResult = parseAIJson(rawOutput, '{');

  if (!parsedResult) throw new Error("Evaluation failed");
  return parsedResult;
};