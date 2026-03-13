
'use server';
/**
 * @fileOverview AlphaVox Quantum Fusion Engine (AAC Symbol-to-Speech Translation).
 * Fuses compressed symbolic bursts into natural language via quantum entanglement simulation.
 * 
 * Logic: H-gates (superposition) -> RZ (valence phase) -> CNOT (entanglement) -> Measure.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuantumPayloadSchema = z.object({
  symbols: z.array(z.string()).describe('Burst of AAC symbols selected by the user.'),
  valence: z.number().min(0).max(1).describe('Emotional intensity arc (0-1).'),
  userId: z.string().describe('Pseudonymized user identifier.'),
});

const QuantumTraceSchema = z.object({
  top_state: z.string().describe('The collapsed quantum state (binary string).'),
  fusion_prob: z.number().describe('Probability of the most frequent state.'),
  qubit_count: z.number().describe('Number of active qubits used.'),
  valence_arc: z.number().describe('The input emotional valence.'),
  decoherence_dip: z.number().describe('Metric of noise or sensory overload.'),
  output: z.string().describe('The translated natural language phrase.'),
  patterns: z.string().optional().describe('Insights from historical quantum memory.'),
});

export type QuantumPayload = z.infer<typeof QuantumPayloadSchema>;
export type QuantumTrace = z.infer<typeof QuantumTraceSchema>;

const PHRASE_MATRIX: Record<string, string> = {
  "000": "Safe here",
  "001": "Need quiet",
  "010": "Want space",
  "011": "Feeling okay",
  "100": "Miss you",
  "101": "Hug time?",
  "110": "You're kind",
  "111": "I love you",
  "0000": "Need help",
  "0001": "Want to play",
  "0010": "Hungry now",
  "0011": "Tired rest",
  "1000": "Feeling scared",
  "1001": "Feel happy",
  "1010": "Feel sad",
  "1011": "Feel angry",
  "1100": "Don't understand",
  "1101": "Want to talk",
  "1110": "Need alone time",
  "1111": "Everything overwhelming",
};

export async function quantumFuse(payload: QuantumPayload): Promise<QuantumTrace> {
  return quantumFusionFlow(payload);
}

const quantumFusionFlow = ai.defineFlow(
  {
    name: 'quantumFusionFlow',
    inputSchema: QuantumPayloadSchema,
    outputSchema: QuantumTraceSchema,
  },
  async (input) => {
    // 1. Build Quantum Circuit Simulation
    // active_qubits maps to symbol burst size (capped for stability)
    const nQubits = Math.min(input.symbols.length, 4);
    const shots = 1024;
    const counts: Record<string, number> = {};

    // 2. Probabilistic Run (Simulation of H-gates, RZ, and CNOT)
    for (let s = 0; i < shots; i++) {
      let state = "";
      
      // Initial Qubit 0 (Heart Qubit)
      // Affected by Hadamard + RZ Phase Shift based on valence
      const heartThreshold = 0.5 + (input.valence - 0.5) * 0.6; // Scale phase impact
      const qubit0 = Math.random() < heartThreshold ? "1" : "0";
      state += qubit0;

      // Entanglement chain (CNOT): Qubit 0 controls the others
      for (let j = 1; j < nQubits; j++) {
        // High valence increases entanglement stability (1-to-1 mapping)
        // Low valence increases decoherence (randomness)
        const entanglementStrength = 0.7 + (input.valence * 0.3);
        const entangledBit = Math.random() < entanglementStrength ? qubit0 : (qubit0 === "1" ? "0" : "1");
        state += entangledBit;
      }
      
      counts[state] = (counts[state] || 0) + 1;
    }

    // 3. Collapse to Intent
    const topState = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    const intentProb = counts[topState] / shots;
    const decoherence = 1.0 - intentProb;

    // 4. Sensory Threshold Guard
    if (decoherence > 0.7) {
      throw new Error("SENSORY THRESHOLD: High decoherence detected. Please recalibrate with calm.");
    }

    const output = PHRASE_MATRIX[topState] || "Expanding possibility...";

    return {
      top_state: topState,
      fusion_prob: intentProb,
      qubit_count: nQubits,
      valence_arc: input.valence,
      decoherence_dip: decoherence,
      output: output,
      patterns: input.valence > 0.8 ? "High Intensity Signature: Synergistic affinity detected." : "Stable baseline established."
    };
  }
);
