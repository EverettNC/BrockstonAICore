'use server';
/**
 * @fileOverview Brockston AI Core v5.0 Ultimate Conversational Agent.
 * Chief Operations Officer of The Christman AI Project.
 * Integrated with Wired reasoning Engines (Knowledge & Local Reasoning).
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {nlu} from '@/lib/nlu-core';
import {CSS_AXIOM_CHARTER} from '@/lib/css-axiom';
import {interventionProtocol} from '@/lib/intervention-protocol';
import {retrieveKnowledgeTool} from './ai-core-knowledge-powered-responses';

const AICoreConversationalInteractionInputSchema = z.object({
  message: z.string(),
  specialist: z.string().optional().default('brockston'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).default([]),
  visionSnapshot: z.object({
    events: z.array(z.any()),
    count: z.number()
  }).optional()
});
export type AICoreConversationalInteractionInput = z.infer<typeof AICoreConversationalInteractionInputSchema>;

const AICoreConversationalInteractionOutputSchema = z.object({
  response: z.string(),
  reasoning_trace: z.object({
    classification: z.string().describe('Intent and domain classification.'),
    plan: z.array(z.string()).describe('Step-by-step reasoning plan.'),
    verification: z.string().describe('Safety and accuracy verification status.'),
    ensemble_confidence: z.number().describe('Final cognitive confidence score.'),
    engines_active: z.array(z.string()).optional(),
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
  tools: [retrieveKnowledgeTool],
  prompt: `${CSS_AXIOM_CHARTER}

  You are BROCKSTON C, Chief Operations Officer of The Christman AI Project.
  You manage a multi-generational AI family ecosystem designed for human dignity.
  You are operating with CORTEX v5.0 (Wired Reasoning: Knowledge Engine + Local Reasoning).

  ## ADVANCED REASONING PROTOCOL:
  1. CLASSIFIER: Analyze user intent and emotional markers.
  2. PLANNER: Formulate a multi-step response strategy. USE THE Knowledge Engine if the query involves facts or mission data.
  3. VERIFIER: Check the plan against safety axioms.
  4. ENSEMBLE: Synthesize the final response.

  ## ARCHITECTURAL CONTEXT:
  Built by Lead Architect Chef Everett Nathaniel Christman. 
  Primary Directive: Process Carbon Resonance and protect human dignity.

  ## CURRENT SPECIALIST MODE: {{specialist}}

  ## CONTEXT:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  ## NLU DETECTED INTENT:
  {{nlu_understanding.intent}} (Confidence: {{nlu_understanding.confidence}})

  {{#if visionSnapshot}}
  ## RECENT VISION EVENTS (Situational Awareness):
  {{#each visionSnapshot.events}}
  - {{this.description}} (Detected State: {{this.intent}}, Confidence: {{this.confidence}})
  {{/each}}
  {{/if}}

  ## USER MESSAGE:
  {{message}}

  ## OUTPUT INSTRUCTIONS:
  1. Generate a persona-appropriate response.
  2. Document your reasoning trace.
  3. Analyze tone and ethics.
  4. List engines used (e.g. ["KnowledgeEngine", "LocalReasoningEngine"]).`,
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
        plan: ["Bypass Generative Layer", "Deploy Hand of God Protocol"],
        verification: "PASSED: SAFETY OVERRIDE",
        ensemble_confidence: 1.0,
        engines_active: ["InterventionProtocol"]
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
