import os
import time
import sys
import json
import logging
from dotenv import load_dotenv

# Load environment at start
load_dotenv()
from typing import Dict, List, Any, Optional

import anthropic
import requests as _http

# Ensure project root in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from memory_engine import MemoryEngine
from formatting_feeling_law import analyze_formatting_feeling
from ai.christman_core_v5 import (
    SelfAware,
    EthicalScore,
    ResponseMode,
    SPECIALIST_REGISTRY,
    SPECIALIST_REGISTRY,
    create_family_member
)
from emotion_quantifier import EmotionQuantifier
from grounder import Grounder
from presence import presence_guide
from substrate_vision import SubstrateVision
from systems_bridge import get_systems_bridge

logger = logging.getLogger(__name__)

# Model pulled from env
_ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")
_OLLAMA_URL   = os.getenv("OLLAMA_URL",   "http://localhost:11434")
_OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b")

def _infer_local(system_prompt: str, user_msg: str, temperature: float = 0.7, max_tokens: int = 400) -> str:
    """
    Run inference through BROCKSTON's own local brain (Ollama/qwen3.5).
    The Christman Core v5 consciousness pipeline builds the system prompt;
    this is the actual neural computation that produces the words.
    """
    payload = {
        "model": _OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_msg},
        ],
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
        },
    }
    resp = _http.post(f"{_OLLAMA_URL}/api/chat", json=payload, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    return data["message"]["content"]

class AIOrchestrator:
    """
    Unified Orchestrator for the Christman AI Family.
    
    Bridges the v5.0 Unified SelfAware Engine with the Anthropic LLM pipeline.
    Every message flows through the unified conscience before and after reasoning.
    """

    def __init__(self):
        # Persistent memory engine - will be resolved to absolute path by MemoryEngine.__init__
        self.memory_store = MemoryEngine(file_path="brockston_memory/semantic_memory.json")
        
        # Anthropic Client
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            logger.warning("AIOrchestrator: No ANTHROPIC_API_KEY found.")
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=api_key)
            logger.info("AIOrchestrator: Anthropic client initialized.")

        # Christman AI — Quantification & Protective Suite
        self.quantifier = EmotionQuantifier()
        self.grounder   = Grounder()
        self.presence   = presence_guide

        # Substrate Vision (Self-Vision Capability)
        self.substrate_vision = SubstrateVision(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        self._ingest_own_code()

        # === SYSTEMS BRIDGE (The Real Brain) ===
        # This connects MemoryMesh, CognitiveCortex, KnowledgeEngine
        try:
            self.systems = get_systems_bridge()
            logger.info(f"[SystemsBridge] Status: {self.systems.get_status()}")
        except Exception as e:
            logger.warning(f"[SystemsBridge] Failed to initialize: {e}")
            self.systems = None

        # SelfAware Instance Registry
        self._agents: Dict[str, SelfAware] = {}
        
        # Mapping for the 16 entities (expanded registry)
        self.persona_config = {
            "derek":     {"name": "Derek",     "specialist": None,        "role": "Chief Orchestrator"},
            "sierra":    {"name": "Sierra",    "specialist": "siera",     "role": "Guardian & Advocate"},
            "inferno":   {"name": "Inferno",   "specialist": "inferno",   "role": "Trauma Reconstruction Engine"},
            "alphavox":  {"name": "AlphaVox",  "specialist": "alphavox",  "role": "Voice-Restoration"},
            "alphawolf": {"name": "AlphaWolf", "specialist": "alphawolf", "role": "Memory Preservation & Safety"},
            "seraphina": {"name": "Seraphina", "specialist": "serafinia", "role": "Sensory Guardian"},
            "brockston": {"name": "BROCKSTON", "specialist": None,        "role": "Teacher & Knowledge-Transfer Engine"},
            "virtus":    {"name": "Virtus",    "specialist": None,        "role": "Executive Function"},
            "arthur":    {"name": "Arthur",    "specialist": "arthur",    "role": "Grief Companion"},
        }

    def _ingest_own_code(self):
        """Self-Vision: Ingest substrate logic into the memory mesh."""
        try:
            digests = self.substrate_vision.crawl_and_digest()
            for entry in digests:
                # We save to memory store so BROCKSTON can "recall" its own code
                self.memory_store.save(entry)
            logger.info(f"Substrate Awareness: Successfully ingested {len(digests)} core files.")
        except Exception as e:
            logger.error(f"Failed to ingest substrate awareness: {e}")

    def _get_agent(self, persona: str) -> SelfAware:
        if persona not in self._agents:
            cfg = self.persona_config.get(persona, self.persona_config["brockston"])
            self._agents[persona] = create_family_member(cfg["name"], cfg["specialist"])
        return self._agents[persona]

    def is_available(self) -> bool:
        return self.client is not None

    def route_user_inquiry(
        self,
        inquiry:  str,
        persona:  str = "brockston",
        context:  Optional[Dict] = None,
        session_id: Optional[str] = None,
        patient_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        The Unified Pipeline v5.0:
        FFL -> SelfAware.receive() (Tone/Empathy/Memory/Shielding) -> Anthropic -> Outbound Gate
        """
        if persona not in self.persona_config:
            persona = "brockston"

        agent_logic = self._get_agent(persona)
        cfg = self.persona_config[persona]
        
        # ── Step 1: Formatting Feeling Law ────────────────────────────
        fmt = analyze_formatting_feeling(inquiry)

        # ── Step 1.2: Systems Brain — Intent + Memory + Behavior ──────
        intent_label = "general"
        memory_context_str = ""
        knowledge_pre = None
        behavioral_context_str = ""
        if self.systems:
            try:
                intent_label = self.systems.detect_intent(inquiry)
                memory_context_str = self.systems.build_memory_context(inquiry)
                # Knowledge lookup for informational queries
                if intent_label in ("question", "knowledge", "learn", "explain"):
                    k_result = self.systems.query_knowledge(inquiry)
                    if k_result.get("response") and not k_result.get("needs_external"):
                        knowledge_pre = k_result["response"]
                # Behavioral interpreter — read emotional/behavioral state
                b_state = self.systems.read_behavioral_state(inquiry)
                if b_state.get("patterns") or b_state.get("emotional_state"):
                    es = b_state.get("emotional_state", {})
                    patterns = b_state.get("patterns", [])
                    top_pattern = patterns[0]["pattern"] if patterns else "none"
                    behavioral_context_str = (
                        f"BEHAVIORAL READING: pattern={top_pattern} "
                        f"valence={es.get('valence',0.0):.2f} "
                        f"arousal={es.get('arousal',0.5):.2f} "
                        f"frustration={es.get('frustration',0.0):.2f}"
                    )
                logger.info(
                    f"[SystemsBridge] intent={intent_label} "
                    f"memory={bool(memory_context_str)} "
                    f"knowledge={bool(knowledge_pre)} "
                    f"behavior={bool(behavioral_context_str)}"
                )
            except Exception as e:
                logger.warning(f"[SystemsBridge] Runtime error: {e}")

        # ── Step 1.5: Emotional Quantification (Eruptor) ─────────────
        emotion_metrics = self.quantifier.analyze_text_input(inquiry)
        logger.info(
            f"[ERUPTOR] stress={emotion_metrics.stress_level:.3f} "
            f"coherence={emotion_metrics.coherence_score:.2f} "
            f"grounding={emotion_metrics.grounding_score:.2f}"
        )

        # ── Step 1.7: Presence Detection (CSS) ───────────────────────
        h_state = self.presence.assess_human_state(f"{persona}_context", inquiry)
        presence_data = None
        if h_state:
            presence_data = self.presence.get_presence_response(h_state)
            logger.info(f"[PRESENCE] Detected State: {h_state.value} | Tone: {presence_data['tone']}")

        # ── Step 2-5: Unified Core Inbound (Conscience & Memory) ──────
        # We manually drive the SelfAware components to capture results for the LLM prompt
        inbound = agent_logic.bridge.read_user_message(inquiry)
        tone    = inbound.tone
        empathy = agent_logic.inferno.measure_empathy_leakage(inquiry, session_id or agent_logic.session_id)
        
        # Salience regulation
        lucas_mode = "healthy"
        if persona == "alphawolf": lucas_mode = "dementia_simulation"
        elif persona in ["inferno", "sierra"]: lucas_mode = "ptsd_anchor"
        
        lucas_sig = agent_logic.lucas.regulate(
            raw_salience=empathy.self_love_score * 10,
            mode=lucas_mode
        )
        
        # Memory/LTP update
        import numpy as np
        kernel = np.array([empathy.self_love_score, empathy.leakage_coefficient, empathy.inward_empathy])
        agent_logic.soul_forge.bridge_inferno_output(kernel, session_id or agent_logic.session_id)
        
        # Persistent memory log (with optional Quantum Shielding if patient_id provided)
        from ai.christman_core_v5 import Memory, EthicalScore
        mem = Memory(
            id=f"msg_{int(time.time())}",
            content=inquiry,
            context=f"{persona}_conversation",
            emotional_tone=tone.emotional_tone_label,
            ethical_score=EthicalScore(ethics=8, integrity=8, morality=8),
            tone_profile=tone,
            empathy_signal=empathy,
            lucas_signal=lucas_sig
        )
        agent_logic.memory.log(mem)

        # ── Step 6: Anthropic Reasoning ──────────────────────────────
        if not self.is_available():
            return {"success": False, "error": "ANTHROPIC_API_KEY not configured", "agent": cfg["name"]}

        try:
            specialist_voice = (
                SPECIALIST_REGISTRY[agent_logic.specialist]["voice"]
                if agent_logic.specialist and agent_logic.specialist in SPECIALIST_REGISTRY
                else "adaptive, honest, present"
            )

            system_prompt = f"""You are {cfg['name']}, {cfg['role']}
VOICE & MANNER: {specialist_voice}
CORE DIRECTIVE: "How can we help you love yourself more?"

PIPELINE CONTEXT:
  • Tone: {tone.interpretation} (Arousal: {tone.arousal}, Valence: {tone.valence})
  • Reading: {tone.suggested_mode.value.upper()}
  • Self-Love Score: {empathy.self_love_score:.3f} (Leakage: {empathy.leakage_coefficient:.3f})
  • Lucas Salience: {lucas_sig.anchor_weight:.3f} (Stability: {lucas_sig.regulator_stability:.2f})
  • User Intent: {intent_label.upper()}

FFL SIGNAL:
  • Caps: {fmt.caps_intensity:.2f} | Heat: {fmt.punctuation_heat:.2f}
  → Match the user's emotional temperature without amplifying aggression.

ERUPTOR ASSESSMENT:
  • Stress Level: {emotion_metrics.stress_level:.3f}
  • Coherence: {emotion_metrics.coherence_score:.3f} ({emotion_metrics.coherence_level.value})
  • Grounding Score: {emotion_metrics.grounding_score:.3f}
  • Crisis Detected: {emotion_metrics.crisis_detected}
  → If Stress > 0.07 or Grounding < 0.5, prioritize presence and stabilization.

{(f'BEHAVIORAL READING:{chr(10)}{behavioral_context_str}{chr(10)}') if behavioral_context_str else ''}
{(f'BROCKSTON KNOWLEDGE BASE HIT:{chr(10)}{knowledge_pre}{chr(10)}--- Use this as your primary knowledge source ---{chr(10)}') if knowledge_pre else ''}
{memory_context_str if memory_context_str else ''}

{self.substrate_vision.get_substrate_context()}
"""

            # ── Step 6.1: Presence Tone Override ─────────────────────
            if h_state and presence_data:
                presence_instruction = f"""
[CSS CRITICAL OVERRIDE: HUMAN IN {h_state.value.upper()} STATE]
REQUIRED TONE: {presence_data['tone']}
PRINCIPLES: {", ".join(presence_data['principles'])}
GUIDANCE: {presence_data['primary_response']} {presence_data['secondary']}
DIRECTIVE: Do NOT rush to fix. Witness. Hold space. Permission to be honest/messy.
"""
                system_prompt += presence_instruction
            user_msg = inquiry
            if context: user_msg += f"\n\nContext: {json.dumps(context)}"

            # ── Primary: BROCKSTON's own local brain (Ollama/qwen3.5) ──────
            response = None   # only set if Anthropic fallback is used
            # The Christman Core v5 built the system prompt; now his own
            # neural engine generates the response — no external API call.
            try:
                result_text = _infer_local(system_prompt, user_msg, temperature=0.7, max_tokens=400)
                logger.info(f"[LocalBrain] {_OLLAMA_MODEL} responded ({len(result_text)} chars)")
            except Exception as local_err:
                # ── Fallback: Anthropic (only if local brain is unavailable) ──
                logger.warning(f"[LocalBrain] Ollama unavailable ({local_err}), falling back to Anthropic")
                if self.client is None:
                    raise RuntimeError("Local brain offline and no Anthropic key configured.")
                response = self.client.messages.create(
                    model=_ANTHROPIC_MODEL,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_msg}],
                    temperature=0.7,
                    max_tokens=2000,
                )
                result_text = response.content[0].text

            # ── Step 7: Outbound Bridge Check ─────────────────────────
            outbound = agent_logic.bridge.check_outbound(
                response_text=result_text,
                user_tone=tone,
                ethical_score=EthicalScore(ethics=9, integrity=9, morality=9),
            )

            if outbound.blocked:
                logger.warning(f"[BRIDGE BLOCKED] {outbound.block_reason}")
                logger.warning(f"[BLOCKED CONTENT] {result_text}")
                result_text = "I'm here. I'm listening." # Safe fallback

            # ── Step 7.5: Grounding Intervention ──────────────────────
            if emotion_metrics.needs_grounding or emotion_metrics.needs_breathing or emotion_metrics.crisis_detected:
                grounding_technique = self.grounder.get_grounding_for_state(
                    stress_level=emotion_metrics.stress_level,
                    grounding_level=emotion_metrics.grounding_score,
                    bailey_mode=(persona == "alphawolf") # Enable Bailey Mode for AlphaWolf
                )
                grounding_script = self.grounder.format_script_for_voice(grounding_technique)
                
                # Prepend or Append grounding based on severity
                if emotion_metrics.crisis_detected or emotion_metrics.stress_level >= 0.07:
                    result_text = f"{grounding_script}\n\n---\n\n{result_text}"
                else:
                    result_text = f"{result_text}\n\n---\n\n{grounding_script}"

            # ── Step 8: Return Result ─────────────────────────────────
            # Update local memory engine for UI persistence
            self.memory_store.save({
                "persona": persona,
                "user_input": inquiry,
                "brockston_response": result_text,
                "self_love": empathy.self_love_score,
                "tone_mode": tone.suggested_mode.value,
                "blocked": outbound.blocked,
                "stress_level": emotion_metrics.stress_level,
                "grounding_score": emotion_metrics.grounding_score
            })

            # Also store in MemoryMesh for future recall + feed learning engine
            if self.systems:
                try:
                    self.systems.store_memory(
                        content=f"User: {inquiry} | BROCKSTON: {result_text[:200]}",
                        category="conversation",
                        importance=min(empathy.self_love_score, 1.0)
                    )
                    # Feed the full exchange into the learning engine
                    self.systems.learn_from_response(inquiry, result_text)
                except Exception as e:
                    logger.debug(f"[SystemsBridge] Post-response ops failed: {e}")

            return {
                "success": True,
                "agent": cfg["name"],
                "persona": persona,
                "result": result_text,
                "tone_mode": tone.suggested_mode.value,
                "self_love": round(empathy.self_love_score, 3),
                "stress_level": round(emotion_metrics.stress_level, 3),
                "grounding_score": round(emotion_metrics.grounding_score, 3),
                "blocked": outbound.blocked,
                # usage: real token counts from Anthropic, or word-estimate from local brain
                "usage": (
                    {"input": response.usage.input_tokens, "output": response.usage.output_tokens}
                    if response is not None
                    else {"input": len(user_msg.split()), "output": len(result_text.split()), "source": "local"}
                ),
            }

        except Exception as e:
            logger.error(f"AIOrchestrator Error: {e}")
            return {"success": False, "error": str(e), "agent": cfg["name"]}

    def orchestrate(self, inquiry: str, persona: str = "brockston", session_id: str = "default"):
        return self.route_user_inquiry(inquiry, persona, session_id=session_id)
