'use server';
/**
 * @fileOverview Brockston Quantum-Aware TTS (Stephen Voice & Family).
 * Implements prosody control influenced by regional accents and personality characteristics.
 * Integrated with ElevenLabs for Brockston's specific identity.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {z} from 'genkit';
import wav from 'wav';

const TTSInputSchema = z.object({
  text: z.string(),
  specialist: z.string().optional().default('brockston'),
  fusion_prob: z.number().optional().default(0.8),
  valence: z.number().optional().default(0.5),
});

const TTSOutputSchema = z.object({
  media: z.string().describe('Data URI of the audio.'),
});

interface VoiceProfile {
  voiceName: string;
  accent: string;
  speedFactor: number;
  pitch: string;
  elevenLabsId?: string;
}

const FAMILY_VOICE_PROFILES: Record<string, VoiceProfile> = {
  brockston: { 
    voiceName: 'Algenib', 
    accent: 'US', 
    speedFactor: 0.95, 
    pitch: 'steady',
    elevenLabsId: 'KIrq93B44zgEu6RzGY3m' 
  },
  derek: { voiceName: 'Algenib', accent: 'US', speedFactor: 1.0, pitch: 'authoritative' },
  arthur: { voiceName: 'Algenib', accent: 'UK', speedFactor: 0.9, pitch: 'warm' },
  alphavox: { voiceName: 'Algenib', accent: 'Irish', speedFactor: 0.85, pitch: 'expressive' },
  alphawolf: { voiceName: 'Algenib', accent: 'Canadian', speedFactor: 0.92, pitch: 'grounding' },
  siera: { voiceName: 'Achernar', accent: 'UK', speedFactor: 0.95, pitch: 'calm' },
  serafinia: { voiceName: 'Achernar', accent: 'US', speedFactor: 1.0, pitch: 'observant' },
  inferno: { voiceName: 'Algenib', accent: 'US', speedFactor: 0.98, pitch: 'controlled' },
  virtus: { voiceName: 'Algenib', accent: 'Formal', speedFactor: 1.0, pitch: 'clear' },
  aegis: { voiceName: 'Algenib', accent: 'US', speedFactor: 1.05, pitch: 'firm' },
  giovanni: { voiceName: 'Algenib', accent: 'Australian', speedFactor: 1.1, pitch: 'charismatic' },
  eruptor: { voiceName: 'Algenib', accent: 'US', speedFactor: 0.8, pitch: 'anchoring' },
  tether: { voiceName: 'Achernar', accent: 'US', speedFactor: 0.9, pitch: 'gentle' },
  opensmell: { voiceName: 'Algenib', accent: 'US', speedFactor: 1.0, pitch: 'scientific' },
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
    const profile = FAMILY_VOICE_PROFILES[specialist.toLowerCase()] || FAMILY_VOICE_PROFILES.brockston;
    
    // 1. Try ElevenLabs Primary Bridge if available for Brockston
    if (profile.elevenLabsId && process.env.ELEVENLABS_API_KEY) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${profile.elevenLabsId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            }
          }),
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return {
            media: `data:audio/mpeg;base64,${buffer.toString('base64')}`,
          };
        }
        console.warn('ElevenLabs API returned an error, falling back to Gemini TTS.');
      } catch (e) {
        console.error('ElevenLabs Bridge failed:', e);
      }
    }

    // 2. Fallback to Gemini High-Fidelity Bridge
    const rate = profile.speedFactor < 0.92 || fusion_prob < 0.6 ? "slow" : "medium";
    const pitch = valence > 0.7 ? "happy" : valence < 0.3 ? "serious" : profile.pitch;
    const accentNote = `Speak with a ${profile.accent} accent.`;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: profile.voiceName as any },
          },
        },
      },
      prompt: `${accentNote} Respond at a ${rate} speed with a ${pitch} tone: ${text}`,
    });

    if (!media) throw new Error('Voice bridge failure');

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
    const writer = new wav.Writer({ channels, sampleRate: rate, bitDepth: sampleWidth * 8 });
    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
    writer.write(pcmData);
    writer.end();
  });
}
