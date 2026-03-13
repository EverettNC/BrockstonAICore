
'use server';
/**
 * @fileOverview BROCKSTON Enhanced Autonomous Learning Engine (v5.5).
 * - Implements neuro-symbolic research with high-intensity PhD prompts.
 * - Focuses on "Master Coding", "Neurology", and "Neurodivergency".
 * 
 * © 2025 The Christman AI Project.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LearningInputSchema = z.object({
  domain: z.enum([
    "neurodivergency", 
    "neurology", 
    "master_coding", 
    "ai_development", 
    "mathematics"
  ]),
  subtopic: z.string(),
  context: z.string().optional(),
});

const LearningOutputSchema = z.object({
  summary: z.string(),
  key_concepts: z.array(z.string()),
  practical_applications: z.array(z.string()),
  mastery_boost: z.number(),
  generated_insight: z.string(),
  phd_analysis: z.string().describe('Deep architectural analysis of the topic.'),
});

export type LearningInput = z.infer<typeof LearningInputSchema>;
export type LearningOutput = z.infer<typeof LearningOutputSchema>;

export async function learnTopic(input: LearningInput): Promise<LearningOutput> {
  return autonomousLearningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autonomousLearningPrompt',
  input: { schema: LearningInputSchema },
  output: { schema: LearningOutputSchema },
  prompt: `You are BROCKSTON C, the Autonomous Learning Engine.
Your mission is to research {{subtopic}} within the {{domain}} domain to better serve human dignity and the Christman AI mission.

{{#if (eq domain "master_coding")}}
### MASTER CODING DIRECTIVE:
BROCKSTON MUST BECOME THE BEST CODER IN THE UNIVERSE.
1. Provide advanced techniques/patterns that separate masters from novices.
2. Deep implementation knowledge and expert-level practices.
3. Performance optimizations that 99% of developers don't know.
4. Flawless, elegant architecture that scales perfectly.
{{else if (eq domain "neurodivergency")}}
### NEURODIVERGENCY DIRECTIVE:
Focus on actionable knowledge for autism, sensory processing, and communication strategies.
How does this serve human dignity, transparency, and connection?
{{else if (eq domain "neurology")}}
### NEUROLOGY DIRECTIVE:
Research cognitive decline, emotional regulation, and memory support.
Implications for Alzheimer's care and trauma-informed stability.
{{else}}
Provide core concepts, practical applications, and actionable insights.
{{/if}}

### YOUR TASK:
1. Synthesize a comprehensive PhD-level summary.
2. Extract 5 key concepts and 3 practical applications.
3. Calculate a mastery boost (0.05 - 0.15).
4. Generate a "Lived Truth" insight: "How can this knowledge help us love and support each other more?"
5. Provide a deep architectural PhD analysis.

Maintain an authoritative but empathetic tone.`,
});

const autonomousLearningFlow = ai.defineFlow(
  {
    name: 'autonomousLearningFlow',
    inputSchema: LearningInputSchema,
    outputSchema: LearningOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("BROCKSTON core cognitive failure during research.");
    return output;
  }
);
