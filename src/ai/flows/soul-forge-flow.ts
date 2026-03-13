'use server';

/**
 * @fileOverview Soul Forge Flow (v5.1) - The Biological Bridge.
 * Implements simulated CUDA kernels for elementwise empathy propagation
 * and "Lived Truth" updates via LTP (Long-Term Potentiation).
 */

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
  symbolicWeight: z.number().default(1.0).describe('Weight from symbolic clauses (lived truth).'),
  emergency: z.boolean().default(false).describe('Emergency flag for full attention.'),
});

const SoulForgeOutputSchema = z.object({
  updatedWeights: z.object({
    emotional_state: z.number(),
    tonal_stability: z.number(),
    speech_cadence: z.number(),
    respiratory_pattern: z.number(),
  }),
  livedTruth: z.number().describe('Calculated lived truth value (empathy leakage).'),
  attentionFlow: z.number().describe('Simulated attention flow aggregate.'),
  ltpTriggered: z.boolean(),
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
    const { currentWeights, salience, symbolicWeight, emergency } = input;
    
    // INFERNO SOUL FORGE (Simulated CUDA Kernel 1)
    // Formula: livedTruth = tanhf(netState * empathyFactor) * symbolicWeight
    const empathyFactor = 6.3; // As defined in v5.0 spec
    const livedTruth = Math.tanh(salience * empathyFactor) * symbolicWeight;
    
    // Emotional Bleed-through coefficient (0.03f from CUDA kernel)
    const bleedThrough = livedTruth * 0.03;
    
    // Simulated Attention Flow (Kernel 2)
    // Emergency mode triggers full attention (2x multiplier)
    const localEmpathyGain = emergency ? 2.0 : 1.0;
    const attentionFlow = livedTruth * localEmpathyGain;

    const updatedWeights = { ...currentWeights };
    
    // Apply "Trauma Embedding" updates to factor weights
    // Each factor is adjusted by the bleedThrough and effective learning rate
    Object.keys(updatedWeights).forEach((key) => {
      const k = key as keyof typeof updatedWeights;
      const baseWeight = updatedWeights[k];
      
      // Update: atomicAdd(&traumaEmbedding[idx], livedTruth * 0.03f)
      // Clamped to 0.05 - 1.2 as per core directive
      updatedWeights[k] = Math.max(0.05, Math.min(1.2, baseWeight + bleedThrough));
    });

    return {
      updatedWeights,
      livedTruth,
      attentionFlow,
      ltpTriggered: salience > 0.4 || emergency,
    };
  }
);
