import { getRandomConfig } from "./modelSelectionHelper.js";
import { executeGroq, executeGoogle, executeOpenRouter, extractJsonFromText } from "./aiExecution.js";

/**
 * The main entry point for AI calls
 */
export const getAICompletion = async (prompt, temperature = 0.1, retryCount = 0, lastFailedProvider = "") => {
  // 1. Pick a config (Provider, Key, Model)
  const { provider, apiKey, model } = getRandomConfig(lastFailedProvider);
  
  try {
    console.log(`[Attempt ${retryCount + 1}] Selected: ${provider.toUpperCase()}`);

    if (!apiKey || !model) throw new Error("Missing credentials");

    let rawOutput = "";

    // 2. Route to the correct execution logic
    if (provider === "groq") {
      rawOutput = await executeGroq(apiKey, model, prompt, temperature);
    } 
    else if (provider === "google") {
      rawOutput = await executeGoogle(apiKey, model, prompt);
    }
    else if (provider === "openrouter") {
      rawOutput = await executeOpenRouter(apiKey, model, prompt, temperature);
    }

    // 3. Clean and return the JSON
    return extractJsonFromText(rawOutput);

  } catch (error) {
    console.error(`${provider.toUpperCase()} Error:`, error.message);

    // 4. Failover Logic: Try a different provider if available
    if (retryCount < 2) {
      console.log(`Switching providers for attempt ${retryCount + 2}...`);
      return getAICompletion(prompt, temperature, retryCount + 1, provider);
    }

    throw new Error(`AI Pool Exhausted: ${error.message}`);
  }
};