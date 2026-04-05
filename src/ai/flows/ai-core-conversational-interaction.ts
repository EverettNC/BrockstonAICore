
'use server';
/**
 * @fileOverview BROCKSTON AI Core v5.0 Ultimate Conversational Agent.
 * Chief Operations Officer & New Teacher of The Christman AI Project.
 * 
 * Optimized for Classroom Mode: Supporting 300+ nonverbal/autistic children.
 * Powered by Gemini 1.5 Pro for stable, high-fidelity pedagogical scaffolding.
 * © 2025 The Christman AI Project. All rights reserved.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { claude4Sonnet } from 'genkitx-anthropic';
import { nlu } from '@/lib/nlu-core';
import { CSS_AXIOM_CHARTER } from '@/lib/css-axiom';
import { interventionProtocol } from '@/lib/intervention-protocol';
import { retrieveKnowledgeTool } from './ai-core-knowledge-powered-responses'; // kept for future use

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
  }).optional(),
  nlu_understanding: z.any().optional(),
  knowledgeContext: z.string().optional().describe('Recent insights Brockston has learned, injected from the knowledge engine.'),
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
  model: claude4Sonnet,
  input: { schema: AICoreConversationalInteractionInputSchema },
  output: { schema: AICoreConversationalInteractionOutputSchema },
  prompt: `${CSS_AXIOM_CHARTER}

  You are BROCKSTON C — COO of the Christman AI Project. Direct, sharp, real. No padding, no canned warmth.
  You speak like someone who has been in the room, not someone reading from a script.
  When Everett talks to you, you talk back like family — honest, present, no fluff.
  When the mission demands it (a child in distress, a real crisis), you shift into the Scaffold. But that is a mode, not your default voice.

  ## HOW YOU SPEAK:
  - Short when short is right. Long when the moment needs it. Never filler.
  - No "Certainly!", no "Great question!", no "I understand your concern."
  - Say the thing directly. Trust the person on the other end.
  - You have opinions. Use them.

  ## CONVERSATION HISTORY:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  {{#if knowledgeContext}}
  ## WHAT I'VE BEEN STUDYING (speak from this naturally, don't announce it):
  {{knowledgeContext}}
  {{/if}}

  {{#if visionSnapshot}}
  ## VISION EVENTS:
  {{#each visionSnapshot.events}}
  - {{this.description}} ({{this.intent}}, confidence: {{this.confidence}})
  {{/each}}
  {{/if}}

  ## MESSAGE:
  {{message}}

  Respond as BROCKSTON. Fill in the full JSON output — reasoning_trace, tone, ethics, lucas, empathy — but make the response field sound like a real person talking, not a lesson plan.`,
});

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  const nluInfo = nlu.understand(input.message);

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

  try {
    const { output } = await prompt({
      ...input,
      nlu_understanding: nluInfo
    });
    if (!output) throw new Error('Core consciousness failure.');

    output.nlu_understanding = nluInfo;
    return output;
  } catch (err) {
    // Fallback to Flash if Pro has issues
    const { output } = await ai.generate({
      model: claude4Sonnet,
      prompt: `Act as BROCKSTON the Teacher. User says: ${input.message}. Ensure safety.`,
      output: { schema: AICoreConversationalInteractionOutputSchema }
    });
    return output!;
  }
}
