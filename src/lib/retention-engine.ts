
/**
 * @fileOverview Retention Engine for BROCKSTON.
 * Implements Spaced Repetition (LTP) and Symbolic Reflection logic.
 * 
 * © 2025 The Christman AI Project.
 */

export interface MemoryItem {
  id: string;
  topic: string;
  domain: string;
  content: string;
  last_review: number;
  interval: number; // in seconds
  mastery: number;
  importance: number;
}

export class RetentionEngine {
  /**
   * Symbolic Spaced Repetition Rule:
   * Double interval on success, halve on failure.
   */
  static calculateNextInterval(currentInterval: number, success: boolean): number {
    const minInterval = 300; // 5 minutes
    const maxInterval = 31536000; // 1 year
    
    if (success) {
      return Math.min(maxInterval, currentInterval * 2);
    } else {
      return Math.max(minInterval, currentInterval / 2);
    }
  }

  /**
   * Symbolic Reflection Rule:
   * Link memory to insights if similarity or domain matches.
   */
  static deriveHybridInsight(memory: MemoryItem, related?: MemoryItem): string {
    if (related) {
      return `Linked insight from [${memory.topic}] and [${related.topic}]: Synthesizing ${memory.domain} patterns with ${related.domain} resonance to enhance human-centered support.`;
    }
    return `Self-reflection on [${memory.topic}]: Derived core strategy for dignity-first implementation in the ${memory.domain} domain.`;
  }

  /**
   * Curriculum Prioritization Formula:
   * Score = Priority * (1 - Mastery)
   */
  static calculateTopicScore(priority: number, mastery: number): number {
    return priority * (1 - mastery);
  }
}
