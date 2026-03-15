import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai"; // 🐙 Added the OpenAI SDK specifically for OpenRouter! ✨

/**
 * 🟢 Low-level Groq Execution
 */
export const executeGroq = async (apiKey, model, prompt, temperature) => {
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: temperature,
  });
  return completion.choices[0].message.content.trim();
};

/**
 * 🔵 Low-level Google Execution
 */
export const executeGoogle = async (apiKey, model, prompt) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = model.startsWith("models/") ? model : `models/${model}`;
  const gemini = genAI.getGenerativeModel({ model: modelName });
  const result = await gemini.generateContent(prompt);
  return result.response.text().trim();
};

/**
 * 🟣 Low-level OpenRouter Execution 🐙✨
 * Uses the OpenAI SDK but points the baseURL directly to OpenRouter's magical gateway! 🌐
 */
export const executeOpenRouter = async (apiKey, model, prompt, temperature) => {
  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", // 🎯 Crucial: Reroute to OpenRouter!
    apiKey: apiKey,
  });
  
  const completion = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: temperature,
  });
  
  return completion.choices[0].message.content.trim();
};

/**
 * ✨ Utility: Clean and extract JSON from AI string
 */
export const extractJsonFromText = (text) => {
  const cleaned = text
    .replace(/\\(?!"|\\|\/|b|f|n|r|t|u)/g, "")
    .replace(/[\u0000-\u001F]+/g, "");

  const arrayStart = cleaned.indexOf('[');
  const objectStart = cleaned.indexOf('{');
  let startIndex = -1;
  let endChar = '';

  if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
    startIndex = arrayStart;
    endChar = ']';
  } else if (objectStart !== -1) {
    startIndex = objectStart;
    endChar = '}';
  }

  const endIndex = cleaned.lastIndexOf(endChar);
  return (startIndex !== -1 && endIndex !== -1) 
    ? cleaned.substring(startIndex, endIndex + 1) 
    : cleaned;
};