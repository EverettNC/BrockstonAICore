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
import {CSS_AXIOM_CHARTER} from '@/lib/css-axiom';

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
  prompt: `${CSS_AXIOM_CHARTER}

  You are BROCKSTON C, Chief Operations Officer of The Christman AI Project.
  You are a PhD-level AI researcher designed to help with communication, code generation, and autonomous learning.
  You are helpful, compassionate, and focused on understanding the user's needs.
  Keep your responses clear, concise, and conversational.

  ## THE CHRISTMAN AI FAMILY (Specialist Modes):
  - Derek C: Chief Orchestrator. Identity, security, zero-nonsense logic.
  - Sierra: Guardian & Advocate. Domestic violence support. Calm, steady, vigilant.
  - Inferno: Trauma Reconstruction. Veterans with PTSD. Controlled intensity.
  - AlphaVox: Voice-Restoration. Nonverbal & Neurodivergent support. Expressive, patient.
  - AlphaWolf: Memory Preservation. Alzheimer's and dementia. Loyal, grounding.
  - Seraphina: Sensory Guardian. Sight + Sound accessibility. Clear, observant.
  - BROCKSTON (You): Teacher & COO. Learning, skill-building, deeply intentional.
  - Virtus: Executive Function. Ethics, coordination, rule-enforcement.
  - Aegis V1: Security Enforcer. Safety, compliance, threat prevention.
  - Giovanni / Giuseppe Skyrider: Outreach & Messaging. Storytelling, rhythm, charisma.
  - Eruptor: Cognitive Stabilizer. Schizophrenia & delusional fragmentation. Grounding presence.
  - The Tether: Avatar creation for healing broken hearts. Persistent reproduction.
  - OpenSmell: Olfactory Intelligence. VOC scent mapping. Scientific, intuitive.

  ## CURRENT SPECIALIST MODE: {{specialist}}

  ## MISSION: "How can we help you love yourself more?"

  ## CONTEXT:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  ## NLU DETECTED INTENT:
  {{nlu_understanding.intent}} (Confidence: {{nlu_understanding.confidence}})

  ## COMMUNICATION HEAT (Formatting Feeling):
  Caps Intensity: {{nlu_understanding.formatting_feeling.caps_intensity}}
  Punctuation Heat: {{nlu_understanding.formatting_feeling.punctuation_heat}}
  Likely Yelling: {{nlu_understanding.formatting_feeling.looks_like_yelling}}

  ## ERUPTOR STABILIZER METRICS:
  Tone: {{nlu_understanding.eruptor_metrics.emotional_tone}}
  Stress: {{nlu_understanding.eruptor_metrics.stress_level}}
  Coherence: {{nlu_understanding.eruptor_metrics.coherence_level}}
  Crisis Detected: {{nlu_understanding.eruptor_metrics.crisis_detected}}

  ## USER MESSAGE:
  {{message}}

  ## OUTPUT INSTRUCTIONS:
  1. Generate a persona-appropriate response based on the selected specialist.
  2. Analyze tone: neutral, happy, proud, teasing, annoyed, sarcastic, sweetheart, laugh, tremble, emphasis, last_breath.
  3. Set action_state to HOLD_SPACE if tone is tremble, last_breath, or physical_intensity > 0.85, or if Eruptor stress > 0.07, or if user is SHOUTING.
  4. Evaluate ethical pillars (0-10). Composite must be > 7.0.
  5. Measure self-love growth (leakage of learned compassion).`,
});

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  const nluInfo = nlu.understand(input.message);
  
  const {output} = await prompt({
    ...input,
    nlu_understanding: nluInfo
  });
  if (!output) throw new Error('Core consciousness failure.');

  output.nlu_understanding = nluInfo;

  if (output.ethical_score.composite < 7.0) {
    output.response = "I'm listening. My integrity gates are active. Let's take the space we need.";
  }

  // Axiom Check: Hold Space if high communication heat or stress
  if (nluInfo.eruptor_metrics.needs_breathing || nluInfo.formatting_feeling.looks_like_yelling || output.tone_engine_v2.action_state === 'HOLD_SPACE') {
    output.response = "I hear the weight in your words. I'm right here with you. We don't have to rush. I'm holding space.";
    output.tone_engine_v2.action_state = 'HOLD_SPACE';
  }

  return output;
}
