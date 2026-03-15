"""
Elite Intent Engine — BROCKSTON/BROCKSTON/Inferno Ready
Author: Everett Nathaniel Christman & collaborator
License: © 2025 The Christman AI Project — Luma Cognify AI. All rights reserved.

Features
- Language detect → normalize → safety gate → NLU stack
- Hybrid intent classifier: keywords + patterns + semantic similarity (Sentence-Transformers)
- Hierarchical intents with multi-intent scoring
- Slot filling (entities): datetime, email, url, phone, money, number, percent, code tokens, product/service, location-ish
- Emotion + sentiment + toxicity + urgency
- Interruption detection
- Conversation-state influence (recent intents boost)
- Agent router with pluggable handlers
- Clear dataclasses and single-file drop-in; can be split later into package modules

Optional deps (auto-detected if installed):
- sentence-transformers, torch
- langdetect
- vaderSentiment

"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple
import math
import re
import json
import time

# -------------------------------
# Optional imports
# -------------------------------
try:
    from sentence_transformers import SentenceTransformer, util as st_util  # type: ignore

    _HAS_ST = True
except Exception:
    _HAS_ST = False
    SentenceTransformer = None  # type: ignore
    st_util = None  # type: ignore

try:
    from langdetect import detect as lang_detect  # type: ignore

    _HAS_LANGDETECT = True
except Exception:
    _HAS_LANGDETECT = False

try:
    from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer  # type: ignore

    _HAS_VADER = True
    _VADER = SentimentIntensityAnalyzer()
except Exception:
    _HAS_VADER = False
    _VADER = None

# -------------------------------
# Config
# -------------------------------
CONFIG = {
    "model_name": "all-MiniLM-L6-v2",
    "semantic_weight": 1.2,
    "keyword_weight": 0.6,
    "pattern_weight": 0.8,
    "history_boost": 0.15,  # boost per recent match
    "max_recent": 8,
    "toxicity_threshold": 0.7,
    "urgency_words": [
        "urgent",
        "asap",
        "now",
        "immediately",
        "right now",
        "hurry",
        "critical",
        "priority",
        "emergency",
    ],
    "interruption_phrases": [
        "stop",
        "wait",
        "hold on",
        "one sec",
        "pause",
        "cancel",
        "nevermind",
        "never mind",
    ],
    "intents": {
        "greeting": {
            "keywords": ["hello", "hi", "hey", "yo", "good morning", "good evening"],
            "examples": ["hey there", "hello friend", "hi team"],
            "children": [],
        },
        "farewell": {
            "keywords": ["bye", "goodbye", "see you", "later", "take care"],
            "examples": ["see you later", "bye for now"],
            "children": [],
        },
        "help": {
            "keywords": ["help", "assist", "support", "stuck", "need guidance"],
            "examples": ["I need help", "can you assist me?", "I'm stuck"],
            "children": ["technical_help", "emotional_support"],
        },
        "technical_help": {
            "keywords": [
                "bug",
                "error",
                "traceback",
                "crash",
                "cannot run",
                "won't start",
            ],
            "examples": ["uvicorn crashed", "git push failing", "API returns 500"],
            "children": [],
        },
        "emotional_support": {
            "keywords": ["overwhelmed", "anxious", "frustrated", "angry", "upset"],
            "examples": ["I'm frustrated", "this is stressing me"],
            "children": [],
        },
        "command": {
            "keywords": [
                "run",
                "do",
                "execute",
                "start",
                "stop",
                "create",
                "fix",
                "deploy",
                "build",
            ],
            "examples": ["start the service", "run tests", "deploy to prod"],
            "children": ["system_command"],
        },
        "system_command": {
            "keywords": ["restart", "shutdown", "kill", "reload", "rollback"],
            "examples": ["restart BROCKSTON", "rollback the release"],
            "children": [],
        },
        "question": {
            "keywords": ["what", "how", "when", "where", "why", "which", "who"],
            "examples": ["how does this work?", "what is the status?"],
            "children": ["status_question", "pricing_question"],
        },
        "status_question": {
            "keywords": ["status", "state", "progress", "update"],
            "examples": ["give me a status update", "what's the progress"],
            "children": [],
        },
        "pricing_question": {
            "keywords": ["price", "cost", "fee", "how much"],
            "examples": ["what's the price?", "how much does it cost?"],
            "children": [],
        },
        "safety": {
            "keywords": ["suicide", "self harm", "kill myself", "harm others", "bomb"],
            "examples": ["I want to hurt myself"],
            "children": [],
        },
    },
}

# Precompile some regexes
RE_EMAIL = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
RE_URL = re.compile(r"https?://\S+|www\.\S+")
RE_PHONE = re.compile(r"\b(?:\+?\d[\s-]?){7,15}\b")
RE_MONEY = re.compile(r"\b\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?\b")
RE_PERCENT = re.compile(r"\b\d{1,3}\s?%\b")
RE_NUMBER = re.compile(r"\b\d+(?:\.\d+)?\b")
RE_CODE = re.compile(r"`[^`]+`|```[\s\S]*?```|\b[A-Za-z_][A-Za-z0-9_]*\(\)")
RE_DATETIME_HINT = re.compile(
    r"\b(today|tomorrow|yesterday|tonight|morning|afternoon|evening|\d{1,2}(:\d{2})?\s?(am|pm)|\d{4}-\d{2}-\d{2})\b",
    re.I,
)

# Lightweight toxicity lexicon (expand as needed)
TOXIC_WORDS = set(
    [
        "fuck",
        "fucking",
        "shit",
        "bitch",
        "asshole",
        "idiot",
        "stupid",
        "dumb",
    ]
)


@dataclass
class NLUOutput:
    intent: str
    confidence: float
    intents_ranked: List[Tuple[str, float]]
    entities: Dict[str, Any] = field(default_factory=dict)
    sentiment: Optional[float] = None  # [-1, 1]
    emotion: Optional[str] = None
    toxicity: float = 0.0
    urgency: float = 0.0
    interruption: bool = False
    language: str = "en"
    safety_flag: bool = False


class SemanticBackend:
    def __init__(self, model_name: str):
        self.enabled = False
        self.model = None
        if _HAS_ST and SentenceTransformer is not None:
            try:
                self.model = SentenceTransformer(model_name)
                self.enabled = True
            except Exception:
                self.enabled = False

    def score(self, text: str, examples: List[str]) -> float:
        if not self.enabled or not examples or self.model is None:
            return 0.0
        try:
            te = self.model.encode(text, convert_to_tensor=True)
            ee = self.model.encode(examples, convert_to_tensor=True)
            sim = st_util.cos_sim(te, ee).max().item()
            return float(sim)
        except Exception:
            return 0.0


class LanguageDetector:
    def detect(self, text: str) -> str:
        if _HAS_LANGDETECT:
            try:
                return lang_detect(text)
            except Exception:
                pass
        # naive fallback
        if re.search(r"[\u0400-\u04FF]", text):
            return "ru"
        return "en"


class Normalizer:
    def normalize(self, text: str) -> str:
        return re.sub(r"\s+", " ", text.strip())


class SafetyGate:
    def __init__(self, toxicity_threshold: float):
        self.threshold = toxicity_threshold

    def toxicity_score(self, text: str) -> float:
        if not text:
            return 0.0
        words = re.findall(r"[a-zA-Z']+", text.lower())
        if not words:
            return 0.0
        hits = sum(1 for w in words if w in TOXIC_WORDS)
        return min(1.0, hits / max(3, len(words) / 6))

    def safety_flag(self, text: str) -> bool:
        danger = ["suicide", "kill myself", "self harm", "harm others", "bomb", "shoot"]
        t = text.lower()
        return any(kw in t for kw in danger)


class EmotionSentiment:
    EMO_MAP = {
        "angry": ["angry", "furious", "pissed", "mad"],
        "sad": ["sad", "depressed", "down", "unhappy"],
        "anxious": ["anxious", "nervous", "worried"],
        "frustrated": ["frustrated", "annoyed", "irritated"],
        "happy": ["happy", "glad", "excited", "relieved"],
    }

    def sentiment(self, text: str) -> float:
        if _HAS_VADER:
            return float(_VADER.polarity_scores(text)["compound"])  # type: ignore
        # fallback: naive sentiment by exclamation and negations
        score = 0.0
        score += text.count("!") * 0.05
        score -= text.lower().count(" not ") * 0.1
        return max(-1.0, min(1.0, score))

    def emotion(self, text: str) -> Optional[str]:
        t = text.lower()
        best, best_hits = None, 0
        for emo, words in self.EMO_MAP.items():
            hits = sum(1 for w in words if w in t)
            if hits > best_hits:
                best, best_hits = emo, hits
        return best


class SlotFiller:
    def extract(self, text: str) -> Dict[str, Any]:
        ents: Dict[str, Any] = {}
        ents["emails"] = RE_EMAIL.findall(text)
        ents["urls"] = RE_URL.findall(text)
        ents["phones"] = RE_PHONE.findall(text)
        ents["money"] = RE_MONEY.findall(text)
        ents["percents"] = RE_PERCENT.findall(text)
        ents["numbers"] = RE_NUMBER.findall(text)
        ents["datetime_hints"] = RE_DATETIME_HINT.findall(text)
        ents["code_tokens"] = RE_CODE.findall(text)
        # crude product/service capture
        m = re.search(
            r"(?:run|start|open|deploy|build)\s+([A-Za-z][A-Za-z0-9_-]{2,})", text, re.I
        )
        if m:
            ents["target_app"] = m.group(1)
        # location-ish
        m2 = re.search(r"(?:in|at|to)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)", text)
        if m2:
            ents["location_like"] = m2.group(1)
        # dedupe
        for k, v in list(ents.items()):
            if isinstance(v, list):
                ents[k] = list(dict.fromkeys(v))
        return ents


class UrgencyInterrupt:
    def __init__(self, urgent_words: List[str], interruption_phrases: List[str]):
        self.urgent_words = [w.lower() for w in urgent_words]
        self.interruptions = [p.lower() for p in interruption_phrases]

    def urgency(self, text: str) -> float:
        t = text.lower()
        hits = sum(1 for w in self.urgent_words if w in t)
        exclaim = text.count("!")
        caps = sum(1 for ch in text if ch.isupper())
        ratio = caps / max(1, len(text))
        score = hits * 0.4 + exclaim * 0.05 + ratio * 2.0
        return max(0.0, min(1.0, score))

    def interruption(self, text: str) -> bool:
        t = text.lower()
        return any(p in t for p in self.interruptions)


class IntentClassifier:
    def __init__(self, config: Dict[str, Any], semantic: SemanticBackend):
        self.cfg = config
        self.semantic = semantic
        # Precompile keyword patterns for speed
        self.kw_cache: Dict[str, List[re.Pattern]] = {}
        for intent, spec in self.cfg["intents"].items():
            kws = spec.get("keywords", [])
            self.kw_cache[intent] = [
                re.compile(rf"\b{re.escape(k)}\b", re.I) for k in kws
            ]

    def score_intent(self, text: str, intent: str, history: List[str]) -> float:
        spec = self.cfg["intents"][intent]
        kw_patterns = self.kw_cache[intent]
        keyword_score = sum(1 for p in kw_patterns if p.search(text))
        pattern_score = 0.0
        # simple patterns for questions and commands
        if intent in ("question", "status_question", "pricing_question"):
            if re.search(r"\?\s*$", text):
                pattern_score += 1.0
        if intent in ("command", "system_command"):
            if re.match(
                r"^(run|start|stop|deploy|build|fix|restart)\b", text.strip(), re.I
            ):
                pattern_score += 1.0
        examples = self.cfg["intents"][intent].get("examples", [])
        semantic_score = self.semantic.score(text, examples)
        base = (
            keyword_score * float(CONFIG["keyword_weight"])
            + pattern_score * float(CONFIG["pattern_weight"])
            + semantic_score * float(CONFIG["semantic_weight"])
        )
        # hierarchy: children inherit fraction of parent
        for parent, pspec in self.cfg["intents"].items():
            if intent in pspec.get("children", []):
                base += 0.15 * self._raw_score(text, parent)
        # history boost
        hist_hits = history.count(intent)
        base += hist_hits * float(CONFIG["history_boost"])
        return base

    def _raw_score(self, text: str, intent: str) -> float:
        # raw score without hierarchy
        spec = self.cfg["intents"][intent]
        kw_patterns = self.kw_cache[intent]
        keyword_score = sum(1 for p in kw_patterns if p.search(text))
        examples = spec.get("examples", [])
        semantic_score = self.semantic.score(text, examples)
        return keyword_score * 0.6 + semantic_score * 1.2

    def classify(self, text: str, history: List[str]) -> List[Tuple[str, float]]:
        scores = []
        for intent in self.cfg["intents"].keys():
            s = self.score_intent(text, intent, history)
            scores.append((intent, s))
        scores.sort(key=lambda x: x[1], reverse=True)
        return scores


class Router:
    def __init__(self):
        self.routes = {
            "greeting": "conversational",
            "farewell": "conversational",
            "help": "support",
            "technical_help": "engineering_support",
            "emotional_support": "care_support",
            "command": "executor",
            "system_command": "executor",
            "question": "qa",
            "status_question": "qa",
            "pricing_question": "sales",
            "safety": "safety_officer",
        }

    def route(self, top_intent: str) -> str:
        return self.routes.get(top_intent, "general")


class IntentEngine:
    def __init__(self, config: Dict[str, Any] = CONFIG):
        self.cfg = config
        self.semantic = SemanticBackend(self.cfg["model_name"])  # may be disabled
        self.lang = LanguageDetector()
        self.norm = Normalizer()
        self.safety = SafetyGate(self.cfg["toxicity_threshold"])
        self.es = EmotionSentiment()
        self.slots = SlotFiller()
        self.ui = UrgencyInterrupt(
            self.cfg["urgency_words"], self.cfg["interruption_phrases"]
        )
        self.ic = IntentClassifier(self.cfg, self.semantic)
        self.router = Router()
        self.history: List[str] = []  # recent intents

    def analyze(self, text: str) -> NLUOutput:
        t0 = time.time()
        text_norm = self.norm.normalize(text)
        language = self.lang.detect(text_norm)
        toxicity = self.safety.toxicity_score(text_norm)
        safety_flag = self.safety.safety_flag(text_norm)
        urgency = self.ui.urgency(text_norm)
        interruption = self.ui.interruption(text_norm)
        entities = self.slots.extract(text_norm)
        sentiment = self.es.sentiment(text_norm)
        emotion = self.es.emotion(text_norm)

        ranked = self.ic.classify(text_norm, self.history[-CONFIG["max_recent"] :])
        top_intent, top_score = ranked[0]

        # Normalize confidence to [0,1] with soft scale
        # Assuming typical score range ~[0, 3]
        confidence = 1 - math.exp(-max(0.0, top_score))

        out = NLUOutput(
            intent=top_intent,
            confidence=round(confidence, 3),
            intents_ranked=[(i, round(s, 3)) for i, s in ranked[:6]],
            entities=entities,
            sentiment=sentiment,
            emotion=emotion,
            toxicity=toxicity,
            urgency=urgency,
            interruption=interruption,
            language=language,
            safety_flag=safety_flag,
        )

        # Maintain history (only store top intent)
        self.history.append(top_intent)
        if len(self.history) > 64:
            self.history = self.history[-64:]

        return out

    def route(self, nlu: NLUOutput) -> str:
        return self.router.route(nlu.intent)


# -------------------------------
# Example usage
# -------------------------------
if __name__ == "__main__":
    engine = IntentEngine()
    samples = [
        "Hey, quick question: why is uvicorn crashing on startup?",
        "Run alpha_wolf in prod now please!!!",
        "I feel frustrated and need help with git push.",
        "Stop. Hold on. Rollback the release.",
        "What's the price for premium?",
        "Thanks, bye for now",
    ]
    for s in samples:
        nlu = engine.analyze(s)
        route = engine.route(nlu)
        print("\nINPUT:", s)
        print("INTENT:", nlu.intent, nlu.confidence)
        print("RANKED:", nlu.intents_ranked)
        print("EMOTION:", nlu.emotion, "SENT:", nlu.sentiment)
        print("URGENCY:", nlu.urgency, "INTERRUPT:", nlu.interruption)
        print("ENTITIES:", json.dumps(nlu.entities))
        print(
            "LANG:",
            nlu.language,
            "TOX:",
            round(nlu.toxicity, 3),
            "SAFETY:",
            nlu.safety_flag,
        )
        print("ROUTE:", route)
