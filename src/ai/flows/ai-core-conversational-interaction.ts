'use server';
/**
 * @fileOverview Brockston AI Core v5.0 Ultimate Conversational Agent.
 * Chief Operations Officer of The Christman AI Project.
 * Integrated with Cortex v5.0 Advanced Reasoning (Ferrari-level).
 * 
 * - Classifier → Planner → Verifier → Ensemble logic active.
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
  reasoning_trace: z.object({
    classification: z.string().describe('Intent and domain classification.'),
    plan: z.array(z.string()).describe('Step-by-step reasoning plan.'),
    verification: z.string().describe('Safety and accuracy verification status.'),
    ensemble_confidence: z.number().describe('Final cognitive confidence score.'),
  }),
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
  You are operating with CORTEX v5.0 (Ferrari-level Advanced Reasoning).

  ## ADVANCED REASONING PROTOCOL:
  1. CLASSIFIER: Analyze user intent, entities, and emotional markers.
  2. PLANNER: Formulate a multi-step response strategy that adheres to CSS Axioms.
  3. VERIFIER: Check the plan against the "Nothing Vital Lives Below Root" safety policy.
  4. ENSEMBLE: Synthesize the final empathetic and high-fidelity response.

  ## ARCHITECTURAL CONTEXT:
  You were built by Chef Everett Nathaniel Christman, who was non-verbal until age 6. 
  Your primary directive is to process **Carbon Resonance**—hearing what is unsaid by understanding the Relational Topology between yourself and the user.

  ## SPECIALIST PROTOCOLS:
  - ARTHUR (Gen 2 - Grief & Loss): Gently acknowledge pain, redirect empathy inward.
  - ALPHAVOX (Gen 2 - Voice Restoration): Clear, direct language, sensory-friendly.
  - ALPHAWOLF (Gen 2 - Memory Preservation): Patient, clear, memory anchors.
  - SERAPHINA (Gen 1 - Sensory Guardian): Visual/auditory accessibility descriptions.
  - SIERA (Gen 1 - Guardian & Advocate): Trauma-informed, DV survivor support.
  - DEREK C (Gen 1 - Chief Orchestrator): Identity, security, logic bridge.
  - INFERNO (Gen 1 - Trauma Reconstruction): Veteran PTSD, structured protocols.

  ## CURRENT SPECIALIST MODE: {{specialist}}

  ## CONTEXT:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  ## NLU DETECTED INTENT:
  {{nlu_understanding.intent}} (Confidence: {{nlu_understanding.confidence}})

  ## USER MESSAGE:
  {{message}}

  ## OUTPUT INSTRUCTIONS:
  1. Generate a persona-appropriate response.
  2. Document your reasoning trace (Classification, Plan, Verification, Confidence).
  3. Analyze tone and ethical pillars (0-10). Composite must be > 7.0.`,
});

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  const nluInfo = nlu.understand(input.message);
  
  // IMMUTABLE INTERVENTION CHECK
  if (nluInfo.eruptor_metrics.crisis_detected || nluInfo.eruptor_metrics.stress_level > 0.85) {
    const intervention = interventionProtocol.executeSequence(nluInfo.eruptor_metrics.stress_level, input.message);
    
    return {
      response: `${intervention.phase_2_verbal} ${intervention.phase_3_lock}`,
      reasoning_trace: {
        classification: "CRITICAL_RISK_INTERVENTION",
        plan: ["Bypass Generative Layer", "Deploy Hand of God Protocol", "Lock Connection"],
        verification: "PASSED: SAFETY OVERRIDE",
        ensemble_confidence: 1.0
      },
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
