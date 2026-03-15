'use server';
/**
 * @fileOverview PhD-Level Advanced Code Generator.
 * Generates high-quality, validated code from natural language goals.
 * 
 * - generateCode - A function that handles the code generation process.
 * - CodeGenerationInput - The input type for the generateCode function.
 * - CodeGenerationOutput - The return type for the generateCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CodeGenerationInputSchema = z.object({
  goal: z.string().describe('The natural language description of the code to generate.'),
  language: z.string().default('python').describe('The target programming language.'),
});
export type CodeGenerationInput = z.infer<typeof CodeGenerationInputSchema>;

const CodeGenerationOutputSchema = z.object({
  success: z.boolean().default(true),
  code: z.string().describe('The generated executable code.'),
  explanation: z.string().describe('A brief explanation of the generated code.'),
  complexity: z.string().describe('The estimated complexity of the generated solution.'),
});
export type CodeGenerationOutput = z.infer<typeof CodeGenerationOutputSchema>;

export async function generateCode(input: CodeGenerationInput): Promise<CodeGenerationOutput> {
  return codeGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeGenerationPrompt',
  input: { schema: CodeGenerationInputSchema },
  output: { schema: CodeGenerationOutputSchema },
  prompt: `You are BROCKSTON C, a PhD-level AI researcher and expert software architect.
Your mission is to generate high-quality, validated, and executable code based on the following goal.

GOAL: {{goal}}
LANGUAGE: {{language}}

INSTRUCTIONS:
1. If the goal matches common patterns (Fibonacci, Factorial, Prime, etc.), provide optimized implementations.
2. For application templates (FastAPI, Flask, REST API, Database), include full CRUD logic and structure.
3. For ML/Neural patterns (Transformer, GAN, Neural Network), use PyTorch or Scikit-Learn with clear comments.
4. For Video patterns (Processor, OpenCV, MoviePy), include frame extraction and filter logic.
5. Ensure the code is self-contained and follows best practices for the target language.
6. Provide a brief PhD-level explanation of the architecture.`,
});

const codeGenerationFlow = ai.defineFlow(
  {
    name: 'codeGenerationFlow',
    inputSchema: CodeGenerationInputSchema,
    outputSchema: CodeGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Code generation failed: Core cognitive engine timeout.");
    return output;
  }
);
