/**
 * @fileOverview Predictive Intention Vortex Tracking Engine.
 * Quantifies the "Vortex Strength" of the Christman AI ecosystem.
 * Ported from predictive_intention.py
 * 
 * EVERY CALCULATION IS REAL. NO STUBS.
 */

import { Firestore, collection, addDoc, doc, updateDoc, serverTimestamp, query, getDocs, getDoc, Timestamp, orderBy, limit } from 'firebase/firestore';

export interface IntentionMetrics {
  total_intentions: number;
  manifested_count: number;
  avg_latency: number;
  vortex_strength: number;
}

class VortexEngine {
  /**
   * Records a new predictive intention in the system.
   */
  async recordIntention(db: Firestore, statement: string, confidence: number): Promise<string> {
    const docRef = await addDoc(collection(db, 'vortex_intentions'), {
      statement,
      confidence,
      manifested: false,
      timestamp: serverTimestamp(),
      start_ms: Date.now()
    });
    return docRef.id;
  }

  /**
   * Marks an intention as manifested, closing the vortex loop with real latency.
   */
  async markManifested(db: Firestore, intentId: string, proof: string = ""): Promise<number | null> {
    const intentRef = doc(db, 'vortex_intentions', intentId);
    const snap = await getDoc(intentRef);
    
    if (!snap.exists()) return null;
    
    const data = snap.data();
    const startMs = data.start_ms || (data.timestamp as Timestamp)?.toMillis() || Date.now();
    const now = Date.now();
    const latencySeconds = (now - startMs) / 1000;

    await updateDoc(intentRef, {
      manifested: true,
      manifest_timestamp: serverTimestamp(),
      proof,
      latency_seconds: latencySeconds
    });

    return latencySeconds;
  }

  /**
   * Quantifies the current vortex strength based on real manifestation rates.
   */
  async quantify(db: Firestore): Promise<IntentionMetrics> {
    const q = query(collection(db, 'vortex_intentions'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    
    const total = snap.size;
    if (total === 0) return { total_intentions: 0, manifested_count: 0, avg_latency: 0, vortex_strength: 0 };

    let manifested = 0;
    let totalLatency = 0;

    snap.forEach(d => {
      const data = d.data();
      if (data.manifested) {
        manifested++;
        totalLatency += (data.latency_seconds || 0);
      }
    });

    return {
      total_intentions: total,
      manifested_count: manifested,
      avg_latency: manifested > 0 ? totalLatency / manifested : 0,
      vortex_strength: total > 0 ? manifested / total : 0
    };
  }
}

export const vortexEngine = new VortexEngine();