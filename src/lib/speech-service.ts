
/**
 * @fileOverview Unified Speech Service for BROCKSTON.
 * Bridges transcription and synthesis using neural flows and specialists.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

import { transcribeAudio } from '@/ai/flows/transcription-flow';
import { speakStephen } from '@/ai/flows/tts-flow';

export class SpeechService {
  /**
   * Transcribes audio blob to text using the Neural Transcription Flow.
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      const dataUri = await this.blobToDataUri(audioBlob);
      const result = await transcribeAudio({ audioDataUri: dataUri });
      return result.text;
    } catch (error) {
      console.error("Transcription failed:", error);
      return "Transcription failed. Please try again.";
    }
  }

  /**
   * Synthesizes text to speech using the Specialist Voice Bridge.
   */
  async synthesizeSpeech(text: string, voice: string = "brockston"): Promise<string> {
    try {
      const result = await speakStephen({ text, specialist: voice });
      return result.media;
    } catch (error) {
      console.error("Speech synthesis failed:", error);
      throw error;
    }
  }

  private blobToDataUri(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const brockstonSpeech = new SpeechService();
