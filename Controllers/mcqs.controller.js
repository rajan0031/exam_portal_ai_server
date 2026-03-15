import { generateAIResponse, evaluateTestAnswers } from "../Services/mcqs.service.js";

// 🌟 Evaluate the user's submitted test!
export const getAIResponse = async (req, res) => {
  try {
    // 📥 1. Extract the submitted array of { question, ans } from the request body
    const { answers } = req.body; 

    // 🛑 2. Validation check to ensure data exists!
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Please provide a valid array of submitted answers!"
      });
    }

    // 🚀 3. Send the data to the Groq AI service for deep analysis!
    const evaluation = await evaluateTestAnswers(answers);

    // 🎯 4. Parse the AI's JSON string into an actual JavaScript object
    const parsedEvaluation = JSON.parse(evaluation);

    // ✅ 5. Send the beautiful evaluation back to the frontend!
    res.status(200).json({
      success: true,
      data: parsedEvaluation
    });

  } catch (error) {
    console.error("❌ Error during test evaluation:", error);
    res.status(500).json({
      success: false,
      message: "🚨 Server Error: Could not evaluate the test."
    });
  }
};

// 🌟 Generate MCQs (Your existing code, kept perfectly intact!)
export const generateMCQS = async (req, res) => {
  try {
    const { examName, numQuestions, difficulty } = req.body;
    const result = await generateAIResponse(examName, numQuestions, difficulty);
    
    res.status(200).json({
      success: true,
      data: JSON.parse(result) // 💡 Pro-tip: Parse it here so the frontend gets an object, not a string!
    });
  } catch (error) {
    console.error("❌ Error generating MCQs:", error);
    res.status(500).json({
      success: false,
      message: "🚨 Error generating MCQs"
    });
  }
};