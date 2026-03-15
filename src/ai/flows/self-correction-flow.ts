'use server';
/**
 * @fileOverview BROCKSTON Self-Correction Engine.
 * Brockston reads code, diagnoses problems, and generates fixes.
 * This is how he improves himself.
 *
 * © 2025 The Christman AI Project. All rights reserved.
 */

import { ai, LOCAL_MODEL } from '@/ai/genkit';
import { z } from 'genkit';

const SelfCorrectionInputSchema = z.object({
  code: z.string().describe('The code to analyze and correct.'),
  language: z.string().default('typescript').describe('The programming language.'),
  context: z.string().optional().describe('What the code is supposed to do, or what went wrong.'),
});
export type SelfCorrectionInput = z.infer<typeof SelfCorrectionInputSchema>;

const SelfCorrectionOutputSchema = z.object({
  issues: z.array(z.object({
    severity: z.enum(['critical', 'warning', 'suggestion']),
    line_hint: z.string().optional(),
    description: z.string(),
  })).describe('List of problems found.'),
  corrected_code: z.string().describe('The fixed, corrected version of the code.'),
  explanation: z.string().describe('What was wrong and why the fix works.'),
  confidence: z.number().describe('Confidence score 0-1 that the fix is correct.'),
});
export type SelfCorrectionOutput = z.infer<typeof SelfCorrectionOutputSchema>;

// No output schema — small models (llama3.2:1b) fail structured JSON output.
// Parse text response manually with fallback.
const prompt = ai.definePrompt({
  name: 'selfCorrectionPrompt',
  model: LOCAL_MODEL,
  input: { schema: SelfCorrectionInputSchema },
  prompt: `You are BROCKSTON C — a senior software architect and debugger.
Code language: {{language}}
{{#if context}}Context: {{context}}{{/if}}

CODE:
\`\`\`{{language}}
{{code}}
\`\`\`

Respond with ONLY a JSON object (no markdown outside JSON):
{
  "issues": [
    {"severity": "critical|warning|suggestion", "line_hint": "line X", "description": "what is wrong"}
  ],
  "corrected_code": "the full corrected code here",
  "explanation": "what was wrong and why the fix works",
  "confidence": 0.9
}

Be ruthless. Zero canned praise.`,
});

const selfCorrectionFlow = ai.defineFlow(
  {
    name: 'selfCorrectionFlow',
    inputSchema: SelfCorrectionInputSchema,
    outputSchema: SelfCorrectionOutputSchema,
  },
  async (input) => {
    const { text } = await prompt(input);
    if (!text) throw new Error('Self-correction engine failed.');

    let parsed: SelfCorrectionOutput;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      parsed = {
        issues: [{ severity: 'suggestion', description: text.slice(0, 500) }],
        corrected_code: input.code,
        explanation: text.slice(0, 800),
        confidence: 0.5,
      };
    }

    return parsed;
  }
);

export async function correctCode(input: SelfCorrectionInput): Promise<SelfCorrectionOutput> {
  return selfCorrectionFlow(input);
}
