/**
 * @fileOverview Vision Tier translating raw perception into contextual cues.
 * Ported from VisionPerception Python module.
 */

import { visionContext } from './vision-context';

export const GESTURE_SYMBOLS: Record<string, { description: string; intent: string }> = {
  "thumbs_up": {
    "description": "Affirmation",
    "intent": "gesture:thumbs_up",
  },
  "hand_wave": {
    "description": "Greeting",
    "intent": "gesture:wave",
  },
  "nod": {
    "description": "Nodding",
    "intent": "gesture:nod",
  },
  "head_shake": {
    "description": "Disagreement",
    "intent": "gesture:shake",
  },
  "point": {
    "description": "Pointing",
    "intent": "gesture:point",
  },
  "stimming": {
    "description": "Stimming pattern",
    "intent": "gesture:stimming",
  },
  "sustained_gaze": {
    "description": "Focus",
    "intent": "eye:focused",
  },
  "rapid_blinking": {
    "description": "Rapid Blinking",
    "intent": "eye:rapid_blink",
  }
};

export class VisionPerception {
  /**
   * Wraps the raw vision analysis with higher-level interpretation.
   * Maps to self.describe() in Python logic.
   */
  static process(rawResult: any): any {
    const { description, posture_analysis, emotion_detected } = rawResult;
    
    // Combine descriptive fields for symbol inference
    const combinedInput = `${description} ${posture_analysis} ${emotion_detected}`.toLowerCase();
    
    // Infer higher-level cues (symbols/gestures)
    const cues = this._inferSymbols(combinedInput);
    
    // Push results into the global VisionContext rolling window
    visionContext.push(
      cues.description || description,
      cues.intent || "perception",
      cues.intent ? 0.8 : 0.4
    );

    return {
      available: true,
      description,
      cues,
      context: visionContext.snapshot()
    };
  }

  /**
   * Internal logic to match descriptions against known gesture patterns.
   * Matches _infer_symbols in Python.
   */
  private static _inferSymbols(text: string): { description: string; intent: string } {
    for (const [key, value] of Object.entries(GESTURE_SYMBOLS)) {
      // Allow for space-separated matching (e.g., "thumbs up")
      if (text.includes(key.replace("_", " "))) {
        return value;
      }
    }
    return { description: "", intent: "" };
  }
}
