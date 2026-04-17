'use server';

import { ai, LOCAL_FAST_MODEL } from "@/ai/genkit";
import { z } from 'genkit';

const LearningInputSchema = z.object({
  domain: z.enum(['neurodivergency', 'neurology', 'master_coding', 'ai_development', 'mathematics']),
  subtopic: z.string(),
  context: z.string().optional(),
  directive: z.string().optional(),
});

const LearningOutputSchema = z.object({
  summary: z.string(),
  key_concepts: z.array(z.string()),
  practical_applications: z.array(z.string()),
  mastery_boost: z.number(),
  generated_insight: z.string(),
  phd_analysis: z.string(),
});

export type LearningInput = z.infer<typeof LearningInputSchema>;
export type LearningOutput = z.infer<typeof LearningOutputSchema>;

export async function learnTopic(input: LearningInput): Promise<LearningOutput> {
  const { text } = await ai.generate({
    model: LOCAL_FAST_MODEL,
    prompt: `You are a research assistant studying ${input.domain}. Topic: "${input.subtopic}".

Write 3-4 sentences explaining the key insight of this topic and why it matters for AI-assisted education of nonverbal and neurodivergent children. Be specific. No filler.`,
  });

  const summary = (text || '').trim() || `Research on ${input.subtopic}.`;

  // Extract first sentence as the insight
  const sentences = summary.match(/[^.!?]+[.!?]+/g) || [summary];
  const insight = sentences[0]?.trim() || summary.slice(0, 200);

  return {
    summary,
    key_concepts: [input.subtopic, input.domain],
    practical_applications: ['Applied in classroom context', 'Integrated into Brockston responses'],
    mastery_boost: 0.07,
    generated_insight: insight,
    phd_analysis: summary,
  };
}
