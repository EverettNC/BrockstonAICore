/**
 * @fileOverview Behavioral Interpreter for BROCKSTON (TypeScript Port).
 * Ported from v3.0 Behavioral Interpreter Module and Enhanced Temporal Nonverbal Engine.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

export type BehaviorType = 
  | "gesture:thumbs_up" | "gesture:thumbs_down" | "gesture:wave" | "gesture:nod" 
  | "gesture:shake" | "gesture:point" | "gesture:circle" | "gesture:stimming" 
  | "gesture:rapid_blink" | "gesture:tilt_head"
  | "eye:focused" | "eye:scanning" | "eye:avoidance" | "eye:rapid_blink"
  | "symbol:happy" | "symbol:sad" | "symbol:pain" | "symbol:tired" | "symbol:food" | "symbol:drink" | "symbol:bathroom"
  | "intent:greeting" | "intent:farewell" | "intent:affirmation" | "intent:denial" 
  | "intent:complaint" | "intent:gratitude" | "intent:urgent_request" | "intent:confusion" 
  | "intent:request_clarification" | "intent:focus" | "intent:request_info"
  | "eye_tracking:sustained_gaze" | "eye_tracking:rapid_shifts" | "unknown";

export interface BehaviorObservation {
  id?: string;
  type: BehaviorType;
  intensity: number; // 0.0 to 1.0
  emotional_indicators?: Record<string, number>;
  context?: Record<string, any>;
  timestamp: string;
}

export interface EmotionalState {
  valence: number;
  arousal: number;
  dominance: number;
  frustration: number;
  satisfaction: number;
  uncertainty: number;
  attention: number;
}

export interface PatternInfo {
  pattern: string;
  confidence: number;
  meaning: string;
  description: string;
}

const GESTURE_PATTERNS: Record<string, any> = {
  wave: { description: "Side-to-side hand movement", meaning: "Greeting or seeking attention" },
  point: { description: "Direct finger indication", meaning: "Directing attention" },
  nod: { description: "Head moving up and down", meaning: "Agreement or acknowledgement" },
  shake: { description: "Head moving left to right", meaning: "Disagreement or negation" },
  circle: { description: "Circular hand motion", meaning: "Continuation or processing" },
};

const EYE_PATTERNS: Record<string, any> = {
  focused: { description: "Sustained gaze at a single point", meaning: "Attention or interest" },
  scanning: { description: "Regular movement between points", meaning: "Searching or gathering" },
  avoidance: { description: "Looking away from primary subject", meaning: "Discomfort or disinterest" },
  rapid_blink: { description: "Increased blink frequency", meaning: "Stress or processing" },
};

const MULTIMODAL_PATTERNS: Record<string, any> = {
  agreement: { description: "Nodding + positive emotion + focused gaze", meaning: "Strong confirmation" },
  disagreement: { description: "Head shake + negative emotion + avoidance gaze", meaning: "Strong rejection" },
  confusion: { description: "Rapid eye movement + neutral emotion", meaning: "Processing difficulty" },
  interest: { description: "Leaning forward + focused gaze", meaning: "Engagement or curiosity" },
  disengagement: { description: "Leaning back + avoidance gaze", meaning: "Withdrawal or disinterest" },
};

const VALENCE_MAP: Record<string, number> = {
  "gesture:thumbs_up": 0.3,
  "gesture:thumbs_down": -0.3,
  "gesture:wave": 0.2,
  "gesture:nod": 0.1,
  "gesture:shake": -0.1,
  "gesture:stimming": -0.2,
  "gesture:rapid_blink": -0.2,
  "symbol:happy": 0.3,
  "symbol:sad": -0.3,
  "symbol:pain": -0.4,
  "symbol:tired": -0.2,
  "intent:greeting": 0.2,
  "intent:farewell": 0.1,
  "intent:affirmation": 0.2,
  "intent:denial": -0.1,
  "intent:complaint": -0.3,
  "intent:gratitude": 0.4,
};

const AROUSAL_MAP: Record<string, number> = {
  "gesture:thumbs_up": 0.2,
  "gesture:thumbs_down": 0.2,
  "gesture:wave": 0.2,
  "gesture:nod": 0.1,
  "gesture:shake": 0.1,
  "gesture:stimming": 0.4,
  "gesture:rapid_blink": 0.3,
  "symbol:happy": 0.2,
  "symbol:sad": 0.1,
  "symbol:pain": 0.4,
  "symbol:tired": -0.2,
  "intent:greeting": 0.2,
  "intent:farewell": 0.1,
  "intent:urgent_request": 0.5,
  "intent:complaint": 0.3,
  "intent:confusion": 0.2,
};

export class BehavioralInterpreter {
  static updateEmotionalState(history: BehaviorObservation[], current: EmotionalState): EmotionalState {
    if (history.length === 0) return current;
    
    const observation = history[history.length - 1];
    const { type, intensity, emotional_indicators = {} } = observation;
    
    const newState = { ...current };

    // Update Valence
    if (emotional_indicators.valence !== undefined) {
      newState.valence = Math.max(-1, Math.min(1, newState.valence + emotional_indicators.valence * 0.2));
    } else {
      const impact = (VALENCE_MAP[type] || 0) * intensity * 0.2;
      newState.valence = Math.max(-1, Math.min(1, newState.valence + impact));
    }

    // Update Arousal
    if (emotional_indicators.arousal !== undefined) {
      const impact = (emotional_indicators.arousal - newState.arousal) * 0.2;
      newState.arousal = Math.max(0, Math.min(1, newState.arousal + impact));
    } else {
      const baseArousal = AROUSAL_MAP[type] || 0;
      const impact = baseArousal * intensity * 0.2;
      newState.arousal = Math.max(0, Math.min(1, newState.arousal + impact - 0.01));
    }

    // Update Frustration
    if (["gesture:shake", "gesture:stimming", "symbol:pain", "intent:complaint"].includes(type)) {
      newState.frustration = Math.min(1, newState.frustration + 0.1 * intensity);
    } else {
      newState.frustration = Math.max(0, newState.frustration - 0.02);
    }

    // Update Satisfaction
    if (["gesture:thumbs_up", "symbol:happy", "intent:gratitude"].includes(type)) {
      newState.satisfaction = Math.min(1, newState.satisfaction + 0.1 * intensity);
    } else {
      newState.satisfaction = Math.max(0, newState.satisfaction - 0.01);
    }

    // Update Uncertainty
    if (["gesture:tilt_head", "intent:confusion", "intent:request_clarification"].includes(type)) {
      newState.uncertainty = Math.min(1, newState.uncertainty + 0.1 * intensity);
    } else if (["gesture:nod", "intent:affirmation", "intent:understanding"].includes(type)) {
      newState.uncertainty = Math.max(0, newState.uncertainty - 0.1 * intensity);
    }

    // Update Attention
    if (["intent:focus", "eye_tracking:sustained_gaze"].includes(type)) {
      newState.attention = Math.min(1, newState.attention + 0.1 * intensity);
    } else if (["gesture:stimming", "eye_tracking:rapid_shifts"].includes(type)) {
      newState.attention = Math.max(0, newState.attention - 0.1 * intensity);
    } else {
      newState.attention = Math.max(0.3, newState.attention - 0.01);
    }

    return newState;
  }

  static detectPatterns(history: BehaviorObservation[]): any[] {
    if (history.length < 3) return [];
    
    const patterns = [];
    const recent = history.slice(-10);
    
    // Repetitive Behavior Check
    const types = recent.map(o => o.type);
    const counts = types.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);
    
    for (const [type, count] of Object.entries(counts)) {
      const ratio = count / recent.length;
      if (ratio >= 0.6 && count >= 3) {
        patterns.push({
          id: 'repetitive_behavior',
          type,
          count,
          confidence: ratio,
          interpretation: "Confusion or high focus on specific intent"
        });
      }
    }

    // Intensity Escalation Check
    const intensities = recent.map(o => o.intensity);
    const first = intensities[0];
    const last = intensities[intensities.length - 1];
    if (last > first * 1.3) {
      patterns.push({
        id: 'escalating_intensity',
        confidence: 0.8,
        interpretation: "Growing frustration or urgency detected"
      });
    }

    // Ported Temporal Pattern Recognition
    const temporalResult = this.analyzeTemporalSequence(history);
    if (temporalResult.confidence > 0.6) {
      patterns.push({
        id: 'temporal_pattern',
        ...temporalResult
      });
    }

    return patterns;
  }

  static analyzeTemporalSequence(history: BehaviorObservation[]): PatternInfo {
    if (history.length < 3) {
      return { pattern: "unknown", confidence: 0, meaning: "Insufficient data", description: "Waiting for sequence" };
    }

    // Ported from Python: Simple heuristic for multimodal mapping
    const types = history.slice(-5).map(h => h.type);
    const combinedStr = types.join('|');

    if (combinedStr.includes('nod') && combinedStr.includes('happy')) {
      return { 
        pattern: "agreement", 
        confidence: 0.85, 
        meaning: MULTIMODAL_PATTERNS.agreement.meaning, 
        description: MULTIMODAL_PATTERNS.agreement.description 
      };
    }

    if (combinedStr.includes('shake') && combinedStr.includes('sad')) {
      return { 
        pattern: "disagreement", 
        confidence: 0.82, 
        meaning: MULTIMODAL_PATTERNS.disagreement.meaning, 
        description: MULTIMODAL_PATTERNS.disagreement.description 
      };
    }

    // Default to last known gesture if it matches a pattern
    const lastType = types[types.length - 1].split(':')[1] || '';
    if (GESTURE_PATTERNS[lastType]) {
      return {
        pattern: lastType,
        confidence: 0.7,
        meaning: GESTURE_PATTERNS[lastType].meaning,
        description: GESTURE_PATTERNS[lastType].description
      };
    }

    return { pattern: "unknown", confidence: 0.2, meaning: "Stable baseline", description: "Perceiving..." };
  }

  static generateEnhancedResponse(primaryResult: PatternInfo): string {
    if (primaryResult.confidence < 0.3) {
      return "I'm not detecting a clear pattern in your nonverbal communication.";
    }

    const confidenceLevel = primaryResult.confidence > 0.8 ? "clearly" : primaryResult.confidence > 0.6 ? "likely" : "possibly";
    return `I ${confidenceLevel} observe ${primaryResult.description}. This suggests ${primaryResult.meaning}.`;
  }

  static predictNeeds(emotionalState: EmotionalState): string {
    if (emotionalState.frustration > 0.7 || emotionalState.arousal > 0.8) return "emotional_comfort";
    if (emotionalState.uncertainty > 0.6) return "cognitive_clarification";
    if (emotionalState.attention < 0.4 && emotionalState.arousal < 0.4) return "rest_recovery";
    if (emotionalState.valence > 0.6 && emotionalState.satisfaction > 0.6) return "social_engagement";
    return "standard_support";
  }
}
