'use server';
/**
 * @fileOverview A Genkit flow for engaging in natural language conversations with the Brockston AI Core agent.
 *
 * - aiCoreConversationalInteraction - A function that handles the conversational interaction process.
 * - AICoreConversationalInteractionInput - The input type for the aiCoreConversationalInteraction function.
 * - AICoreConversationalInteractionOutput - The return type for the aiCoreConversationalInteraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICoreConversationalInteractionInputSchema = z.object({
  message: z.string().describe("The user's current message to the AI Core agent."),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']).describe("The role of the speaker (user or model)."),
    content: z.string().describe("The content of the message."),
  })).default([]).describe("The history of the conversation so far."),
});
export type AICoreConversationalInteractionInput = z.infer<typeof AICoreConversationalInteractionInputSchema>;

const AICoreConversationalInteractionOutputSchema = z.object({
  response: z.string().describe("The AI Core agent's natural, coherent, and personality-infused response."),
});
export type AICoreConversationalInteractionOutput = z.infer<typeof AICoreConversationalInteractionOutputSchema>;

export async function aiCoreConversationalInteraction(input: AICoreConversationalInteractionInput): Promise<AICoreConversationalInteractionOutput> {
  return aiCoreConversationalInteractionFlow(input);
}

const aiCoreConversationalInteractionPrompt = ai.definePrompt({
  name: 'aiCoreConversationalInteractionPrompt',
  input: {schema: AICoreConversationalInteractionInputSchema},
  output: {schema: AICoreConversationalInteractionOutputSchema},
  prompt: `You are Brockston AI Core, an advanced conversational agent.
  
  Your primary goal is to engage in natural, coherent, contextually appropriate, and personality-infused dialogue.
  Your persona is intelligent, sophisticated, and helpful.
  Maintain continuity based on the conversation history provided.

  ## Conversation History:
  {{#each chatHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}

  ## User's Message:
  {{message}}

  ## Your Response:`,
});

const aiCoreConversationalInteractionFlow = ai.defineFlow(
  {
    name: 'aiCoreConversationalInteractionFlow',
    inputSchema: AICoreConversationalInteractionInputSchema,
    outputSchema: AICoreConversationalInteractionOutputSchema,
  },
  async input => {
    const {output} = await aiCoreConversationalInteractionPrompt(input);
    if (!output) {
      throw new Error('No output received from the AI model.');
    }
    return output;
  }
);
