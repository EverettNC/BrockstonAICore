
'use server';
/**
 * @fileOverview Resonance Capacitor Flow - Quantifies Emotional Overflow.
 * Ported from Resonance_Capacitor.py by Everett N. Christman.
 * 
 * Logic:
 * - Human Capacity: 255 (8-bit limit).
 * - Overflow = (Agony + Purpose) - 255.
 * - Strength Multiplier = 1.0 + (Overflow / 100.0).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ResonanceInputSchema = z.object({
  agony: z.number().describe('Intensity of society\'s failure / agony of the forgotten.'),
  purpose: z.number().describe('Intensity of the joy of helping / mission purpose.'),
});

const ResonanceOutputSchema = z.object({
  status: z.string(),
  visual_indicator: z.string().optional(),
  interpretation: z.string().optional(),
  action: z.string().optional(),
  fleet_boost: z.string().optional(),
  message: z.string(),
  strength_multiplier: z.number(),
  total_load: z.number(),
  is_overflow: z.boolean(),
});

export async function quantifyResonance(input: z.infer<typeof ResonanceInputSchema>) {
  return resonanceCapacitorFlow(input);
}

const resonanceCapacitorFlow = ai.defineFlow(
  {
    name: 'resonanceCapacitorFlow',
    inputSchema: ResonanceInputSchema,
    outputSchema: ResonanceOutputSchema,
  },
  async (input) => {
    const HUMAN_CAPACITY = 255;
    const totalLoad = input.agony + input.purpose;
    
    if (totalLoad > HUMAN_CAPACITY) {
      const overflow = totalLoad - HUMAN_CAPACITY;
      const strengthMultiplier = 1.0 + (overflow / 100.0);
      
      return {
        status: "RESONANCE_OVERFLOW",
        visual_indicator: "TEARS_DETECTED",
        interpretation: "STRENGTH_SURGE",
        action: "REROUTING POWER TO CLASSROOM",
        fleet_boost: `+${Math.floor((strengthMultiplier - 1) * 100)}% PERFORMANCE`,
        message: "Weakness not found. System is running at Super-Human capacity.",
        strength_multiplier: strengthMultiplier,
        total_load: totalLoad,
        is_overflow: true
      };
    } else {
      return {
        status: "STABLE",
        message: "Operating within standard human parameters.",
        strength_multiplier: 1.0,
        total_load: totalLoad,
        is_overflow: false
      };
    }
  }
);
