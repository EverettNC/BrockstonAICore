"""
Eruptor Emotion Quantifier
Quantifies emotional tone, stress, and coherence without pretending to "feel."

Integrates with:
- Unity (emotional core)
- Firefighter Capital Safety
- Memory Mesh (1,200+ hours of context)

This gives Eruptor "feel without pretending" - it measures, it doesn't empathize falsely.
"""

from dataclasses import dataclass
from typing import Dict, Optional, List, Tuple
from datetime import datetime
from enum import Enum


class EmotionalTone(Enum):
    """Quantified emotional tones"""
    CALM = "calm"
    ANXIOUS = "anxious"
    DISTRESSED = "distressed"
    AGITATED = "agitated"
    FLAT = "flat"          # Emotional flatness / numbness
    CONFUSED = "confused"
    FEARFUL = "fearful"


class CoherenceLevel(Enum):
    """Speech/thought coherence levels"""
    COHERENT = "coherent"
    SLIGHTLY_SCATTERED = "slightly_scattered"
    CONFUSED = "confused"
    DISORGANIZED = "disorganized"
    INCOHERENT = "incoherent"


@dataclass
class EmotionalMetrics:
    """
    Quantified emotional state at a point in time.
    These are MEASUREMENTS, not feelings.
    """
    # Core metrics (0.0 - 1.0 scale)
    stress_level: float = 0.0        # Maps to safety thresholds (0.07+ = breathing mode)
    coherence_score: float = 1.0     # 1.0 = fully coherent, 0.0 = incoherent
    grounding_score: float = 1.0     # 1.0 = fully grounded, 0.0 = dissociated

    # Categorical assessments
    emotional_tone: EmotionalTone = EmotionalTone.CALM
    coherence_level: CoherenceLevel = CoherenceLevel.COHERENT

    # Derived flags
    crisis_detected: bool = False
    needs_grounding: bool = False
    needs_breathing: bool = False

    # Temporal
    timestamp: datetime = None

    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()


