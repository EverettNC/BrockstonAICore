import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {anthropic} from 'genkitx-anthropic';

export const ai = genkit({
  plugins: [
    googleAI(),
    anthropic(),
  ],
  model: 'claude-3-5-sonnet-20241022',
});
