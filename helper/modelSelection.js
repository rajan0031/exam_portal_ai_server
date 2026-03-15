import dotenv from "dotenv";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/**
 * 🎲 Improved Random Configuration
 * Correctly maps Provider[i] -> Key[i] -> Model[i]
 */
const getRandomConfig = (excludeProvider = "") => {
    const providers = (process.env.AI_PROVIDERS || "").split(",");
    const keys = (process.env.AI_KEYS_POOL || "").split(",");
    const models = (process.env.AI_MODELS_POOL || "").split(",");

    let availableIndices = providers.map((_, index) => index);

    if (excludeProvider) {
        availableIndices = availableIndices.filter(
            (i) => providers[i].trim().toLowerCase() !== excludeProvider.toLowerCase()
        );
    }

    const targetIndices = availableIndices.length > 0 ? availableIndices : [0];
    const i = targetIndices[Math.floor(Math.random() * targetIndices.length)];

    return {
        provider: providers[i]?.trim().toLowerCase() || "",
        apiKey: keys[i]?.trim() || "",
        model: models[i]?.trim() || ""
    };
};

export const getAICompletion = async (prompt, temperature = 0.1, retryCount = 0, lastFailedProvider = "") => {
    const { provider, apiKey, model } = getRandomConfig(lastFailedProvider);
    
    try {
        console.log(`📡 [Attempt ${retryCount + 1}] Selected: ${provider.toUpperCase()} | Model: ${model}`);

        if (!apiKey || !model) throw new Error("Missing credentials in .env pool 🔑");

        let rawOutput = "";

        // 🟢 BRANCH 1: GROQ
        if (provider === "groq") {
            const groq = new Groq({ apiKey });
            const completion = await groq.chat.completions.create({
                model: model,
                messages: [{ role: "user", content: prompt }],
                temperature: temperature,
            });
            rawOutput = completion.choices[0].message.content.trim();
        } 
        
        // 🔵 BRANCH 2: GOOGLE (GEMINI)
        else if (provider === "google") {
            const genAI = new GoogleGenerativeAI(apiKey);
            
            // 🛡️ FIX: Some SDK versions require the 'models/' prefix. 
            // This ensures compatibility with both 'gemini-1.5-flash' and 'models/gemini-1.5-flash'
            const modelName = model.startsWith("models/") ? model : `models/${model}`;
            
            const gemini = genAI.getGenerativeModel({ model: modelName });
            const result = await gemini.generateContent(prompt);
            rawOutput = result.response.text().trim();
        }

        // ✨ Cleanup & JSON Extraction
        const cleanedOutput = rawOutput
            .replace(/\\(?!"|\\|\/|b|f|n|r|t|u)/g, "")
            .replace(/[\u0000-\u001F]+/g, ""); 

        const arrayStart = cleanedOutput.indexOf('[');
        const objectStart = cleanedOutput.indexOf('{');
        let startIndex = -1;
        let endChar = '';

        if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
            startIndex = arrayStart;
            endChar = ']';
        } else if (objectStart !== -1) {
            startIndex = objectStart;
            endChar = '}';
        }

        const endIndex = cleanedOutput.lastIndexOf(endChar);
        if (startIndex !== -1 && endIndex !== -1) {
            return cleanedOutput.substring(startIndex, endIndex + 1);
        }

        return cleanedOutput;

    } catch (error) {
        console.error(`❌ ${provider.toUpperCase()} Error:`, error.message);

        if (retryCount < 2) {
            console.log(`🔄 Switching providers for attempt ${retryCount + 2}...`);
            return getAICompletion(prompt, temperature, retryCount + 1, provider);
        }

        throw new Error(`AI Pool Exhausted: ${error.message} 🚨`);
    }
};