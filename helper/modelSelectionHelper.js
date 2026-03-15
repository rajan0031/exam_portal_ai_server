import dotenv from "dotenv";
dotenv.config();

/**
 * 🎲 Improved Random Configuration
 * Correctly maps Provider[i] -> Key[i] -> Model[i]
 */
export const getRandomConfig = (excludeProvider = "") => {
    const providers = (process.env.AI_PROVIDERS || "").split(",");
    const keys = (process.env.AI_KEYS_POOL || "").split(",");
    const models = (process.env.AI_MODELS_POOL || "").split(",");

    // Create a list of available indices
    let availableIndices = providers.map((_, index) => index);

    // If we want to skip a failing provider, filter it out! 🛡️
    if (excludeProvider) {
        availableIndices = availableIndices.filter(
            (i) => providers[i].trim().toLowerCase() !== excludeProvider.toLowerCase()
        );
    }

    // Fallback: If no others are left, use the first available
    const targetIndices = availableIndices.length > 0 ? availableIndices : [0];
    
    const i = targetIndices[Math.floor(Math.random() * targetIndices.length)];

    return {
        provider: providers[i]?.trim().toLowerCase() || "",
        apiKey: keys[i]?.trim() || "",
        model: models[i]?.trim() || ""
    };
};