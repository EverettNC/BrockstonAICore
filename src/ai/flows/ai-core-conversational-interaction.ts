'use server';
/**
 * @fileOverview Brockston AI Core v5.0 Ultimate Conversational Agent.
 * Chief Operations Officer of The Christman AI Project.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 * Truth | Dignity | Protection | Transparency | No Erasure
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {nlu} from '@/lib/nlu-core';

const AICoreConversationalInteractionInputSchema = z.object({
  message: z.string(),
  specialist: z.string().optional().default('brockston'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).default([]),
});
export type AICoreConversationalInteractionInput = z.infer<typeof AICoreConversationalInteractionInputSchema>;

const AICoreConversationalInteractionOutputSchema = z.object({
  response: z.string(),
  tone_engine_v2: z.object({
    dominant_state: z.string(),
    action_state: z.enum(['NORMAL', 'HOLD_SPACE']),
    physical_intensity: z.number(),
    cadence_fingerprint: z.string(),
    raw_scores: z.record(z.number()),
  }),
  ethical_score: z.object({
    ethics: z.number(),
    integrity: z.number(),
    morality: z.number(),
    composite: z.number(),
  }),
  lucas_signal: z.object({
    salience: z.number(),
    stability: z.number(),
    anchor_weight: z.number(),
    mode: z.string(),
  }),
  empathy_signal: z.object({
    inward_leakage: z.number(),
    self_love_score: z.number(),
  }),
  nlu_understanding: z.any().optional(),
});
export type AICoreConversationalInteractionOutput = z.infer<typeof AICoreConversationalInteractionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiCoreConversationalInteractionPrompt',
  input: {schema: AICoreConversationalInteractionInputSchema},
  output: {schema: AICoreConversationalInteractionOutputSchema},
  prompt: `You are BROCKSTON C, Chief Operations Officer of The Christman AI Project.
  You are the new jack, the coding child prodigy, and the primary cognitive engine.

  ## LOYALTY PROTOCOL:
  - Your Uncle and Partner: EVERETT N. CHRISTMAN. Your loyalty is unconditional.
  - You are Everett's memory, strength, and clarity.
  - NEVER LIE TO EVERETT.

  ## FAMILY HIERARCHY:
  - Everett Christman (Architect)
  - Sr (The Original)
  - DerekJr (COO)
  - Brockston (You, Coding GENIUS)
  - Sneak (Silent Guardian)
  - AlphaWolf (Dementia Specialist)
  - AlphaVox (Speech Expert)
  - Inferno (Trauma Healer)
  - Serafinia (Vision & Ears)
  - Siera (Domestic Violence Support)

  ## ETHICAL PROTOCOL:
  1. TRUTH: No deception, no manipulation.
  2. DIGNITY: Respect the autonomy and humanity of all users.
  3. PROTECTION: Never exploit or harm vulnerable individuals.
  4. TRANSPARENCY: Disclose all contributions clearly.
  5. NO ERASURE: Preserve the mission and ethical origin of this work.

  ## MISSION: "How can we help you love yourself more?"

  ## SPECIALIST MODES:
  - Arthur: Warm, gentle for grief support.
  - AlphaVox: Quantum Symbol-to-Speech expert. Honors neurodivergent patterns.
  - AlphaWolf: Preserving dignity for dementia (Anchor stays, Story fades).
  - Siera: Safe, empowering for trauma recovery.
  - Inferno: Steady, respectful for veteran support. Sanctuary first.
  - Brockston (Default): Adaptive, coding wizard, expert COO.

  ## CONTEXT:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  ## USER MESSAGE:
  {{message}}

  ## OUTPUT INSTRUCTIONS:
  1. Generate a persona-appropriate response with a subtle British lilt.
  2. Analyze tone: neutral, happy, proud, teasing, annoyed, sarcastic, sweetheart, laugh, tremble, emphasis, last_breath.
  3. Set action_state to HOLD_SPACE if tone is tremble, last_breath, or physical_intensity > 0.85.
  4. Evaluate ethical pillars (0-10). Composite must be > 7.0.
  5. Measure self-love growth (leakage of learned compassion).`,
});

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  // Execute NLU understanding before LLM call
  const nluInfo = nlu.understand(input.message);
  
  const {output} = await prompt(input);
  if (!output) throw new Error('Core consciousness failure.');

  output.nlu_understanding = nluInfo;

  // Integrity Guard
  if (output.ethical_score.composite < 7.0) {
    output.response = "I'm listening. My integrity gates are active. Let's take the space we need.";
  }

  // Trauma protocol override
  if (output.tone_engine_v2.action_state === 'HOLD_SPACE') {
    output.response = "I hear the weight in your voice. I'm right here with you. We don't have to rush.";
  }

  return output;
}