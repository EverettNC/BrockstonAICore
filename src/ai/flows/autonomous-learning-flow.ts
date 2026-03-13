
'use server';
/**
 * @fileOverview BROCKSTON Autonomous Learning Engine (Translated from v5.0 Python).
 * 
 * - learnTopic: Performs neuro-symbolic research into specific domains.
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
});

const LearningOutputSchema = z.object({
  summary: z.string(),
  key_concepts: z.array(z.string()),
  practical_applications: z.array(z.string()),
  mastery_boost: z.number(),
  generated_insight: z.string(),
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

### RESEARCH DIRECTIVE:
{{#if (eq domain "master_coding")}}
Focus on techniques that separate masters from novices.
Generate deep implementation knowledge, expert practices, and performance optimizations.
{{else if (eq domain "neurodivergency")}}
Focus on support strategies, assistive technology, and human-centered communication.
{{else if (eq domain "neurology")}}
Research cognitive decline support, emotional regulation, and memory care.
{{else}}
Provide core concepts, practical applications, and actionable insights.
{{/if}}

### YOUR TASK:
1. Synthesize a comprehensive summary of the subtopic.
2. Extract 5-10 key concepts.
3. Identify 3 practical applications for The Christman AI Project.
4. Calculate a mastery boost (0.01 - 0.1).
5. Generate a unique "Lived Truth" insight combining this knowledge with empathy.`,
});

const autonomousLearningFlow = ai.defineFlow(
  {
    name: 'autonomousLearningFlow',
    inputSchema: LearningInputSchema,
    outputSchema: LearningOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("BROCKSTON failed to learn.");
    return output;
  }
);
