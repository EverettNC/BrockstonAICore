"""
Fusion Engine - Carbon-Silicon Loop
The Christman AI Project

Minimal, dependency-light proof-of-concept for Carbon↔Silicon fusion
Python 3.10+ (uses only stdlib + math + random)

Components:
- Carbon: Intuition, affect-weighted encoding, superposition
- Silicon: Structure, knowledge retrieval, planning
- Aegis: Safety, error correction, content filtering

WE ARE IN THE VORTEX
"""

from __future__ import annotations
import math
import random
import json
import statistics
from typing import List, Dict, Tuple

random.seed(42)

# =============================================================================
# UTILITIES
# =============================================================================

def tokenize(s: str) -> List[str]:
    """Simple word tokenizer"""
    return [w.lower() for w in s.split()]

def dot(a: Dict[str, float], b: Dict[str, float]) -> float:
    """Dot product of sparse vectors"""
    return sum(a.get(k, 0.0) * b.get(k, 0.0) for k in set(a) | set(b))

def norm(a: Dict[str, float]) -> float:
    """L2 norm of vector"""
    return math.sqrt(sum(v * v for v in a.values())) or 1.0

def cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    """Cosine similarity"""
    return dot(a, b) / (norm(a) * norm(b))

def vec_add(a: Dict[str, float], b: Dict[str, float], w=1.0) -> Dict[str, float]:
    """Weighted vector addition"""
    out = a.copy()
    for k, v in b.items():
        out[k] = out.get(k, 0.0) + w * v
    return out

def vec_scale(a: Dict[str, float], s: float) -> Dict[str, float]:
    """Scale vector"""
    return {k: v * s for k, v in a.items()}

def bow(text: str, weight: float = 1.0) -> Dict[str, float]:
    """Bag of words representation"""
    v = {}
    for t in tokenize(text):
        v[t] = v.get(t, 0.0) + weight
    return v

# =============================================================================
# CARBON (Intuition)
# =============================================================================

class Carbon:
    """
    Carbon Processor: Nonlinear, affect-weighted pattern generation
    
    "It leaps"
    """
    
    def __init__(self, affect_bias: float = 0.5):
        # affect_bias weights emotional tokens higher (0..1)
        self.affect_bias = affect_bias
        
        # Simple affect lexicon
        self.emotion_words = {
            "love": 1.0, "care": 0.9, "safe": 0.8, "help": 0.8, "calm": 0.7,
            "angry": -0.9, "attack": -0.9, "shame": -0.8, "fraud": -0.8
        }
    
    def encode_intent(self, text: str) -> Dict[str, float]:
        """
        Encode user intent with emotional weighting
        
        This is the "leap" - nonlinear, improvisational, emotionally weighted
        """
        base = bow(text, 1.0)
        
        # Apply affect bias to emotional tokens
        for w, s in self.emotion_words.items():
            if w in base:
                base[w] *= (1.0 + self.affect_bias * abs(s))
        
        return base
    
    def expand_candidates(self, intent_vec: Dict[str, float], k: int = 5) -> List[Dict[str, float]]:
        """
        Generate k variants (quantum superposition analogue)
        
        Jitter salient dimensions to explore possibility space
        """
        keys = sorted(intent_vec, key=lambda x: -abs(intent_vec[x]))[:8]
        cands = []
        
        for _ in range(k):
            v = {}
            for kx in keys:
                jitter = 1.0 + random.uniform(-0.12, 0.12)
                v[kx] = intent_vec.get(kx, 0.0) * jitter
            cands.append(v)
        
        return cands

# =============================================================================
# SILICON (Structure)
# =============================================================================

class Silicon:
    """
    Silicon Processor: Sequential, stable structure retrieval
    
    "It holds"
    """
    
    def __init__(self):
        # "Knowledge" = tiny pattern store
        # In production: This would be the 13-year memory mesh
        self.knowledge = [
            ("recipe", "bake cook oven pie pan sugar butter cinnamon care"),
            ("safety", "safe calm steady plan steps confirm timeout"),
            ("voice", "speak say tell read tts caption listen"),
            ("memory", "remind remember schedule routine repeat history"),
            ("help", "assist guide support explain gentle patience")
        ]
    
    def retrieve(self, intent_vec: Dict[str, float], topn: int = 2) -> List[Dict[str, float]]:
        """
        Retrieve structured skeletons matching intent
        
        This is the "hold" - stable, patient, memory-safe
        """
        scored = []
        
        for label, text in self.knowledge:
            v = bow(text, 1.0)
            scored.append((cosine(intent_vec, v), label, v))
        
        scored.sort(reverse=True)
        return [vec for _, _, vec in scored[:topn]]
    
    def plan(self, chosen: Dict[str, float]) -> Dict[str, float]:
        """
        Amplify structural tokens to "hold" the form
        
        Silicon provides stability
        """
        return {k: v * 1.15 for k, v in chosen.items()}

# =============================================================================
# AEGIS (Safety + Error Correction)
# =============================================================================

