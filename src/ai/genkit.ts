import {genkit} from 'genkit';
import {ollama} from 'genkitx-ollama';

/**
 * @fileOverview BROCKSTON Silicon Neural Cortex v5.0 — Full Local Mode.
 * All inference runs on-device via Ollama. No API keys. No billing. No ceiling.
 *
 * Active models (ollama list):
 *   qwen2.5-coder:32b   — main voice, conversation, reasoning, and code (32B)
 */

export const LOCAL_MODEL = 'ollama/qwen2.5-coder:32b';
export const LOCAL_CODE_MODEL = 'ollama/qwen2.5-coder:32b';
export const LOCAL_FAST_MODEL = 'ollama/qwen2.5-coder:32b';

export const ai = genkit({
  plugins: [
    ollama({
      serverAddress: 'http://127.0.0.1:11434',
      models: [
        { name: 'qwen2.5-coder:32b', type: 'generate' },
      ],
    }),
  ],
  model: LOCAL_MODEL,
});
