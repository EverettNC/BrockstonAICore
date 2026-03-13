import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * @fileOverview BROCKSTON Silicon Neural Cortex v5.0.
 * Proprietary cognitive engine powered by Gemini 1.5 Pro.
 */

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  model: 'googleai/gemini-1.5-pro',
});