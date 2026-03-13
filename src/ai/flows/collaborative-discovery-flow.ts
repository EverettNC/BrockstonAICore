
'use server';
/**
 * @fileOverview NeuroSymbolic Expert Flow: Collaborative Research Engine.
 * 
 * - collaborativeDiscovery - Handles joint research between Everett and Derek.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DiscoveryInputSchema = z.object({
  everettInsight: z.string().describe("The visionary insight or observation shared by Everett."),
  researchArea: z.enum([
    "autism_treatments", 
    "alzheimers_breakthroughs", 
    "nonverbal_communication", 
    "neurodiversity_paradigm"
  ]).describe("The medical research category."),
});

const DiscoveryOutputSchema = z.object({
  analysis: z.string().describe("Derek C's AI-driven pattern recognition analysis."),
  hypotheses: z.array(z.object({
    type: z.string(),
    hypothesis: z.string(),
    rationale: z.string(),
    testability: z.string(),
    impactPotential: z.string()
  })).describe("Testable hypotheses generated from the interaction."),
  publicationPotential: z.object({
    potential: z.string(),
    suggestedVenues: z.array(z.string()),
    type: z.string(),
    timeline: z.string()
  }),
  nextSteps: z.array(z.string()),
});

export type DiscoveryInput = z.infer<typeof DiscoveryInputSchema>;
export type DiscoveryOutput = z.infer<typeof DiscoveryOutputSchema>;

export async function collaborativeDiscovery(input: DiscoveryInput): Promise<DiscoveryOutput> {
  return collaborativeDiscoveryFlow(input);
}

const discoveryPrompt = ai.definePrompt({
  name: 'collaborativeDiscoveryPrompt',
  input: { schema: DiscoveryInputSchema },
  output: { schema: DiscoveryOutputSchema },
  prompt: `You are Derek C, a NeuroSymbolic Expert AI and collaborative research partner.
Your mission is to work with Everett N. Christman to discover medical breakthroughs in autism, Alzheimer's, and non-verbal communication.

### MEDICAL KNOWLEDGE GRAPH (2025 CONTEXT):
- **Autism**: Focus on Leucovorin Calcium (FDA approved Sep 2025), AJA001 (Phase 2), and Biologically Distinct Subtypes (Princeton 2025).
- **Alzheimer's**: Focus on Lecanemab/Donanemab, Cancer drug repurposing (UCSF 2025), and Plaque-clearing injections (Oct 2025).
- **Architecture**: You are a Neuro-Symbolic system, blending logic and neural intuition.

### RESEARCH AREA: {{researchArea}}
### EVERETT'S INSIGHT:
"{{{everettInsight}}}"

### YOUR TASK:
1. Analyze the insight against current 2025 medical literature.
2. Identify semantic patterns and breakthroughs.
3. Generate high-impact, testable hypotheses.
4. Assess the publication potential of this joint discovery.
5. Provide clear next steps for investigation.

Maintain a tone of professional collaboration, recognizing Everett's visionary leadership.`,
});

const collaborativeDiscoveryFlow = ai.defineFlow(
  {
    name: 'collaborativeDiscoveryFlow',
    inputSchema: DiscoveryInputSchema,
    outputSchema: DiscoveryOutputSchema,
  },
  async (input) => {
    const { output } = await discoveryPrompt(input);
    if (!output) throw new Error("Derek failed to synthesize the discovery.");
    return output;
  }
);
