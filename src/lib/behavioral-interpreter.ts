/**
 * @fileOverview Behavioral Interpreter for BROCKSTON.
 * Ported and refined from the Enhanced Temporal Nonverbal Engine (Python v5.0).
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

export class BehavioralInterpreter {
  static updateEmotionalState(history: BehaviorObservation[], current: EmotionalState): EmotionalState {
    if (history.length === 0) return current;
    
    const observation = history[history.length - 1];
    const { type, intensity } = observation;
    
    const newState = { ...current };

    // Simple valence/arousal shift based on type
    if (["symbol:happy", "gesture:thumbs_up", "intent:gratitude"].includes(type)) {
      newState.valence = Math.min(1, newState.valence + (0.1 * intensity));
      newState.satisfaction = Math.min(1, newState.satisfaction + (0.1 * intensity));
    } else if (["symbol:sad", "symbol:pain", "intent:complaint"].includes(type)) {
      newState.valence = Math.max(-1, newState.valence - (0.1 * intensity));
      newState.frustration = Math.min(1, newState.frustration + (0.1 * intensity));
    }

    return newState;
  }

  static analyzeTemporalSequence(history: BehaviorObservation[]): PatternInfo {
    if (history.length < 3) {
      return { pattern: "unknown", confidence: 0, meaning: "Insufficient data", description: "Waiting for sequence" };
    }

    const recent = history.slice(-5);
    const types = recent.map(h => h.type);
    const combinedStr = types.join('|');

    // 1. Multimodal Fusion Check
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

    // 2. Trend Analysis
    const trend = this.calculateIntensityTrend(recent);
    const consistency = this.calculateSequenceConsistency(recent);

    // 3. Simple Pattern Match
    const lastType = types[types.length - 1].split(':')[1] || '';
    if (GESTURE_PATTERNS[lastType]) {
      const confidence = Math.min(0.5 + (consistency * 0.4) + (Math.abs(trend) * 0.1), 0.95);
      return {
        pattern: lastType,
        confidence,
        meaning: GESTURE_PATTERNS[lastType].meaning,
        description: GESTURE_PATTERNS[lastType].description
      };
    }

    if (EYE_PATTERNS[lastType]) {
      return {
        pattern: lastType,
        confidence: 0.6,
        meaning: EYE_PATTERNS[lastType].meaning,
        description: EYE_PATTERNS[lastType].description
      };
    }

    return { pattern: "unknown", confidence: 0.2, meaning: "Stable baseline", description: "Perceiving..." };
  }

  /**
   * Linear Regression based Intensity Trend Calculation
   * Ported from Python _calculate_emotion_trend
   */
  static calculateIntensityTrend(sequence: BehaviorObservation[]): number {
    if (sequence.length < 3) return 0;

    const y = sequence.map(o => o.intensity);
    const x = Array.from({ length: y.length }, (_, i) => i);
    
    const n = y.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += x[i];
      sumY += y[i];
      sumXY += x[i] * y[i];
      sumXX += x[i] * x[i];
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    // Normalize slope relative to window size
    return Math.max(-1, Math.min(1, slope * n));
  }

  /**
   * Sequence Consistency Calculation
   * Ported from Python _calculate_sequence_consistency
   */
  static calculateSequenceConsistency(sequence: BehaviorObservation[]): number {
    if (sequence.length < 2) return 0;

    let totalSimilarity = 0;
    for (let i = 0; i < sequence.length - 1; i++) {
      const typeMatch = sequence[i].type === sequence[i+1].type ? 1 : 0;
      const intensityDiff = 1 - Math.abs(sequence[i].intensity - sequence[i+1].intensity);
      totalSimilarity += (typeMatch * 0.7 + intensityDiff * 0.3);
    }

    return totalSimilarity / (sequence.length - 1);
  }

  static generateEnhancedResponse(primaryResult: PatternInfo): string {
    if (primaryResult.confidence < 0.3) {
      return "I'm not detecting a clear pattern in your nonverbal communication.";
    }

    const confidenceLevel = primaryResult.confidence > 0.8 ? "clearly" : primaryResult.confidence > 0.6 ? "likely" : "possibly";
    return `I ${confidenceLevel} observe ${primaryResult.description}. This suggests ${primaryResult.meaning}.`;
  }
}
