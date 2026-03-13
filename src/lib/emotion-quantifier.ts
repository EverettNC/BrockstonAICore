/**
 * @fileOverview Eruptor Emotion Quantifier.
 * Quantifies emotional tone, stress, and coherence without pretending to "feel."
 * Ported from Eruptor_Quantifier.py
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

export enum EmotionalTone {
  CALM = "calm",
  ANXIOUS = "anxious",
  DISTRESSED = "distressed",
  AGITATED = "agitated",
  FLAT = "flat",
  CONFUSED = "confused",
  FEARFUL = "fearful"
}

export enum CoherenceLevel {
  COHERENT = "coherent",
  SLIGHTLY_SCATTERED = "slightly_scattered",
  CONFUSED = "confused",
  DISORGANIZED = "disorganized",
  INCOHERENT = "incoherent"
}

export interface EmotionalMetrics {
  stress_level: number;
  coherence_score: number;
  grounding_score: number;
  emotional_tone: EmotionalTone;
  coherence_level: CoherenceLevel;
  crisis_detected: boolean;
  needs_grounding: boolean;
  needs_breathing: boolean;
  timestamp: string;
}

class EmotionQuantifier {
  private baselineStress = 0.03;
  private baselineCoherence = 0.9;

  private stressMarkers: Record<string, number> = {
    "can't breathe": 0.15,
    "help me": 0.10,
    "scared": 0.08,
    "terrified": 0.12,
    "panicking": 0.15,
    "can't think": 0.10,
    "anxious": 0.05,
    "worried": 0.04,
    "nervous": 0.04,
    "uncomfortable": 0.04,
    "overwhelmed": 0.07,
    "hurt myself": 0.25,
    "end it": 0.25,
    "can't do this": 0.15
  };

  private crisisPhrases = [
    "hurt myself", "kill myself", "end my life",
    "hurt someone", "not safe", "can't keep safe",
    "better off dead", "end it all"
  ];

  analyze(text: string): EmotionalMetrics {
    const cleaned = text.toLowerCase();
    
    // 1. Calculate Stress
    let stressScore = this.baselineStress;
    for (const [marker, weight] of Object.entries(this.stressMarkers)) {
      if (cleaned.includes(marker)) stressScore += weight;
    }
    
    // Repetition check
    const words = cleaned.split(/\s+/);
    const wordCounts: Record<string, number> = {};
    words.forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1; });
    Object.values(wordCounts).forEach(count => {
      if (count >= 3) stressScore += 0.05;
    });

    // Formatting check
    if (text === text.toUpperCase() && text.length > 10) stressScore += 0.05;
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 2) stressScore += Math.min(0.10, exclamations * 0.02);
    stressScore = Math.min(1.0, stressScore);

    // 2. Assess Coherence
    let disorganization = 0.0;
    if (text.length > 5) {
      const shortWords = words.filter(w => w.length <= 2 && /^[a-z]+$/.test(w));
      if (shortWords.length > words.length * 0.3) disorganization += 0.3;
      if (text.length > 50 && !text.includes('.')) disorganization += 0.2;
      if (cleaned.includes('wait') && cleaned.includes('no')) disorganization += 0.1;
    }
    const coherenceScore = Math.max(0.0, this.baselineCoherence - disorganization);

    // 3. Classify Tone
    let tone = EmotionalTone.CALM;
    if (["calm", "okay", "fine", "good"].some(w => cleaned.includes(w))) tone = EmotionalTone.CALM;
    else if (["scared", "terrified", "afraid", "fear"].some(w => cleaned.includes(w))) tone = EmotionalTone.FEARFUL;
    else if (["confused", "don't understand"].some(w => cleaned.includes(w))) tone = EmotionalTone.CONFUSED;
    else if (["nothing", "numb", "empty"].some(w => cleaned.includes(w))) tone = EmotionalTone.FLAT;
    else if (stressScore >= 0.10) tone = EmotionalTone.DISTRESSED;
    else if (stressScore >= 0.05) tone = EmotionalTone.ANXIOUS;

    // 4. Determine Levels
    let level = CoherenceLevel.COHERENT;
    if (coherenceScore < 0.2) level = CoherenceLevel.INCOHERENT;
    else if (coherenceScore < 0.4) level = CoherenceLevel.DISORGANIZED;
    else if (coherenceScore < 0.6) level = CoherenceLevel.CONFUSED;
    else if (coherenceScore < 0.8) level = CoherenceLevel.SLIGHTLY_SCATTERED;

    const groundingScore = Math.max(0.0, 1.0 - (stressScore * 0.7 + (1.0 - coherenceScore) * 0.3));

    return {
      stress_level: stressScore,
      coherence_score: coherenceScore,
      grounding_score: groundingScore,
      emotional_tone: tone,
      coherence_level: level,
      crisis_detected: this.crisisPhrases.some(p => cleaned.includes(p)),
      needs_grounding: groundingScore < 0.5,
      needs_breathing: stressScore >= 0.07,
      timestamp: new Date().toISOString()
    };
  }
}

export const eruptorQuantifier = new EmotionQuantifier();
