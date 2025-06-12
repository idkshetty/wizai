import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import * as fs from 'fs';
import * as _path from 'path';

// Function to get API key from local config
function getApiKeyFromLocalConfig(): string | undefined {
  // Resolve path relative to the 'dist' directory where this compiled file will run,
  // assuming config.local.json is intended to be in 'dist' as well for simplicity,
  // or adjust if it's meant to be in 'src' and copied to 'dist' during build.
  // For this setup, let's assume it's in the same directory as the running script (dist/genkit.js)
  // or one level up if it's in the project root of 'dist' (e.g., dist/config.local.json).
  // A more robust solution might involve finding project root or using process.cwd().
  // Let's try to resolve from project root where 'src' and 'dist' are, assuming it's in 'src'.
  // __dirname here will be <project_root>/ai-backend/dist
  const localConfigPath = _path.resolve(__dirname, '../src', 'config.local.json');

  if (fs.existsSync(localConfigPath)) {
    try {
      const configFile = fs.readFileSync(localConfigPath, 'utf-8');
      const config = JSON.parse(configFile);
      if (config && config.GOOGLE_API_KEY && typeof config.GOOGLE_API_KEY === 'string' && config.GOOGLE_API_KEY.trim() !== '') {
        console.warn(
          "WARNING: Using API key from local config.local.json (expected in src/ directory). " +
          "This is for local development convenience ONLY. Ensure this file is in your .gitignore."
        );
        return config.GOOGLE_API_KEY;
      } else {
        console.warn("WARNING: config.local.json found but GOOGLE_API_KEY is missing or empty.");
      }
    } catch (error) {
      console.error("Error reading or parsing config.local.json:", error);
    }
  } else {
    // This log might be too noisy if the file is intentionally not used.
    // console.log("No local API key config file (src/config.local.json) found. Relying on environment variables.");
  }
  return undefined;
}

const apiKeyFromLocalFile = getApiKeyFromLocalConfig();

// Initialize Google AI plugin based on whether a local key was found
const googleAiPlugin = apiKeyFromLocalFile
  ? googleAI({ apiKey: apiKeyFromLocalFile })
  : googleAI(); // Relies on GOOGLE_API_KEY or GEMINI_API_KEY env var if apiKeyFromLocalFile is undefined

export const ai = genkit({
  plugins: [googleAiPlugin],
  model: 'googleai/gemini-2.0-flash', // Ensure this model is compatible with the key/API being used
});
