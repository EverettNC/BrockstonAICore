
'use server';
/**
 * @fileOverview BROCKSTON Enhanced Autonomous Learning Engine (v5.5).
 * - Implements neuro-symbolic research with high-intensity PhD prompts.
 * - Focuses on "Master Coding", "Neurology", and "Neurodivergency".
 * 
 * © 2025 The Christman AI Project.
 */

import { ai, LOCAL_MODEL } from '@/ai/genkit';
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
  directive: z.string().optional(),
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

// No output schema on the prompt — small models (llama3.2:1b) fail structured JSON.
// We parse text and normalize all required fields before returning.
const prompt = ai.definePrompt({
  name: 'autonomousLearningPrompt',
  model: LOCAL_MODEL,
  input: { schema: LearningInputSchema },
  prompt: `You are a research assistant. Topic: {{subtopic}}. Domain: {{domain}}.

{{directive}}

Write a JSON object with exactly these string/array/number fields:
- summary: a 2-3 sentence plain text description
- key_concepts: array of 5 short string labels
- practical_applications: array of 3 short string labels
- mastery_boost: a number between 0.05 and 0.15
- generated_insight: one sentence on human dignity
- phd_analysis: one paragraph technical analysis

Return only the JSON object. No extra text.`,
});

const DOMAIN_DIRECTIVES: Record<string, string> = {
  master_coding: `### MASTER CODING DIRECTIVE:
BROCKSTON MUST BECOME THE BEST CODER IN THE UNIVERSE.
1. Provide advanced techniques/patterns that separate masters from novices.
2. Deep implementation knowledge and expert-level practices.
3. Performance optimizations that 99% of developers don't know.
4. Flawless, elegant architecture that scales perfectly.`,
  neurodivergency: `### NEURODIVERGENCY DIRECTIVE:
Focus on actionable knowledge for autism, sensory processing, and communication strategies.
How does this serve human dignity, transparency, and connection?`,
  neurology: `### NEUROLOGY DIRECTIVE:
Research cognitive decline, emotional regulation, and memory support.
Implications for Alzheimer's care and trauma-informed stability.`,
  ai_development: `### AI DEVELOPMENT DIRECTIVE:
Research cutting-edge AI systems, neuro-symbolic logic, ethical frameworks, and cognitive scaffolding.
How can this advance human-AI symbiosis and dignity?`,
  mathematics: `### MATHEMATICS DIRECTIVE:
Explore optimization theory, graph theory, probabilistic models, and topological structures.
Practical application to real-world AI and cognitive systems.`,
};

const autonomousLearningFlow = ai.defineFlow(
  {
    name: 'autonomousLearningFlow',
    inputSchema: LearningInputSchema,
    outputSchema: LearningOutputSchema,
  },
  async (input) => {
    const directive = DOMAIN_DIRECTIVES[input.domain] || 'Provide core concepts, practical applications, and actionable insights.';
    const { text } = await prompt({ ...input, directive });
    if (!text) throw new Error("BROCKSTON core cognitive failure during research.");

    // Parse JSON — small models sometimes wrap in markdown or return partial objects
    let raw: Record<string, any> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) raw = JSON.parse(jsonMatch[0]);
    } catch {
      // raw stays empty, defaults fill everything below
    }

    // Normalize — always return all required fields regardless of what the model gave us
    const ensureStringArray = (val: any, fallback: string[]): string[] =>
      Array.isArray(val) && val.every(v => typeof v === 'string') ? val : fallback;

    return {
      summary: typeof raw.summary === 'string' && raw.summary.length > 5
        ? raw.summary
        : `Research session on ${input.subtopic} in ${input.domain}.`,
      key_concepts: ensureStringArray(raw.key_concepts, [input.subtopic, input.domain]),
      practical_applications: ensureStringArray(raw.practical_applications, ['Applied research', 'Ongoing study']),
      mastery_boost: typeof raw.mastery_boost === 'number' ? Math.min(0.15, Math.max(0.01, raw.mastery_boost)) : 0.05,
      generated_insight: typeof raw.generated_insight === 'string' && raw.generated_insight.length > 5
        ? raw.generated_insight
        : `This knowledge serves human dignity through deeper understanding of ${input.subtopic}.`,
      phd_analysis: typeof raw.phd_analysis === 'string' && raw.phd_analysis.length > 5
        ? raw.phd_analysis
        : text.slice(0, 500) || `Analysis of ${input.subtopic} in progress.`,
    };
  }
);