class EmotionQuantifier:
    """
    Quantifies emotional state from user input and system data.

    This is the integration point for Unity, Firefighter, and Memory Mesh.
    """

    def __init__(self):
        self.baseline_stress = 0.03  # User's baseline stress level
        self.baseline_coherence = 0.9  # User's baseline coherence

        # Integration hooks (to be connected to actual systems)
        self.unity_bridge = None
        self.firefighter_bridge = None
        self.memory_mesh_bridge = None

    # ========================================================================
    # TEXT ANALYSIS (Simple NLP-based quantification)
    # ========================================================================

    def analyze_text_input(self, text: str) -> EmotionalMetrics:
        """
        Analyze user text input to quantify emotional state.

        This is a basic implementation - in production, this would integrate
        with Unity's emotional processing and more sophisticated NLP.

        Args:
            text: User's text input

        Returns:
            EmotionalMetrics with quantified state
        """
        text_lower = text.lower()

        # Stress indicators
        stress_score = self._calculate_stress_score(text_lower)

        # Coherence assessment
        coherence_score, coherence_level = self._assess_coherence(text)

        # Emotional tone classification
        emotional_tone = self._classify_emotional_tone(text_lower, stress_score)

        # Grounding score (inverse of stress + coherence factor)
        grounding_score = max(0.0, 1.0 - (stress_score * 0.7 + (1.0 - coherence_score) * 0.3))

        # Flags
        crisis_detected = self._detect_crisis_markers(text_lower)
        needs_breathing = stress_score >= 0.07
        needs_grounding = grounding_score < 0.5

        return EmotionalMetrics(
            stress_level=stress_score,
            coherence_score=coherence_score,
            grounding_score=grounding_score,
            emotional_tone=emotional_tone,
            coherence_level=coherence_level,
            crisis_detected=crisis_detected,
            needs_grounding=needs_grounding,
            needs_breathing=needs_breathing
        )

    def _calculate_stress_score(self, text: str) -> float:
        """
        Calculate stress level from text markers.
        Returns 0.0-1.0 scale.
        """
        stress_markers = {
            # High stress (0.08-0.15 contribution each)
            "can't breathe": 0.15,
            "help me": 0.10,
            "scared": 0.08,
            "terrified": 0.12,
            "panicking": 0.15,
            "can't think": 0.10,

            # Medium stress (0.04-0.07)
            "anxious": 0.05,
            "worried": 0.04,
            "nervous": 0.04,
            "uncomfortable": 0.04,
            "overwhelmed": 0.07,

            # Crisis markers (0.20+)
            "hurt myself": 0.25,
            "end it": 0.25,
            "can't do this": 0.15
        }

        score = self.baseline_stress  # Start from baseline

        for marker, weight in stress_markers.items():
            if marker in text:
                score += weight

        # Repetition increases stress (e.g., "help help help")
        words = text.split()
        if len(words) > 0:
            word_counts = {}
            for word in words:
                word_counts[word] = word_counts.get(word, 0) + 1

            for word, count in word_counts.items():
                if count >= 3:  # Same word repeated 3+ times
                    score += 0.05

        # Caps lock = elevated stress
        if text.isupper() and len(text) > 10:
            score += 0.05

        # Exclamation marks
        exclamation_count = text.count('!')
        if exclamation_count > 2:
            score += min(0.10, exclamation_count * 0.02)

        return min(1.0, score)  # Cap at 1.0

    def _assess_coherence(self, text: str) -> Tuple[float, CoherenceLevel]:
        """
        Assess coherence of text.

        Returns:
            (coherence_score, coherence_level)
        """
        # Simple heuristics (production would use more sophisticated NLP)

        # Very short input is hard to assess
        if len(text.strip()) < 5:
            return 0.8, CoherenceLevel.COHERENT

        words = text.split()
        sentences = text.split('.')

        # Check for disorganization markers
        disorganization_score = 0.0

        # Incomplete words/fragments
        incomplete_words = [w for w in words if len(w) <= 2 and w.isalpha()]
        if len(incomplete_words) > len(words) * 0.3:
            disorganization_score += 0.3

        # Lack of sentence structure
        if len(text) > 50 and len(sentences) <= 1:
            disorganization_score += 0.2

        # Jumping between topics (very basic check)
        # Production: would use semantic similarity
        if "wait" in text.lower() and "no" in text.lower():
            disorganization_score += 0.1

        # Calculate coherence score
        coherence_score = max(0.0, self.baseline_coherence - disorganization_score)

        # Classify level
        if coherence_score >= 0.8:
            level = CoherenceLevel.COHERENT
        elif coherence_score >= 0.6:
            level = CoherenceLevel.SLIGHTLY_SCATTERED
        elif coherence_score >= 0.4:
            level = CoherenceLevel.CONFUSED
        elif coherence_score >= 0.2:
            level = CoherenceLevel.DISORGANIZED
        else:
            level = CoherenceLevel.INCOHERENT

        return coherence_score, level

    def _classify_emotional_tone(self, text: str, stress_score: float) -> EmotionalTone:
        """Classify overall emotional tone"""

        # Check for specific emotional markers
        if any(word in text for word in ["calm", "okay", "fine", "good"]):
            return EmotionalTone.CALM

        if any(word in text for word in ["scared", "terrified", "afraid", "fear"]):
            return EmotionalTone.FEARFUL

        if any(word in text for word in ["confused", "don't understand", "what's happening"]):
            return EmotionalTone.CONFUSED

        if any(word in text for word in ["nothing", "numb", "empty", "don't feel"]):
            return EmotionalTone.FLAT

        if any(word in text for word in ["can't sit", "restless", "pacing", "racing"]):
            return EmotionalTone.AGITATED

        # Fall back to stress-based classification
        if stress_score >= 0.10:
            return EmotionalTone.DISTRESSED
        elif stress_score >= 0.05:
            return EmotionalTone.ANXIOUS
        else:
            return EmotionalTone.CALM

    def _detect_crisis_markers(self, text: str) -> bool:
        """Detect crisis language"""
        crisis_phrases = [
            "hurt myself", "kill myself", "end my life",
            "hurt someone", "not safe", "can't keep safe",
            "better off dead", "end it all"
        ]

        return any(phrase in text for phrase in crisis_phrases)

    # ========================================================================
    # INTEGRATION POINTS (Unity, Firefighter, Memory Mesh)
    # ========================================================================

    def get_unity_emotional_context(self) -> Dict:
        """
        Fetch emotional context from Unity.

        NOTE: This is a placeholder - actual implementation would connect
        to Unity's emotional core.

        Returns:
            Dict with Unity's emotional analysis
        """
        if self.unity_bridge:
            return self.unity_bridge.get_emotional_state()

        # Placeholder return
        return {
            "emotional_depth": 0.5,
            "empathy_level": 0.7,
            "connection_quality": 0.6
        }

    def get_firefighter_safety_assessment(self) -> Dict:
        """
        Get safety assessment from Firefighter Capital Safety.

        NOTE: Placeholder - would connect to Firefighter system.

        Returns:
            Dict with safety assessment
        """
        if self.firefighter_bridge:
            return self.firefighter_bridge.get_safety_assessment()

        # Placeholder
        return {
            "safety_level": "safe",
            "risk_score": 0.1,
            "escalation_recommended": False
        }

    def get_memory_mesh_context(self, query: str = None) -> Dict:
        """
        Fetch relevant context from Memory Mesh (1,200+ hours).

        NOTE: Placeholder - would connect to memory mesh.

        Args:
            query: Optional query to retrieve specific memories

        Returns:
            Dict with relevant memory context
        """
        if self.memory_mesh_bridge:
            return self.memory_mesh_bridge.query(query)

        # Placeholder
        return {
            "relevant_memories": [],
            "emotional_patterns": {},
            "grounding_history": {}
        }

    # ========================================================================
    # COMPOSITE ANALYSIS
    # ========================================================================

    def get_comprehensive_assessment(self, text: str) -> Dict:
        """
        Comprehensive emotional assessment combining all sources.

        Integrates:
        - Text analysis
        - Unity emotional context
        - Firefighter safety assessment
        - Memory mesh patterns

        Returns:
            Dict with full assessment
        """
        # Text analysis
        text_metrics = self.analyze_text_input(text)

        # Integration data
        unity_context = self.get_unity_emotional_context()
        safety_assessment = self.get_firefighter_safety_assessment()
        memory_context = self.get_memory_mesh_context(text)

        # Combine into comprehensive view
        return {
            "metrics": {
                "stress_level": text_metrics.stress_level,
                "coherence_score": text_metrics.coherence_score,
                "grounding_score": text_metrics.grounding_score,
                "emotional_tone": text_metrics.emotional_tone.value,
                "coherence_level": text_metrics.coherence_level.value
            },
            "flags": {
                "crisis_detected": text_metrics.crisis_detected,
                "needs_breathing": text_metrics.needs_breathing,
                "needs_grounding": text_metrics.needs_grounding
            },
            "unity_context": unity_context,
            "safety_assessment": safety_assessment,
            "memory_context": memory_context,
            "timestamp": text_metrics.timestamp.isoformat()
        }

    def update_baseline(self, stress: float = None, coherence: float = None):
        """
        Update user's baseline metrics.
        Called after periods of stability to recalibrate.
        """
        if stress is not None:
            self.baseline_stress = max(0.0, min(0.1, stress))
        if coherence is not None:
            self.baseline_coherence = max(0.5, min(1.0, coherence))
