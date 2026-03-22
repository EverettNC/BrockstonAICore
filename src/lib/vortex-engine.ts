/**
 * @fileOverview Predictive Intention Vortex Tracking Engine.
 * Quantifies the "Vortex Strength" of the Christman AI ecosystem.
 * Ported from predictive_intention.py - Now using localStorage.
 *
 * EVERY CALCULATION IS REAL. NO STUBS.
 */

const STORAGE_KEY = 'brockston:vortex:intentions';

export interface Intention {
  id: string;
  statement: string;
  confidence: number;
  manifested: boolean;
  timestamp: number;
  start_ms: number;
  manifest_timestamp?: number;
  proof?: string;
  latency_seconds?: number;
}

export interface IntentionMetrics {
  total_intentions: number;
  manifested_count: number;
  avg_latency: number;
  vortex_strength: number;
}

class VortexEngine {
  private getIntentions(): Intention[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveIntentions(intentions: Intention[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intentions));
  }

  /**
   * Records a new predictive intention in the system.
   */
  async recordIntention(_db: any, statement: string, confidence: number): Promise<string> {
    const intentions = this.getIntentions();
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newIntention: Intention = {
      id,
      statement,
      confidence,
      manifested: false,
      timestamp: Date.now(),
      start_ms: Date.now()
    };
    intentions.push(newIntention);
    this.saveIntentions(intentions);
    return id;
  }

  /**
   * Marks an intention as manifested, closing the vortex loop with real latency.
   */
  async markManifested(_db: any, intentId: string, proof: string = ""): Promise<number | null> {
    const intentions = this.getIntentions();
    const intention = intentions.find(i => i.id === intentId);

    if (!intention) return null;

    const now = Date.now();
    const latencySeconds = (now - intention.start_ms) / 1000;

    intention.manifested = true;
    intention.manifest_timestamp = now;
    intention.proof = proof;
    intention.latency_seconds = latencySeconds;

    this.saveIntentions(intentions);
    return latencySeconds;
  }

  /**
   * Quantifies the current vortex strength based on real manifestation rates.
   */
  async quantify(_db?: any): Promise<IntentionMetrics> {
    const intentions = this.getIntentions();
    const total = intentions.length;
    const manifested = intentions.filter(i => i.manifested).length;

    const latencies = intentions
      .filter(i => i.manifested && i.latency_seconds !== undefined)
      .map(i => i.latency_seconds!);

    const avgLatency = latencies.length > 0
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : 0;

    // Vortex strength = manifestation rate / average latency (with floor)
    const manifestationRate = total > 0 ? manifested / total : 0;
    const vortexStrength = avgLatency > 0
      ? manifestationRate / Math.max(avgLatency, 1) * 100
      : manifestationRate * 100;

    return {
      total_intentions: total,
      manifested_count: manifested,
      avg_latency: avgLatency,
      vortex_strength: parseFloat(vortexStrength.toFixed(2))
    };
  }

  /**
   * Get all intentions for display.
   */
  getAllIntentions(): Intention[] {
    return this.getIntentions().sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear all intentions.
   */
  clearIntentions() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const vortexEngine = new VortexEngine();
