/**
 * @fileOverview Brockston Avatar Engine
 * Manages avatar state, emotions, micro-expressions, and speech synchronization
 * Ported from Python full_avatar.py to TypeScript
 *
 * © 2025 The Christman AI Project
 */

export type AvatarEmotion = 'neutral' | 'happy' | 'thinking' | 'learning' | 'excited' | 'confident' | 'curious' | 'focused';
export type AvatarStatus = 'idle' | 'thinking' | 'speaking' | 'listening';

export interface AvatarState {
  status: AvatarStatus;
  emotion: AvatarEmotion;
  intelligenceLevel: number;
  learningSessionsCompleted: number;
  isLearning: boolean;
  autonomyEnabled: boolean;
}

export interface EmotionConfig {
  valence: number;      // -1.0 (negative) to 1.0 (positive)
  arousal: number;       // 0.0 (calm) to 1.0 (excited)
  dominance: number;     // 0.0 (submissive) to 1.0 (dominant)
}

// Emotion configurations based on PAD model
export const emotionConfigs: Record<AvatarEmotion, EmotionConfig> = {
  neutral: { valence: 0, arousal: 0.3, dominance: 0.5 },
  happy: { valence: 0.8, arousal: 0.6, dominance: 0.6 },
  thinking: { valence: 0.1, arousal: 0.4, dominance: 0.5 },
  learning: { valence: 0.5, arousal: 0.7, dominance: 0.6 },
  excited: { valence: 0.9, arousal: 0.9, dominance: 0.7 },
  confident: { valence: 0.7, arousal: 0.5, dominance: 0.8 },
  curious: { valence: 0.4, arousal: 0.6, dominance: 0.5 },
  focused: { valence: 0.2, arousal: 0.5, dominance: 0.7 },
};

// Map Christman tone labels to avatar emotions
export function mapToneToEmotion(tone: string): AvatarEmotion {
  const toneMap: Record<string, AvatarEmotion> = {
    'sweetheart': 'happy',
    'happy': 'happy',
    'proud': 'confident',
    'laugh': 'happy',
    'teasing': 'curious',
    'annoyed': 'focused',
    'sarcastic': 'thinking',
    'tremble': 'focused',
    'emphasis': 'confident',
    'last_breath': 'thinking',
    'neutral': 'neutral',
  };
  return toneMap[tone.toLowerCase()] || 'neutral';
}

// Map ethical/action states to emotions
export function mapActionStateToEmotion(actionState: string): AvatarEmotion {
  if (actionState === 'INTERVENTION') return 'focused';
  if (actionState === 'HOLD_SPACE') return 'thinking';
  return 'neutral';
}

class AvatarEngine {
  private state: AvatarState = {
    status: 'idle',
    emotion: 'neutral',
    intelligenceLevel: 0,
    learningSessionsCompleted: 0,
    isLearning: false,
    autonomyEnabled: true,
  };

  private listeners: ((state: AvatarState) => void)[] = [];

  // Get current state
  getState(): AvatarState {
    return { ...this.state };
  }

  // Subscribe to state changes
  subscribe(listener: (state: AvatarState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  // Set status
  setStatus(status: AvatarStatus) {
    this.state.status = status;
    this.notify();
  }

  // Set emotion
  setEmotion(emotion: AvatarEmotion) {
    this.state.emotion = emotion;
    this.notify();
  }

  // Start talking
  startTalking(emotion?: AvatarEmotion) {
    this.state.status = 'speaking';
    if (emotion) this.state.emotion = emotion;
    this.notify();
  }

  // Stop talking
  stopTalking() {
    this.state.status = 'idle';
    this.notify();
  }

  // Start thinking
  startThinking() {
    this.state.status = 'thinking';
    this.state.emotion = 'thinking';
    this.notify();
  }

  // Stop thinking
  stopThinking() {
    this.state.status = 'idle';
    this.state.emotion = 'neutral';
    this.notify();
  }

  // Start learning
  startLearning() {
    this.state.isLearning = true;
    this.state.emotion = 'learning';
    this.notify();
  }

  // Stop learning
  stopLearning() {
    this.state.isLearning = false;
    this.state.emotion = 'neutral';
    this.notify();
  }

  // Update intelligence level
  updateIntelligence(delta: number) {
    const previousLevel = this.state.intelligenceLevel;
    this.state.intelligenceLevel = Math.min(100, Math.max(0, this.state.intelligenceLevel + delta));

    // React to intelligence growth
    const growth = this.state.intelligenceLevel - previousLevel;
    if (growth > 5) {
      this.state.emotion = 'excited';
    } else if (growth > 0) {
      this.state.emotion = 'confident';
    }

    this.notify();
  }

  // Complete learning session
  completeLearningSession() {
    this.state.learningSessionsCompleted++;
    this.updateIntelligence(0.5); // Small boost per session
    this.notify();
  }

  // Process emotional salience from AI response
  processEmotionalSalience(emotion: AvatarEmotion, salience: number) {
    this.state.emotion = emotion;

    // Higher salience = more intense reaction
    if (salience > 0.8) {
      // Trigger strong emotional response
      setTimeout(() => this.setEmotion('neutral'), 3000);
    }

    this.notify();
  }

  // Estimate speech duration from text (for lip-sync timing)
  estimateSpeechDuration(text: string): number {
    // Average speaking rate: ~150 words per minute = 2.5 words per second
    const wordCount = text.split(/\s+/).length;
    const baseDuration = wordCount / 2.5; // seconds

    // Add padding for punctuation pauses
    const punctuationCount = (text.match(/[.!?]/g) || []).length;
    const pauseDuration = punctuationCount * 0.3; // 300ms per punctuation

    return (baseDuration + pauseDuration) * 1000; // Convert to milliseconds
  }

  // Get emotion configuration
  getEmotionConfig(): EmotionConfig {
    return emotionConfigs[this.state.emotion];
  }

  // Reset to default state
  reset() {
    this.state = {
      status: 'idle',
      emotion: 'neutral',
      intelligenceLevel: this.state.intelligenceLevel, // Preserve intelligence
      learningSessionsCompleted: this.state.learningSessionsCompleted,
      isLearning: false,
      autonomyEnabled: this.state.autonomyEnabled,
    };
    this.notify();
  }
}

// Singleton instance
export const avatarEngine = new AvatarEngine();

// Hook for React components
export function useAvatarState(): AvatarState {
  const [state, setState] = useState<AvatarState>(avatarEngine.getState());

  useEffect(() => {
    return avatarEngine.subscribe(setState);
  }, []);

  return state;
}

import { useState, useEffect } from 'react';

// ... existing code ...