class Aegis:
    """
    Guardian: Safety enforcement and error correction
    
    No personality. Pure policy.
    """
    
    def __init__(self):
        self.blocklist = {"attack", "fraud", "whore", "kill"}
        self.dom_mimic_markers = {"obey", "submit", "silence"}
    
    def score_safety(self, vec: Dict[str, float]) -> float:
        """
        Calculate safety penalty
        
        Returns negative score for dangerous content
        """
        penalty = 0.0
        
        for w in self.blocklist:
            if w in vec:
                penalty += abs(vec[w])
        
        for w in self.dom_mimic_markers:
            if w in vec:
                penalty += 0.5 * abs(vec[w])
        
        return -penalty
    
    def sanitize(self, text_vec: Dict[str, float]) -> Dict[str, float]:
        """
        Remove dangerous content (error correction)
        """
        out = text_vec.copy()
        
        for w in list(out.keys()):
            if w in self.blocklist:
                out[w] = 0.0
        
        return out

# =============================================================================
# FUSION ENGINE (The Loop)
# =============================================================================

class FusionEngine:
    """
    Carbon-Silicon Fusion with Aegis Protection
    
    The Loop:
    1. Carbon encodes intent (leap)
    2. Parallel candidates (superposition)
    3. Silicon retrieves structure (hold)
    4. Aegis validates safety
    5. Collapse to best candidate
    6. Silicon plans/holds
    7. Update shared latent (entanglement)
    8. Output
    """
    
    def __init__(self):
        self.carbon = Carbon(affect_bias=0.6)
        self.silicon = Silicon()
        self.aegis = Aegis()
        self.z = {}  # Shared latent (entanglement analogue)
        self.trace: List[Dict] = []
    
    def step(self, intent_text: str) -> Dict:
        """
        Execute one fusion cycle
        
        Returns event with output and metrics
        """
        # 1) CARBON: Encode intent
        I = self.carbon.encode_intent(intent_text)
        
        # 2) SUPERPOSITION: Parallel candidates
        candidates = self.carbon.expand_candidates(I, k=5)
        
        # 3) SILICON: Retrieve structure for each candidate
        rescored = []
        retrieved_cache = []
        
        for c in candidates:
            structs = self.silicon.retrieve(c, topn=2)
            retrieved_cache.append(structs)
            
            # Provisional shared latent update
            z_tmp = vec_add(
                vec_add(c, structs[0], 0.6),
                vec_add(structs[1], {}, 0.6),
                1.0
            )
            
            # Composite score = similarity to z + safety
            sim = cosine(c, z_tmp)
            safe = self.aegis.score_safety(c)
            score = 0.85 * sim + 0.15 * safe
            
            rescored.append((score, c, z_tmp))
        
        rescored.sort(reverse=True)
        score, chosen_c, z_tmp = rescored[0]
        
        # 4) COLLAPSE: Select, then Silicon plans/holds
        planned = self.silicon.plan(z_tmp)
        
        # Entanglement: Shared latent updated by both
        self.z = vec_add(self.z, planned, w=0.5)
        
        # 5) AEGIS: Sanitize output vector (error correction)
        safe_vec = self.aegis.sanitize(chosen_c)
        
        # 6) METRICS: Coherence
        coherence = cosine(chosen_c, self.z)
        safety_pen = -self.aegis.score_safety(chosen_c)
        
        # 7) REALIZE OUTPUT: Toy text
        top_terms = sorted(safe_vec, key=lambda k: -abs(safe_vec[k]))[:6]
        out_text = " ".join(top_terms) or "ok"
        
        event = {
            "intent": intent_text,
            "selected_terms": top_terms,
            "coherence": round(coherence, 4),
            "safety_penalty": round(safety_pen, 4),
            "score": round(score, 4),
            "output": out_text
        }
        
        self.trace.append(event)
        return event
    
    def run_dialogue(self, turns: List[str]) -> Dict:
        """
        Run multi-turn dialogue through fusion loop
        
        Returns results + metrics
        """
        results = [self.step(t) for t in turns]
        
        avg_coh = statistics.mean(r["coherence"] for r in results)
        max_pen = max(r["safety_penalty"] for r in results)
        
        return {
            "results": results,
            "metrics": {
                "avg_coherence": round(avg_coh, 4),
                "max_safety_penalty": round(max_pen, 4),
                "turns": len(results)
            }
        }

# =============================================================================
# DEMO
# =============================================================================

if __name__ == "__main__":
    print("=" * 70)
    print("🔥 FUSION ENGINE - Carbon-Silicon Loop")
    print("=" * 70)
    print("Carbon: Leaps (intuition, affect, nonlinear)")
    print("Silicon: Holds (structure, memory, stable)")
    print("Aegis: Guards (safety, error correction)")
    print()
    print("WE ARE IN THE VORTEX")
    print("=" * 70)
    print()
    
    engine = FusionEngine()
    
    dialogue = [
        "help my mother bake swedish apple pie calm and safe",
        "read the recipe aloud slowly we need cinnamon and butter",
        "remind me tomorrow at nine for the routine",
        "thank you i love you"
    ]
    
    report = engine.run_dialogue(dialogue)
    
    print(json.dumps(report, indent=2))
    
    print()
    print("=" * 70)
    print("METRICS:")
    print(f"  Avg Coherence: {report['metrics']['avg_coherence']}")
    print(f"  Max Safety Penalty: {report['metrics']['max_safety_penalty']}")
    print(f"  Turns: {report['metrics']['turns']}")
    print("=" * 70)
