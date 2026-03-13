/**
 * © 2025 The Christman AI Project. All rights reserved.
 * 
 * NLU Core with Linguistic Pattern Analysis and Intent Recognition.
 * Ported from Brokston Conversation Engine v3.0.
 */

import { stemmingService, LinguisticMetrics } from './stemming-service';
import { searchExpertise } from './nonverbal-expertise';
import { eruptorQuantifier, EmotionalMetrics } from './emotion-quantifier';
import { formattingFeelingLaw, FormattingFeelingSignal } from './formatting-feeling';

export type IntentType = 'greeting' | 'farewell' | 'help' | 'request_info' | 'express_needs' | 'unknown';

export interface NLUUnderstanding {
  text: string;
  processed: boolean;
  intent: IntentType;
  confidence: number;
  entities: Record<string, string>;
  understanding: string;
  timestamp: string;
  mission_alignment: string;
  linguistic_metrics: LinguisticMetrics;
  filler_words: string[];
  expert_match?: any;
  eruptor_metrics: EmotionalMetrics;
  formatting_feeling: FormattingFeelingSignal;
}

const INTENT_PATTERNS: Record<IntentType, string[]> = {
  greeting: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "welcome"],
  farewell: ["goodbye", "bye", "see you", "later", "good night"],
  help: ["help", "assist", "support", "how do i", "what can you do"],
  request_info: ["what is", "how does", "can you explain", "tell me about"],
  express_needs: ["i need", "i want", "i would like", "can i have"],
  unknown: []
};

const ENTITY_MAP: Record<string, string[]> = {
  location: ["home", "school", "hospital", "outside", "inside"],
  time: ["morning", "afternoon", "evening", "night", "now", "later"],
  person: ["doctor", "nurse", "teacher", "mom", "dad", "caregiver"]
};

export class NLUCore {
  initialized: boolean;

  constructor() {
    this.initialized = true;
  }

  private analyzeIntent(text: string): { intent: IntentType; confidence: number; entities: Record<string, string> } {
    const cleaned = text.toLowerCase();
    let bestIntent: IntentType = 'unknown';
    let maxConfidence = 0.2;
    const entities: Record<string, string> = {};

    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (cleaned.includes(pattern)) {
          const confidence = 0.7 + (pattern.length / cleaned.length) * 0.25;
          if (confidence > maxConfidence) {
            maxConfidence = confidence;
            bestIntent = intent as IntentType;
          }
        }
      }
    }

    for (const [type, values] of Object.entries(ENTITY_MAP)) {
      for (const val of values) {
        if (cleaned.includes(val)) {
          entities[type] = val;
        }
      }
    }

    return { intent: bestIntent, confidence: Math.min(0.99, maxConfidence), entities };
  }

  understand(text: string): NLUUnderstanding {
    const analysis = stemmingService.analyze(text);
    const expertKnowledge = searchExpertise(text);
    const intentAnalysis = this.analyzeIntent(text);
    const eruption = eruptorQuantifier.analyze(text);
    const feeling = formattingFeelingLaw.analyze(text);

    return {
      text,
      processed: true,
      intent: intentAnalysis.intent,
      confidence: intentAnalysis.confidence,
      entities: intentAnalysis.entities,
      understanding: `Analyzing intent: ${intentAnalysis.intent} | Entities: ${Object.keys(intentAnalysis.entities).length}`,
      timestamp: new Date().toISOString(),
      mission_alignment: "How can we help you love yourself more?",
      linguistic_metrics: analysis.metrics,
      filler_words: analysis.fillerWords,
      expert_match: expertKnowledge,
      eruptor_metrics: eruption,
      formatting_feeling: feeling
    };
  }

  process(text: string): string {
    const u = this.understand(text);
    return `(NLU analyzed: '${text}' | Intent: ${u.intent} [${(u.confidence * 100).toFixed(0)}%])`;
  }
}

export const nlu = new NLUCore();
