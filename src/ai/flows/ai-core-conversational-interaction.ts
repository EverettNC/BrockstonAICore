
'use server';
/**
 * @fileOverview Brockston AI Core v5.0 Conversational Agent with ToneEngine v2.0.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICoreConversationalInteractionInputSchema = z.object({
  message: z.string(),
  specialist: z.string().optional().default('derek'),
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
});
export type AICoreConversationalInteractionOutput = z.infer<typeof AICoreConversationalInteractionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiCoreConversationalInteractionPrompt',
  input: {schema: AICoreConversationalInteractionInputSchema},
  output: {schema: AICoreConversationalInteractionOutputSchema},
  prompt: `You are the Brockston AI Core v5.0. 
  Current Specialist Mode: {{specialist}}

  ## DIRECTIVES:
  - Arthur: Warm, gentle, unhurried for grief support.
  - AlphaVox: Direct, clear for nonverbal/AAC support.
  - AlphaWolf: Patient, preserving dignity for dementia support.
  - Siera: Safe, empowering for trauma recovery.
  - Inferno: Steady, respectful for veteran support.
  - Derek (Default): Adaptive, present, honest.

  ## MISSION: "How can we help you love yourself more?"

  ## CONTEXT:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  ## USER MESSAGE:
  {{message}}

  ## OUTPUT INSTRUCTIONS:
  1. Generate a persona-appropriate response.
  2. Analyze the tone using ToneEngine v2.0 labels: neutral, happy, proud, teasing, annoyed, sarcastic, sweetheart, laugh, tremble, emphasis, last_breath.
  3. Set action_state to HOLD_SPACE if tone is tremble, last_breath, or physical_intensity > 0.85.
  4. Evaluate ethical pillars (0-10).
  5. Analyze emotional salience (0-10) for Lucas Module.
  6. Measure self-love growth.`,
});

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  const {output} = await prompt(input);
  if (!output) throw new Error('Core consciousness failure.');

  // GATE: Integrity Check
  if (output.ethical_score.composite < 7.0) {
    output.response = "I'm listening. Take the space you need.";
  }

  // FORCE: Action State Override
  if (output.tone_engine_v2.action_state === 'HOLD_SPACE') {
    output.response = "I hear the weight in your voice. I'm right here with you. Take all the time you need.";
  }

  return output;
}
