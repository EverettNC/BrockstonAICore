'use server';
/**
 * @fileOverview This file implements a Genkit flow that leverages an extensive knowledge base
 * and recalls past interactions to provide accurate, detailed, and context-aware answers.
 *
 * - aiCoreKnowledgePoweredResponses - A function that handles generating a knowledge-powered response.
 * - AiCoreKnowledgePoweredResponsesInput - The input type for the aiCoreKnowledgePoweredResponses function.
 * - AiCoreKnowledgePoweredResponsesOutput - The return type for the aiCoreKnowledgePoweredResponses function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiCoreKnowledgePoweredResponsesInputSchema = z.object({
  query: z.string().describe('The user\'s question or query.'),
  chatHistory: z.array(z.string()).optional().describe('A history of past chat interactions for context.'),
});
export type AiCoreKnowledgePoweredResponsesInput = z.infer<typeof AiCoreKnowledgePoweredResponsesInputSchema>;

const AiCoreKnowledgePoweredResponsesOutputSchema = z.object({
  response: z.string().describe('The detailed and context-aware answer from the AI.'),
});
export type AiCoreKnowledgePoweredResponsesOutput = z.infer<typeof AiCoreKnowledgePoweredResponsesOutputSchema>;

/**
 * Simulates retrieving relevant information from the Brockston AI Core's extensive knowledge base.
 * In a real application, this would interact with a RAG system or database.
 */
const retrieveKnowledge = ai.defineTool(
  {
    name: 'retrieveKnowledge',
    description: 'Retrieves relevant information from the Brockston AI Core\'s extensive knowledge base to answer specific queries or provide contextual details.',
    inputSchema: z.object({
      query: z.string().describe('The query or topic for which to retrieve knowledge.'),
    }),
    outputSchema: z.string().describe('The retrieved factual information or context.'),
  },
  async (input) => {
    // This is a placeholder implementation. In a real application,
    // this would call a RAG service, database, or other knowledge source.
    console.log(`Simulating knowledge retrieval for query: ${input.query}`);
    if (input.query.toLowerCase().includes('firebase')) {
      return 'Firebase is Google\'s mobile and web application development platform that helps you build, improve, and grow your app. It offers a variety of services, including authentication, database, storage, hosting, and machine learning.';
    } else if (input.query.toLowerCase().includes('genkit')) {
      return 'Genkit is a framework for building AI-powered applications that can orchestrate calls to large language models, use tools, and integrate with various services.';
    } else {
      return `No specific knowledge found for: "${input.query}". This is a simulated response.`;
    }
  }
);

const knowledgePoweredResponsePrompt = ai.definePrompt({
  name: 'knowledgePoweredResponsePrompt',
  input: { schema: AiCoreKnowledgePoweredResponsesInputSchema },
  output: { schema: AiCoreKnowledgePoweredResponsesOutputSchema },
  tools: [retrieveKnowledge],
  prompt: `You are Brockston AI Core, an advanced conversational agent with access to an extensive knowledge base.
Your goal is to provide accurate, detailed, and context-aware answers to user questions.
If the user's query requires specific factual information, use the 'retrieveKnowledge' tool to access the knowledge base.

### Chat History:
{{#if chatHistory}}
  {{#each chatHistory}}
    - {{{this}}}
  {{/each}}
{{else}}
  No prior chat history.
{{/if}}

### User Query:
{{{query}}}

Provide a comprehensive and consistent answer, leveraging your knowledge and the chat history.`,
});

const aiCoreKnowledgePoweredResponsesFlow = ai.defineFlow(
  {
    name: 'aiCoreKnowledgePoweredResponsesFlow',
    inputSchema: AiCoreKnowledgePoweredResponsesInputSchema,
    outputSchema: AiCoreKnowledgePoweredResponsesOutputSchema,
  },
  async (input) => {
    const { output } = await knowledgePoweredResponsePrompt(input);
    return output!;
  }
);

export async function aiCoreKnowledgePoweredResponses(input: AiCoreKnowledgePoweredResponsesInput): Promise<AiCoreKnowledgePoweredResponsesOutput> {
  return aiCoreKnowledgePoweredResponsesFlow(input);
}
