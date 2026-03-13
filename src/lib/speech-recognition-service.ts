
/**
 * @fileOverview Enhanced Speech Recognition Service for BROCKSTON.
 * Bridges Web Speech API with Christman AI recognition context.
 * Ported from EnhancedSpeechRecognition Python module.
 */

export interface RecognitionStatus {
  isListening: boolean;
  isProcessing: boolean;
  language: string;
  sensitivity: number;
}

export class SpeechRecognitionService {
  private recognition: any | null = null;
  private isListening: boolean = false;
  private isProcessing: boolean = false;
  private language: string = "en-US";
  private sensitivity: number = 0.5;
  private recentPhrases: string[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.language;
      }
    }
  }

  startListening(onResult: (text: string, isFinal: boolean) => void, onError: (err: any) => void) {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          this._updateContext(finalTranscript);
          onResult(finalTranscript, true);
        } else {
          interimTranscript += event.results[i][0].transcript;
          onResult(interimTranscript, false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        this.recognition.start(); // Auto-restart if we're supposed to be listening
      }
    };

    this.isListening = true;
    this.recognition.start();
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private _updateContext(text: string) {
    this.recentPhrases.push(text);
    if (this.recentPhrases.length > 5) {
      this.recentPhrases.shift();
    }
  }

  getStatus(): RecognitionStatus {
    return {
      isListening: this.isListening,
      isProcessing: this.isProcessing,
      language: this.language,
      sensitivity: this.sensitivity
    };
  }

  setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}

export const speechService = new SpeechRecognitionService();
