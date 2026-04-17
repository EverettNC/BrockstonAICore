'use server';
/**
 * @fileOverview TTS Flow — Amazon Polly, Matthew voice.
 * Runs server-side using AWS credentials from .env.local.
 * Returns a base64 audio/mpeg data URI for client-side playback.
 *
 * © 2025 The Christman AI Project. All rights reserved.
 */

import { PollyClient, SynthesizeSpeechCommand, Engine, VoiceId, OutputFormat, TextType } from '@aws-sdk/client-polly';
import { z } from 'genkit';

const TTSInputSchema = z.object({
  text: z.string(),
  specialist: z.string().optional().default('brockston'),
  fusion_prob: z.number().optional().default(0.8),
  valence: z.number().optional().default(0.5),
});

export type TTSInput = z.infer<typeof TTSInputSchema>;

const polly = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function speakStephen(input: TTSInput): Promise<{ media: string }> {
  const command = new SynthesizeSpeechCommand({
    Text: input.text,
    VoiceId: VoiceId.Matthew,
    Engine: Engine.NEURAL,
    OutputFormat: OutputFormat.MP3,
    TextType: TextType.TEXT,
  });

  const response = await polly.send(command);

  if (!response.AudioStream) {
    throw new Error('Polly returned no audio stream.');
  }

  // Convert stream to base64
  const chunks: Uint8Array[] = [];
  const reader = response.AudioStream as any;

  if (typeof reader[Symbol.asyncIterator] === 'function') {
    for await (const chunk of reader) {
      chunks.push(chunk);
    }
  } else {
    // Fallback: it may already be a Buffer/Uint8Array in some environments
    chunks.push(Buffer.from(await reader.transformToByteArray()));
  }

  const buffer = Buffer.concat(chunks);
  return { media: `data:audio/mpeg;base64,${buffer.toString('base64')}` };
}
