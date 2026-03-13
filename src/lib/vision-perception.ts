/**
 * @fileOverview Vision Tier translating raw perception into contextual cues.
 * Optimized for Brockston's Classroom Mode (Nonverbal/Autistic Support).
 */

import { visionContext } from './vision-context';

export const GESTURE_SYMBOLS: Record<string, { description: string; intent: string }> = {
  "thumbs_up": {
    "description": "Affirmation / 'I'm good'",
    "intent": "gesture:thumbs_up",
  },
  "hand_wave": {
    "description": "Greeting / 'Hello'",
    "intent": "gesture:wave",
  },
  "nod": {
    "description": "Agreement / Yes",
    "intent": "gesture:nod",
  },
  "head_shake": {
    "description": "Disagreement / No",
    "intent": "gesture:shake",
  },
  "point": {
    "description": "Requesting object / Attention",
    "intent": "gesture:point",
  },
  "stimming": {
    "description": "Regulating / Self-stimulatory movement",
    "intent": "gesture:stimming",
  },
  "sustained_gaze": {
    "description": "Deep Focus",
    "intent": "eye:focused",
  },
  "rapid_blinking": {
    "description": "Sensory Overload / Processing",
    "intent": "eye:rapid_blink",
  },
  "head_tilt": {
    "description": "Curiosity / Listening",
    "intent": "gesture:tilt_head",
  },
  "covering_ears": {
    "description": "Sensory Protection / Overwhelmed",
    "intent": "gesture:sensory_overload",
  }
};

export class VisionPerception {
  /**
   * Wraps the raw vision analysis with higher-level interpretation.
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
      cues.intent ? 0.85 : 0.4
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
   */
  private static _inferSymbols(text: string): { description: string; intent: string } {
    for (const [key, value] of Object.entries(GESTURE_SYMBOLS)) {
      if (text.includes(key.replace("_", " "))) {
        return value;
      }
    }
    return { description: "", intent: "" };
  }
}
