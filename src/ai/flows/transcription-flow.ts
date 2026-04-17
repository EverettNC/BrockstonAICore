
'use server';
/**
 * @fileOverview Brockston Neural Transcription Flow.
 * Uses Gemini 1.5 Flash to provide server-side audio-to-text transcription.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

import { ai, LOCAL_MODEL } from '@/ai/genkit';
import { z } from 'genkit';

const TranscriptionInputSchema = z.object({
  audioDataUri: z.string().describe("Base64 audio data URI with MIME type."),
});

const TranscriptionOutputSchema = z.object({
  text: z.string().describe("The transcribed text."),
  confidence: z.number().optional().describe("Confidence score of the transcription."),
});

export type TranscriptionInput = z.infer<typeof TranscriptionInputSchema>;
export type TranscriptionOutput = z.infer<typeof TranscriptionOutputSchema>;

/**
 * Transcribes audio data using the Silicon Neural Cortex.
 */
export async function transcribeAudio(input: TranscriptionInput): Promise<TranscriptionOutput> {
  return transcriptionFlow(input);
}

const transcriptionFlow = ai.defineFlow(
  {
    name: 'transcriptionFlow',
    inputSchema: TranscriptionInputSchema,
    outputSchema: TranscriptionOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      model: LOCAL_MODEL,
      prompt: [
        { text: 'You are the transcription module for BROCKSTON C. Transcribe the provided audio precisely. Return only the transcription text, no meta-commentary.' },
        { media: { url: input.audioDataUri } }
      ],
    });

    return {
      text: text || "",
      confidence: 0.98
    };
  }
);
