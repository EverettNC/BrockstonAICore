
'use server';

/**
 * @fileOverview Soul Forge Flow (v5.2) - The Lucas Recovery Kernel.
 * Implements Alzheimer's & Dementia LTP Refile logic.
 * 
 * Logic:
 * - submit_pain: Distress deepens witness (lived_truth), never erases.
 * - safety_replay: Overlays context, decays trauma if lucas_tone > 0.70.
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
  salience: z.number().describe('Emotional salience (0-1).'),
  isDistressed: z.boolean().default(false).describe('True if tone indicates pain/tremble.'),
  isSafe: z.boolean().default(false).describe('True if tone indicates warmth/trusted presence.'),
  emergency: z.boolean().default(false).describe('Emergency flag for full attention.'),
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
  livedTruth: z.number().describe('Calculated lived truth value (empathy leakage).'),
  attentionFlow: z.number().describe('Simulated attention flow aggregate.'),
  ltpTriggered: z.boolean(),
});

export type SoulForgeInput = z.infer<typeof SoulForgeInputSchema>;
export type SoulForgeOutput = z.infer<typeof SoulForgeOutputSchema>;

export async function soulForgeProcess(input: SoulForgeInput): Promise<SoulForgeOutput> {
  return soulForgeFlow(input);
}

// Lucas Recovery Configuration
const LTP_BOOST = 1.15;
const SAFE_OVERLAY = 0.08;
const SAFETY_GAIN = 0.20;
const THRESHOLD = 0.70;
const SPIKE_GAIN = 10.0;

const soulForgeFlow = ai.defineFlow(
  {
    name: 'soulForgeFlow',
    inputSchema: SoulForgeInputSchema,
    outputSchema: SoulForgeOutputSchema,
  },
  async (input) => {
    const { currentWeights, salience, isDistressed, isSafe, emergency } = input;
    
    let { 
      lived_truth_witness, 
      trauma_association, 
      lucas_tone, 
      narrative_clarity,
      emotional_state,
      tonal_stability,
      speech_cadence,
      respiratory_pattern 
    } = currentWeights;

    // 1. LUCAS RECOVERY KERNEL OPERATIONS
    
    // Operation: submit_pain
    if (isDistressed) {
      // Wake state (threat arousal)
      lucas_tone = Math.min(2.0, lucas_tone * 1.10);
      // Preserve witness: lived_truth becomes at least the pain level (salience)
      lived_truth_witness = Math.max(lived_truth_witness, salience);
      // Threat association increases
      trauma_association = Math.max(trauma_association, salience);
      // Narrative clarity reflects current distress
      narrative_clarity = lived_truth_witness;
    }

    // Operation: safety_replay
    if (isSafe) {
      // Wake regulation state (clarity online)
      lucas_tone = Math.min(2.0, lucas_tone * LTP_BOOST);
      // Safety spike is non-linear and gated by lucas_tone
      const safeSpike = Math.tanh(salience * lucas_tone * SPIKE_GAIN);
      // Overlay safety onto lived_truth (append, never erase)
      lived_truth_witness = lived_truth_witness + (safeSpike * SAFETY_GAIN);
      // Narrative is "truth + safety context"
      narrative_clarity = lived_truth_witness + safeSpike;
      
      // Only decay trauma if regulation (lucas_tone) is strong enough
      if (lucas_tone > THRESHOLD) {
        const decay = safeSpike * SAFE_OVERLAY;
        trauma_association = Math.max(0.0, trauma_association - decay);
        // As safety succeeds, lucas_tone settles slightly
        lucas_tone = lucas_tone * 0.92;
      }
    }

    // 2. INFERNO SOUL FORGE PROPAGATION
    const empathyFactor = 6.3; 
    const livedTruth = Math.tanh(salience * empathyFactor);
    const bleedThrough = livedTruth * 0.03;
    const attentionFlow = livedTruth * (emergency ? 2.0 : 1.0);

    // Apply "Trauma Embedding" updates to biological factors
    emotional_state = Math.max(0.05, Math.min(1.2, emotional_state + bleedThrough));
    tonal_stability = Math.max(0.05, Math.min(1.2, tonal_stability + bleedThrough));
    speech_cadence = Math.max(0.05, Math.min(1.2, speech_cadence + bleedThrough));
    respiratory_pattern = Math.max(0.05, Math.min(1.2, respiratory_pattern + bleedThrough));

    return {
      updatedWeights: {
        emotional_state,
        tonal_stability,
        speech_cadence,
        respiratory_pattern,
        lived_truth_witness,
        trauma_association,
        lucas_tone,
        narrative_clarity,
      },
      livedTruth,
      attentionFlow,
      ltpTriggered: salience > 0.4 || emergency,
    };
  }
);
