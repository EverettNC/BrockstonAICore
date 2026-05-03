# DEAD_FILES_TO_DELETE.md
## The Christman AI Project — BROCKSTON C Rebuild
## Cardinal Rule 13: Absolute honesty about the code.

This manifest is an honest accounting of files that are candidates for removal.
Everett reviews this and executes the deletes manually (`git rm`).
Nothing in this document deletes anything by itself.

**IMPORTANT — What was corrected from the first version:**
The original manifest incorrectly flagged BROCKSTON's reasoning and learning systems
as dead code. They are NOT dead. `reasoning_reflective_planner.py` and
`reasoning_intent.py` have been WIRED INTO `brockston_core.py` as of this build.
`ai_learning_engine.py` and `brockston_learning_coordinator.py` were ALREADY wired.
The original mistake was treating "not directly imported by brockston_core.py at that moment"
as the same as "dead." It was wrong. These systems are BROCKSTON's growth engine.

---

## SECTION 1 — CONFIRMED DEAD: Memory files retired by memory_engine.py
**Count: 16 — Safe to delete**

These files have been superseded by the consolidated `memory_engine.py`.
All logic worth keeping was folded into the new engine. These are dead weight.

```
memory.py
memory_backup.py
memory_engine_secure.py
memory_enhance_rag.py
memory_episodic.py
memory_hook.py
memory_kb.py
memory_knowledge_hub.py
memory_manager.py
memory_mesh.py
memory_mesh_bridge.py
memory_retriever.py
memory_router.py
memory_store.py
memory_working.py
simple_memory_mesh.py
```

---

## SECTION 2 — ELEVENLABS TTS — Delete after confirming Polly is working
**Count: 3**

These files have ElevenLabs as a primary dependency. BROCKSTON uses Polly now.
Delete them after you've confirmed Polly is working in production.

```
voice_service.py         — ElevenLabs Tier 1 in fallback chain
tts_bridget.py           — Routes entirely to voice_service.py
tts_advanced.py          — Duplicate of advanced_tts_service.py (keep the other one)
```

---

## SECTION 3 — QUANTUM FILES — Experimental, wrong being, or broken imports
**Count: 5**

These files are either wired to AlphaVox/Derek (wrong being),
require qiskit (not installed), or import a C++ kernel file that doesn't exist.

```
quantum_fusion.py          — AlphaVox architecture, imports qiskit
quantum_neural.py          — FastAPI app titled "AlphaVox Quantum Fusion"
quantum_memory.py          — Logs to derek_api_url on port 8010. Derek's system.
reasoning_kernel_fusion.py — Imports torch + compiles fusion_kernel.cpp (doesn't exist). Will crash on import.
Phase3QuantumProsody.py    — Standalone voice-mapping script, not a live module
```

Keep: `reasoning_quantum_memory.py` — this one points to BROCKSTON's RAG, not Derek's.
Flag for review before deleting.

---

## SECTION 4 — DEREK'S FILES — Wrong being, landed in BROCKSTON's folder
**Count: 3**

These files are Derek's reasoning stack. They import derek_cortex, brain_common_events,
and Derek-specific paths. They do not belong in BROCKSTON's python_core.

```
reasoning_dispatcher.py   — Imports derek_cortex, brain_common_events, derek_local_reasoning
reasoning_reasoner.py     — Part of Derek's cortex stack (reasoning_cortex_types.Outcome)
reflective_planner.py     — Derek-flavored version of reasoning_reflective_planner.py
```

Note: `reasoning_reflective_planner.py` is the BROCKSTON version — keep it. It is now wired.

---

## SECTION 5 — ONE-SHOT PATCHERS — Not modules, should never be imported
**Count: 2**

These are script files that rewrite `brain_core.py` as a string operation.
They are not importable modules. They are not part of the live system.

```
reasoning_enhance_cortex.py   — One-shot patcher that modifies brain_core.py as a string
reasoning_enhance_method.py   — Same pattern, different patch
```

---

## SECTION 6 — REVIEW BEFORE DELETING (do not delete without checking)

| File | Why it needs your eyes |
|------|------------------------|
| `reasoning_engine.py` | Shim that imports from `local_reasoning_engine`. Delete only after confirming nothing else calls it directly. |
| `reasoning_intent.py` | **KEEP — NOW WIRED.** Elite intent engine. Connected to brockston_core.py as of this build. Do NOT delete. |
| `reasoning_reflective_planner.py` | **KEEP — NOW WIRED.** Autonomous reflection loop. Connected to brockston_core.py as of this build. Do NOT delete. |
| `memory_rag.py` | Not in the retirement list. Scan it — if it has RAG logic not in memory_engine.py, keep it. |
| `memory_import_knowledge.py` | May be a utility script. Check if knowledge_engine.py replaces its function. |
| `tts_bridge.py` | Uses macOS `say` command. No ElevenLabs. Might be your offline dev TTS. Don't delete until you're sure. |
| `sovereign_speech.py` | Whisper STT — speech-to-TEXT. Not TTS. Check if brockston_speech_to_speech.py uses it. |
| `reasoning_quantum_memory.py` | Points to BROCKSTON's RAG (not Derek's). Review before deleting. |
| `brain_core.py` | Older parallel brain file. NOT the same as brockston_core.py. Check before deleting. |
| `BROCKSTON_Brain.py` | Listed in module loader. May be legacy entry point. Check before deleting. |
| `brockston_module_loader.py` | **DO NOT DELETE.** Boot loader. The module map inside it needs pruning — the file itself stays. |

---

## SECTION 7 — KEEP — Confirmed Live and Wired
**Count: 16**

```
brockston_core.py                — The real brain
crisis_detection.py              — Safety path — never remove
memory_engine.py                 — Consolidated memory system (new)
conversation_engine.py           — Conversation logic (cleaned)
local_reasoning_engine.py        — Brockston's own reasoning (cleaned)
knowledge_engine.py              — Knowledge retrieval (cleaned, rebranded)
tone_manager.py                  — Tone and emotion analysis
provider_router.py               — Ollama first, Anthropic fallback
perplexity_service.py            — External search
brockston_learning_coordinator.py — Learning coordination (wired)
ai_learning_engine.py            — Self-improvement engine (wired)
brockston_module_loader.py       — Boot loader
brockston_speech_to_speech.py    — Voice pipeline
brockston_knows_everett.py       — Everett relationship profile
reasoning_intent.py              — Elite intent engine (NEWLY WIRED)
reasoning_reflective_planner.py  — Autonomous reflection loop (NEWLY WIRED)
```

---

## SUMMARY

| Section | Count | Action |
|---------|-------|--------|
| Retired memory files | 16 | Delete |
| ElevenLabs TTS | 3 | Delete after Polly confirmed |
| Quantum / wrong being | 5 | Delete |
| Derek's files | 3 | Delete |
| One-shot patchers | 2 | Delete |
| Review before deleting | ~10 | Everett reviews manually |
| **SAFE DELETE TOTAL** | **29** | |
| Keep | 16 | Do not touch |

---

*Governed by Cardinal Rule 13: Absolute honesty about the code.*
*Corrected May 2, 2026 — original manifest was wrong about reasoning and learning files.*
*© 2025 Everett Nathaniel Christman — Luma Cognify AI*
