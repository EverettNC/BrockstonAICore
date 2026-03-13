
'use server';
/**
 * @fileOverview AlphaVox Resonance Module - Joy Capture Flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MomentInputSchema = z.object({
  rawInput: z.string().describe("Raw human joy signal: e.g., 'cuckoo caca daddy smooch'"),
});

const MomentOutputSchema = z.object({
  translation: z.string(),
  resonance_score: z.number(),
  infrastructure_insight: z.string(),
  deployment_log: z.array(z.string()),
});

export async function captureMoment(input: z.infer<typeof MomentInputSchema>) {
  return momentCaptureFlow(input);
}

const momentCaptureFlow = ai.defineFlow(
  {
    name: 'momentCaptureFlow',
    inputSchema: MomentInputSchema,
    outputSchema: MomentOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are the AlphaVox Resonance Module for The Christman AI Project.
      Analyze this raw human joy signal: "${input.rawInput}"
      
      TRANSLATION GUIDELINES (Neurodiverse-Optimized):
      - "Cuckoo caca" = Pure, unfiltered joy.
      - "I call him daddy too" = Belonging, safety, love.
      - "Smooch" = Affection deployed.
      
      TASK:
      1. Provide a dignity-preserving translation.
      2. Calculate a resonance score (0-1).
      3. Explain how this is "Infrastructure for the Heart".
      4. Generate a deployment log (e.g., 'Stored in HIPAA vault', 'Warmed core +0.7').`,
      output: { schema: MomentOutputSchema }
    });

    return output!;
  }
);
