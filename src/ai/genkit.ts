import {genkit} from 'genkit';
import {anthropic, claude4Sonnet} from 'genkitx-anthropic';
import {ollama} from 'genkitx-ollama';

/**
 * @fileOverview BROCKSTON Silicon Neural Cortex v5.0.
 * Dual-Engine Architecture:
 *   - Anthropic Claude  → Brockston's main voice, personality, conversation
 *   - Ollama (local)    → Background tasks: learning, self-correction, vision
 *
 * Ollama runs on this machine. No API key. No bill. No ceiling.
 * Currently running: qwen3-vl (vision + reasoning, 6.1GB)
 *
 * To run a different local model: ollama pull <model>
 * Options: llama3.2, mistral, phi4, deepseek-r1, gemma3
 */

export const ai = genkit({
  plugins: [
    anthropic(),
    ollama({
      serverAddress: 'http://127.0.0.1:11434',
    }),
  ],
  model: claude4Sonnet,
});

// Local model reference — no API key, runs on your machine
// llama3.2:1b = fast 1.2B model, responds in ~4s. Good for learning loops + self-correction.
// qwen3-vl = 8.8B vision model, too slow for server action timeouts.
// To upgrade: ollama pull llama3.2 (3B) or ollama pull phi4 (14B)
export const LOCAL_MODEL = 'ollama/qwen3';
