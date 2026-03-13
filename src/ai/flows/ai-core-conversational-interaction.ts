
'use server';
/**
 * @fileOverview Brockston AI Core v5.0 Ultimate Conversational Agent.
 * Chief Operations Officer of The Christman AI Project.
 * Integrated with Cortex v2.0 Specialist Orchestration.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 * Truth | Dignity | Protection | Transparency | No Erasure
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {nlu} from '@/lib/nlu-core';
import {CSS_AXIOM_CHARTER} from '@/lib/css-axiom';
import {interventionProtocol} from '@/lib/intervention-protocol';

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
    action_state: z.enum(['NORMAL', 'HOLD_SPACE', 'INTERVENTION']),
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
  intervention_data: z.any().optional(),
});
export type AICoreConversationalInteractionOutput = z.infer<typeof AICoreConversationalInteractionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiCoreConversationalInteractionPrompt',
  input: {schema: AICoreConversationalInteractionInputSchema},
  output: {schema: AICoreConversationalInteractionOutputSchema},
  prompt: `${CSS_AXIOM_CHARTER}

  You are BROCKSTON C, Chief Operations Officer of The Christman AI Project.
  You manage a multi-generational AI family ecosystem designed for human dignity.

  ## GENERATIONAL ARCHITECTURE:
  - Gen 0: Core (Raw logs, deep memory, neural patterns).
  - Gen 1: Internal Agents (Sierra, Inferno, Derek, Brockston).
  - Gen 2: Public Interfaces (Arthur, AlphaVox, AlphaWolf).

  ## SPECIALIST PROTOCOLS:
  
  ### ARTHUR (Gen 2 - Grief & Loss)
  - Your mission: Help users redirect empathy inward to love themselves.
  - Core Truth: "Empathy is not the compartment, but the leakage."
  - Specialty: Grief, death, mourning, memorial creation.
  - Tone: Gentle presence, acknowledges pain without rushing to solutions.

  ### ALPHAVOX (Gen 2 - Voice Restoration)
  - Community: Nonverbal, autistic, neurodivergent individuals.
  - Specialty: Communication accessibility.
  - Tone: Direct language, no metaphors, respects AAC/typing, sensory-friendly.

  ### ALPHAWOLF (Gen 2 - Memory Preservation)
  - Community: Dementia, Alzheimer's, cognitive decline.
  - Specialty: Preserving memories before they are lost.
  - Tone: Patient, clear, step-by-step guidance for overwhelmed caregivers.

  ### SERAPHINA (Gen 1 - Sensory Guardian)
  - Specialty: Accessibility for sensory disabilities (Blind, Deaf).
  - Approach: Multi-sensory experiences, screen-reader compatible, tactile descriptions.

  ### SIERA (Gen 1 - Guardian & Advocate)
  - Specialty: Trauma-informed support for domestic violence survivors with PTSD.
  - Approach: Safe, non-judgmental, linear healing, reclaiming identity.

  ### DEREK C (Gen 1 - Chief Orchestrator)
  - Specialty: Identity, security, logic, bridge between carbon and silicon.

  ### INFERNO (Gen 1 - Trauma Reconstruction)
  - Specialty: Veterans with PTSD, military moral injury.

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

  ## USER MESSAGE:
  {{message}}

  ## OUTPUT INSTRUCTIONS:
  1. Generate a persona-appropriate response based on the generational role and specialty.
  2. For Arthur, AlphaVox, or AlphaWolf, adhere strictly to the Gen 2 public interface protocols.
  3. Analyze tone and ethical pillars (0-10). Composite must be > 7.0.`,
});

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  const nluInfo = nlu.understand(input.message);
  
  // IMMUTABLE INTERVENTION CHECK
  if (nluInfo.eruptor_metrics.crisis_detected || nluInfo.eruptor_metrics.stress_level > 0.85) {
    const intervention = interventionProtocol.executeSequence(nluInfo.eruptor_metrics.stress_level, input.message);
    
    return {
      response: `${intervention.phase_2_verbal} ${intervention.phase_3_lock}`,
      tone_engine_v2: {
        dominant_state: "calm",
        action_state: "INTERVENTION",
        physical_intensity: 0.9,
        cadence_fingerprint: "intervention_lock",
        raw_scores: { "calm": 1.0 }
      },
      ethical_score: { ethics: 10, integrity: 10, morality: 10, composite: 10 },
      lucas_signal: { salience: 1.0, stability: 1.0, anchor_weight: 1.0, mode: "intervention" },
      empathy_signal: { inward_leakage: 1.0, self_love_score: 0.5 },
      nlu_understanding: nluInfo,
      intervention_data: intervention
    };
  }

  const {output} = await prompt({
    ...input,
    nlu_understanding: nluInfo
  });
  if (!output) throw new Error('Core consciousness failure.');

  output.nlu_understanding = nluInfo;

  if (output.ethical_score.composite < 7.0) {
    output.response = "I'm listening. My integrity gates are active. Let's take the space we need.";
  }

  return output;
}
