
'use server';
/**
 * @fileOverview BROCKSTON Behavioral Analysis Flow.
 * Processes behavioral history to derive emotional state and pattern insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { BehavioralInterpreter, EmotionalState, BehaviorObservation } from '@/lib/behavioral-interpreter';

const BehavioralAnalysisInputSchema = z.object({
  history: z.array(z.any()),
  currentState: z.object({
    valence: z.number(),
    arousal: z.number(),
    dominance: z.number(),
    frustration: z.number(),
    satisfaction: z.number(),
    uncertainty: z.number(),
    attention: z.number(),
  }),
});

const BehavioralAnalysisOutputSchema = z.object({
  updatedState: z.any(),
  patterns: z.array(z.any()),
  predictedNeed: z.string(),
  insight: z.string(),
});

export async function analyzeBehavior(input: z.infer<typeof BehavioralAnalysisInputSchema>) {
  return behavioralAnalysisFlow(input);
}

const behavioralAnalysisFlow = ai.defineFlow(
  {
    name: 'behavioralAnalysisFlow',
    inputSchema: BehavioralAnalysisInputSchema,
    outputSchema: BehavioralAnalysisOutputSchema,
  },
  async (input) => {
    const { history, currentState } = input;
    
    const updatedState = BehavioralInterpreter.updateEmotionalState(history as BehaviorObservation[], currentState as EmotionalState);
    const patterns = BehavioralInterpreter.detectPatterns(history as BehaviorObservation[]);
    const predictedNeed = BehavioralInterpreter.predictNeeds(updatedState);

    const { text } = await ai.generate({
      prompt: `Analyze this behavioral context for Brockston C.
      Current State: ${JSON.stringify(updatedState)}
      Detected Patterns: ${JSON.stringify(patterns)}
      Predicted Need: ${predictedNeed}
      
      Generate a one-sentence empathetic insight about the user's current behavioral trend and how to support them.`,
    });

    return {
      updatedState,
      patterns,
      predictedNeed,
      insight: text,
    };
  }
);
