/**
 * @fileOverview Vision Context helpers that annotate perception for the cortex.
 * Maintains a rolling window of interpreted vision events to provide situational awareness.
 * Ported from Vision Context Python module.
 */

export interface VisionEvent {
  description: string;
  intent: string;
  confidence: number;
  timestamp: string;
}

class VisionContext {
  private events: VisionEvent[] = [];
  private readonly span: number;

  constructor(span: number = 5) {
    this.span = span;
  }

  /**
   * Pushes a new vision event into the rolling window.
   */
  push(description: string, intent: string, confidence: number): void {
    this.events.push({ 
      description, 
      intent, 
      confidence,
      timestamp: new Date().toISOString()
    });
    
    // Maintain rolling window (maxlen=span)
    if (this.events.length > this.span) {
      this.events.shift();
    }
  }

  /**
   * Returns a snapshot of current vision events for cortical processing.
   */
  snapshot(): { events: VisionEvent[]; count: number } {
    return {
      events: [...this.events],
      count: this.events.length
    };
  }

  /**
   * Clears all vision events.
   */
  clear(): void {
    this.events = [];
  }
}

// Singleton instance for global access
export const visionContext = new VisionContext();
