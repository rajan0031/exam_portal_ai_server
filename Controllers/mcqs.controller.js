import { generateAIResponse, evaluateTestAnswers } from "../Services/mcqs.service.js";

// 🌟 Evaluate the user's submitted test!
export const getAIResponse = async (req, res) => {
  try {
    const { answers } = req.body; 

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "⚠️ Please provide a valid array of submitted answers!"
      });
    }

    // 🚀 The service now returns a PARSED OBJECT, not a string!
    const evaluation = await evaluateTestAnswers(answers);

    res.status(200).json({
      success: true,
      data: evaluation // ✅ No JSON.parse() needed here anymore!
    });

  } catch (error) {
    console.error("❌ Error during test evaluation:", error);
    res.status(500).json({
      success: false,
      message: "🚨 Server Error: Could not evaluate the test."
    });
  }
};

// 🌟 Generate MCQs
export const generateMCQS = async (req, res) => {
  try {
    const { examName, numQuestions, difficulty } = req.body;
    
    // 💡 Service already handles extraction and parsing!
    const result = await generateAIResponse(examName, numQuestions, difficulty);
    
    res.status(200).json({
      success: true,
      data: result // ✅ Clean and ready for the frontend!
    });
  } catch (error) {
    console.error("❌ Error generating MCQs:", error);
    res.status(500).json({
      success: false,
      message: "🚨 Error generating MCQs"
    });
  }
};