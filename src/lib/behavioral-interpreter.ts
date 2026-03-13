
/**
 * @fileOverview Behavioral Interpreter for BROCKSTON (TypeScript Port).
 * Ported from v3.0 Behavioral Interpreter Module.
 */

export type BehaviorType = 
  | "gesture:thumbs_up" | "gesture:thumbs_down" | "gesture:wave" | "gesture:nod" 
  | "gesture:shake" | "gesture:stimming" | "gesture:rapid_blink" | "gesture:tilt_head"
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

    return patterns;
  }

  static predictNeeds(emotionalState: EmotionalState): string {
    if (emotionalState.frustration > 0.7 || emotionalState.arousal > 0.8) return "emotional_comfort";
    if (emotionalState.uncertainty > 0.6) return "cognitive_clarification";
    if (emotionalState.attention < 0.4 && emotionalState.arousal < 0.4) return "rest_recovery";
    if (emotionalState.valence > 0.6 && emotionalState.satisfaction > 0.6) return "social_engagement";
    return "standard_support";
  }
}
