/**
 * 📝 Template for generating MCQ questions
 */
export const getMCQGenerationPrompt = (examName, numQuestions, difficulty) => {
  return `
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
};

/**
 * 📊 Template for evaluating student answers
 */
export const getEvaluationPrompt = (submittedAnswers) => {
  const stringifiedData = JSON.stringify(submittedAnswers);
  return `
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
};