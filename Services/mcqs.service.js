import { getAICompletion } from "../helper/modelSelection.js";

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
      return JSON.parse(jsonString); // ✅ Always return an Object, not a String!
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
      return null;
    }
  }
  return null;
};

// 🌟 Generate MCQ Questions
export const generateAIResponse = async (examName, numQuestions, difficulty) => {
  const prompt = `
Generate ${numQuestions} ${difficulty} difficulty MCQ questions for the ${examName} exam.
Rules:
- Return ONLY valid JSON.
- Format: [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A" 
    }
  ]
- The "answer" MUST match one of the strings in the "options" array exactly. 🎯
`;

  const rawOutput = await getAICompletion(prompt, 0.7); 
  const parsedData = parseAIJson(rawOutput, '[');
  
  if (!parsedData) throw new Error("AI failed to generate valid question format 📉");
  return parsedData; 
};

// 📊 Evaluate Test Answers
export const evaluateTestAnswers = async (submittedAnswers) => {
  const stringifiedData = JSON.stringify(submittedAnswers);

  const prompt = `
You are an expert examiner. Analyze these student submissions:
${stringifiedData}

Return ONLY a JSON object:
{
  "totalQuestions": 0,
  "correctAnswers": 0,
  "scorePercentage": 0,
  "bestAt": ["Topic"],
  "goodAt": ["Topic"],
  "needsImprovement": ["Topic"],
  "detailedFeedback": "text"
}
`;

  const rawOutput = await getAICompletion(prompt, 0.1);
  const parsedResult = parseAIJson(rawOutput, '{');

  if (!parsedResult) throw new Error("Evaluation failed 📉");
  return parsedResult;
};