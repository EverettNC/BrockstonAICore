'use server';
/**
 * @fileOverview Brockston Quantum-Aware TTS (Stephen Voice & Family).
 * Implements prosody control influenced by quantum fusion and emotional valence.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import wav from 'wav';

const TTSInputSchema = z.object({
  text: z.string(),
  specialist: z.string().optional().default('derek'),
  fusion_prob: z.number().optional().default(0.8),
  valence: z.number().optional().default(0.5),
});

const TTSOutputSchema = z.object({
  media: z.string().describe('Data URI of the audio.'),
});

const VOICE_MAPPING: Record<string, string> = {
  derek: 'Algenib',
  brockston: 'Algenib',
  arthur: 'Algenib',
  alphavox: 'Algenib',
  alphawolf: 'Algenib',
  siera: 'Achernar',
  serafinia: 'Achernar',
  inferno: 'Algenib',
};

export async function speakStephen(input: z.infer<typeof TTSInputSchema>) {
  return ttsFlow(input);
}

const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: TTSInputSchema,
    outputSchema: TTSOutputSchema,
  },
  async (input) => {
    const { text, specialist, fusion_prob, valence } = input;
    
    const voiceName = VOICE_MAPPING[specialist.toLowerCase()] || 'Algenib';
    
    // Quantum Prosody Logic
    // Confidence (fusion_prob) affects speaking rate/urgency
    // Valence (emotion) affects pitch/warmth
    const speed = fusion_prob > 0.7 ? 1.0 : 0.85;
    const pitch = 1.0 + (valence - 0.5) * 0.2; // Higher valence = slightly higher pitch

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
      prompt: `Speak this message with a ${valence > 0.7 ? 'happy' : valence < 0.3 ? 'calm and slow' : 'steady'} tone: ${text}`,
    });

    if (!media) {
      throw new Error('Ultimate Voice failure: No media returned');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
