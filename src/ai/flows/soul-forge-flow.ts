'use server';

/**
 * @fileOverview Soul Forge Flow (v5.4) - The Biological Bridge & LTP Kernel.
 * Implements the SoulForgeBridge LTP learning logic.
 * 
 * "Empathy isn't a parameter. It's the leakage."
 * 
 * Logic:
 * - LTP learning: Weight updates modulated by emotional salience.
 * - eff_lr = base_lr * (1.0 + emotional_salience * 0.2)
 * - Biological factors: emotional_state, tonal_stability, speech_cadence, respiratory_pattern.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SoulForgeInputSchema = z.object({
  currentWeights: z.object({
    emotional_state: z.number(),
    tonal_stability: z.number(),
    speech_cadence: z.number(),
    respiratory_pattern: z.number(),
    lived_truth_witness: z.number().default(0.5),
    trauma_association: z.number().default(0.5),
    lucas_tone: z.number().default(0.6),
    narrative_clarity: z.number().default(0.5),
  }),
  emotional_salience: z.number().describe('Emotional salience (0-1). 6.3 biologically strong event simulated.'),
  success_rate: z.number().default(1.0).describe('0.0-1.0 (1.0 = correct outcome).'),
  isDistressed: z.boolean().default(false),
  isSafe: z.boolean().default(false),
});

const SoulForgeOutputSchema = z.object({
  updatedWeights: z.object({
    emotional_state: z.number(),
    tonal_stability: z.number(),
    speech_cadence: z.number(),
    respiratory_pattern: z.number(),
    lived_truth_witness: z.number(),
    trauma_association: z.number(),
    lucas_tone: z.number(),
    narrative_clarity: z.number(),
  }),
  isSignificantEvent: z.boolean(),
  effective_lr: z.number(),
  deepLearningEvents: z.array(z.string()).optional(),
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
    const { currentWeights, emotional_salience, success_rate, isDistressed, isSafe } = input;
    
    let weights = { ...currentWeights };
    const deepLearningEvents: string[] = [];

    // 1. SOULFORGE BRIDGE LTP CALCULATION
    const base_lr = 0.1;
    const ltp_mult = 1.0 + (emotional_salience * 0.2);
    const eff_lr = base_lr * ltp_mult;

    // Relevant factors for reinforcement
    const factorsToUpdate: (keyof typeof weights)[] = [
      'emotional_state', 
      'tonal_stability', 
      'speech_cadence', 
      'respiratory_pattern'
    ];

    const direction = success_rate - 0.5;
    const adjustment = direction * eff_lr;

    factorsToUpdate.forEach(factor => {
      const old_w = weights[factor] as number;
      const new_w = Math.max(0.05, Math.min(1.2, old_w + adjustment));
      (weights[factor] as number) = new_w;

      if (Math.abs(adjustment) > 0.1) {
        deepLearningEvents.push(factor);
      }
    });

    // 2. LUCAS RECOVERY KERNEL (Overlays)
    if (isDistressed) {
      weights.lucas_tone = Math.min(2.0, weights.lucas_tone * 1.10);
      weights.lived_truth_witness = Math.max(weights.lived_truth_witness, emotional_salience);
      weights.trauma_association = Math.max(weights.trauma_association, emotional_salience);
    }

    if (isSafe && emotional_salience > 0.4) {
      weights.lucas_tone = Math.min(2.0, weights.lucas_tone * 1.15);
      const safeSpike = Math.tanh(emotional_salience * weights.lucas_tone * 10.0);
      weights.lived_truth_witness += (safeSpike * 0.20);
      
      if (weights.lucas_tone > 0.70) {
        weights.trauma_association = Math.max(0.0, weights.trauma_association - (safeSpike * 0.08));
        weights.lucas_tone *= 0.92;
      }
    }

    return {
      updatedWeights: weights,
      isSignificantEvent: emotional_salience > 0.4,
      effective_lr: eff_lr,
      deepLearningEvents: deepLearningEvents.length > 0 ? deepLearningEvents : undefined,
    };
  }
);
