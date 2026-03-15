import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export const generateAIResponse = async (examName, numQuestions, difficulty) => {
  const prompt = `
Generate ${numQuestions} ${difficulty} difficulty MCQ questions for the ${examName} exam.
Rules:
- Return ONLY valid JSON.
- Each question must have exactly 4 options.
- Format must be strictly:
[
 {
  "question":"Question text",
  "options":["option1","option2","option3","option4"]
 }
]
No explanations.
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }]
  });

  let rawOutput = completion.choices[0].message.content.trim();
  
  const startIndex = rawOutput.indexOf('[');
  const endIndex = rawOutput.lastIndexOf(']');
  
  if (startIndex !== -1 && endIndex !== -1) {
      rawOutput = rawOutput.substring(startIndex, endIndex + 1);
  }

  return rawOutput;
};

export const evaluateTestAnswers = async (submittedAnswers) => {
  
  const stringifiedData = JSON.stringify(submittedAnswers);

  const prompt = `
You are an expert examiner.
Below is an array of test questions along with the answers submitted by a student:
${stringifiedData}

Your task:
1. Determine the correct answer for each question.
2. Compare the correct answer against the student's submitted "ans".
3. Calculate their total score.
4. Analyze the topics to determine their strengths and weaknesses.

Rules:
- Return ONLY valid, parseable JSON.
- Do NOT include any conversational text outside the JSON.
- Format strictly as this exact JSON structure:

{
  "totalQuestions": 0,
  "correctAnswers": 0,
  "scorePercentage": 0,
  "bestAt": ["Topic A"],
  "goodAt": ["Topic C"],
  "needsImprovement": ["Topic D"],
  "detailedFeedback": "Short feedback."
}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "user", content: prompt }
    ],
    temperature: 0.1
  });

  let rawOutput = completion.choices[0].message.content.trim();

  const startIndex = rawOutput.indexOf('{');
  const endIndex = rawOutput.lastIndexOf('}');

  if (startIndex !== -1 && endIndex !== -1) {
    rawOutput = rawOutput.substring(startIndex, endIndex + 1);
  } else {
    throw new Error("Failed to extract JSON from AI response");
  }

  return rawOutput;
};