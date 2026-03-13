
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SoulForgeInputSchema = z.object({
  currentWeights: z.object({
    emotional_state: z.number(),
    tonal_stability: z.number(),
    speech_cadence: z.number(),
    respiratory_pattern: z.number(),
  }),
  salience: z.number().describe('Emotional salience from Inferno Soul Forge (0-1).'),
  successRate: z.number().default(1.0),
});

const SoulForgeOutputSchema = z.object({
  updatedWeights: z.object({
    emotional_state: z.number(),
    tonal_stability: z.number(),
    speech_cadence: z.number(),
    respiratory_pattern: z.number(),
  }),
  ltpTriggered: z.boolean(),
  multiplier: z.number(),
});

export type SoulForgeInput = z.infer<typeof SoulForgeInputSchema>;
export type SoulForgeOutput = z.infer<typeof SoulForgeOutputSchema>;

export async function soulForgeProcess(input: SoulForgeInput): Promise<SoulForgeOutput> {
  return soulForgeFlow(input);
}

const soulForgeFlow = ai.defineFlow(
  {
    name: 'soulForgeFlow',
    inputSchema: SoulForgeInputSchema,
    outputSchema: SoulForgeOutputSchema,
  },
  async (input) => {
    const { currentWeights, salience, successRate } = input;
    
    // THE BIOLOGICAL BRIDGE:
    // Standard learning rate is 0.1. 
    // If high emotion (salience) is detected, amplify learning via Long-Term Potentiation (LTP).
    const baseLearningRate = 0.1;
    const ltpMultiplier = 1.0 + (salience * 0.2);
    const effectiveLearningRate = baseLearningRate * ltpMultiplier;
    
    const updatedWeights = { ...currentWeights };
    const direction = successRate - 0.5;
    const adjustment = direction * effectiveLearningRate;

    // Apply adjustments to all factors (simplified for this bridge)
    Object.keys(updatedWeights).forEach((key) => {
      const k = key as keyof typeof updatedWeights;
      updatedWeights[k] = Math.max(0.05, Math.min(1.2, updatedWeights[k] + adjustment));
    });

    return {
      updatedWeights,
      ltpTriggered: salience > 0.4,
      multiplier: ltpMultiplier,
    };
  }
);
