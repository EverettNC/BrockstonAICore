# DEAD_FILES_TO_DELETE.md
## The Christman AI Project — BROCKSTON C Rebuild
## Cardinal Rule 13: Absolute honesty about the code.

This manifest is an honest accounting of files in `src/ai/python_core/` that are
candidates for removal. Everett reviews this and executes the deletes manually
(or via `git rm`). Nothing in this document deletes anything by itself.

**Total files flagged for deletion: 39**
**Files flagged for review before deciding: 10**

---

## SECTION 1 — CONFIRMED DEAD: Memory files retired by memory_engine.py
**Count: 14**

These files have been superseded by the consolidated `memory_engine.py`.
`brockston_core.py` imports only `memory_engine.py`. The module loader
(`brockston_module_loader.py`) does attempt to load several of these at boot,
but they are not imported by any live logic — the loader's `_load_module()`
swallows failures silently. They are dead weight.

> NOTE on `memory.py`: The grep for `memory.py` returns false positives from
> comments and the `memory_store.json` path string. Actual `from memory import`
> or `import memory` directives do NOT appear in any live file. Flagged dead.

> NOTE on `memory_store.py`: The name `memory_store` appears in
> `brockston_core.py` only as the path string `./memory/memory_store.json`
> (the JSON data file), not as a Python module import. Flagged dead.

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

Wait — `memory_rag.py` and `memory_import_knowledge.py` also exist in the
directory and are not in the task's memory retirement list. See Section 5
(REVIEW BEFORE DELETING) for those two.

Confirmed dead memory files: **16**

---

## SECTION 2 — ELEVENLABS TTS — Delete after confirming Polly is working
**Count: 3**

These files have ElevenLabs as a primary or first-class dependency.

| File | Verdict |
|------|---------|
| `voice_service.py` | **ElevenLabs-primary.** Defines a `VoiceServiceBeing` enum with `ELEVENLABS = "elevenlabs"`, has `_init_elevenlabs()`, `_synthesize_elevenlabs()`, and `is_elevenlabs_available()` methods. ElevenLabs is Tier 1 in the fallback chain. **Delete after Polly confirmed working.** |
| `tts_bridget.py` | **Routes to voice_service.py.** Its sole job is bridging into `voice_service.synthesize_speech()`, which is the ElevenLabs→Polly→gTTS chain. If `voice_service.py` is deleted and replaced with a Polly-only service, `tts_bridget.py` either gets rewritten or deleted. **Flag for delete with voice_service.py.** |
| `tts_advanced.py` | **Identical to `advanced_tts_service.py`.** Both use only `gTTS` (no ElevenLabs), but are duplicate Flask apps serving the same purpose. One must die. `advanced_tts_service.py` is in the module loader by its full name — keep that one, delete `tts_advanced.py`. |

Files to delete after Polly confirmation: **3**

Files that do NOT belong here (honest assessment):
- `tts_bridge.py` — Uses macOS `say` command as TTS. No ElevenLabs. No Flask. Standalone system TTS shim. See Section 5.
- `advanced_tts_service.py` — Uses only gTTS. No ElevenLabs. Not in this section.
- `sovereign_speech.py` — Uses `faster_whisper` for speech-to-TEXT (transcription). No ElevenLabs. Not TTS at all. See Section 5.
- `shorty_voice_engine_v2.py` — Imports from `engines.base_synthesizer`. No ElevenLabs found in first-pass scan. See Section 5.

---

## SECTION 3 — QUANTUM NAMING — Experimental, likely never wired into live paths
**Count: 6**

These files have "quantum" in the name. They were reviewed. None are imported
by `brockston_core.py`. They appear in `brockston_module_loader.py`'s module
map (which loads everything and swallows failures), but are not wired into
actual reasoning paths.

| File | Notes |
|------|-------|
| `quantum_fusion.py` | Imports `qiskit`, `qiskit_aer`. AAC symbol→speech via quantum circuits. AlphaVox architecture, not Brockston C. |
| `quantum_memory.py` | Logs to a `derek_api_url` on port 8010. Derek's system, not Brockston C. |
| `quantum_neural.py` | Duplicate of `quantum_fusion.py` header. FastAPI app titled "AlphaVox Quantum Fusion". Not Brockston C. |
| `Phase3QuantumProsody.py` | AWS Polly TTS with family voice mapping. No actual quantum logic. Misleadingly named. The voice map includes "brockston" → Stephen (British), which may be useful context, but the file itself is a standalone script. |
| `reasoning_quantum_memory.py` | Duplicate of `quantum_memory.py` but points to `brockston_api_url`. FastAPI app that logs to Brockston's RAG. No live callers in the core brain. |
| `reasoning_kernel_fusion.py` | Imports `torch`, compiles a C++ kernel from `app/fusion_kernel.cpp` (which does not exist in this repo). Will crash on import. Dead. |

```
quantum_fusion.py
quantum_memory.py
quantum_neural.py
Phase3QuantumProsody.py
reasoning_quantum_memory.py
reasoning_kernel_fusion.py
```

Quantum files to delete: **6**

---

## SECTION 4 — DUPLICATE REASONING — Superseded by local_reasoning_engine.py
**Count: 8**

These files duplicate reasoning logic that lives in `local_reasoning_engine.py`
and `brockston_core.py`. They appear in the module loader's map but are not
directly imported by the brain's reasoning path.

| File | Notes |
|------|-------|
| `reasoning_engine.py` | Explicitly an alias shim: `from local_reasoning_engine import LocalReasoningEngine`. Keep until all callers are updated to import `local_reasoning_engine` directly, then delete. |
| `reasoning_dispatcher.py` | Multi-path dispatcher for Derek's cortex tools. References `brain_common_events.EventBus` (not found in repo). Derek's system. |
| `reasoning_enhance_cortex.py` | A **one-shot script** that patches `brain_core.py` by reading and rewriting it as a string. Not a module. Should never be imported. |
| `reasoning_enhance_method.py` | Same pattern — one-shot patcher for `brain_core.py`. Not a module. Should never be imported. |
| `reasoning_intent.py` | Standalone elite intent engine with sentence-transformers. Duplicates `intent_engine.py`. Not imported by `brockston_core.py`. |
| `reasoning_reasoner.py` | Part of Derek's cortex stack (`brockston_cortex/reasoner.py`). Imports `reasoning_cortex_types.Outcome`. Wired only through `brain_core.py`, not `brockston_core.py`. |
| `reasoning_reflective_planner.py` | BROCKSTON-flavored autonomous reflection planner. Duplicate of `reflective_planner.py` (which is Derek-flavored). Neither is imported by `brockston_core.py`. |
| `reflective_planner.py` | Derek's version of the same. Neither is imported by the live brain. |

```
reasoning_engine.py
reasoning_dispatcher.py
reasoning_enhance_cortex.py
reasoning_enhance_method.py
reasoning_intent.py
reasoning_reasoner.py
reasoning_reflective_planner.py
reflective_planner.py
```

Duplicate reasoning files to delete: **8**

---

## SECTION 5 — REVIEW BEFORE DELETING
**Count: ~10**

These files are not confirmed dead with certainty from the live import scan alone.
Everett should inspect each before deleting.

| File | Why it needs review |
|------|---------------------|
| `memory_rag.py` | Exists in the directory but not in the task's memory retirement list. Scan it — if it wraps RAG-specific memory logic not in `memory_engine.py`, keep it. Otherwise retire it. |
| `memory_import_knowledge.py` | Same — not in the retirement list. May be a utility script, not a live module. |
| `tts_bridge.py` | Uses macOS `say` command. Not ElevenLabs. Might be the only TTS that works offline in dev. Check if anything calls it before deleting. |
| `sovereign_speech.py` | Whisper STT (speech-to-text), not TTS. Purged of OpenAI. Could be valuable local transcription. Check if `brockston_speech_to_speech.py` uses `EnhancedSpeechRecognition` instead (it does) — if sovereign_speech is unused, safe to delete. |
| `shorty_voice_engine_v2.py` | Imports from `engines.base_synthesizer`. No ElevenLabs seen. Unclear if it's wired. Check `engines/` subdirectory. |
| `advanced_tts_service.py` | gTTS-only Flask TTS server. No ElevenLabs. Lives in module loader. If the Flask TTS server is not used by anything, delete. If used, keep. |
| `brain_core.py` | Appears to be an older/parallel brain file that `reasoning_reasoner.py` and others import. NOT the same as `brockston_core.py`. Check if it's the remnant of the previous build before deleting. |
| `BROCKSTON_Brain.py` | Listed in module loader's consciousness category. Different from `brockston_core.py`. Could be legacy entry point. |
| `api.py` / `app.py` / `server.py` | Multiple web entry points in python_core. With `api_server.py` living at `src/api_server.py`, these may be dead duplicates. |
| `brockston_module_loader.py` | **DO NOT DELETE.** This is listed as a live "keep" file. It is the boot loader. Mentioned here only to flag that its giant module map contains many dead entries — the map itself needs pruning, not the file. |

---

## SECTION 6 — KEEP — Confirmed Live and Wired
**Count: 15**

These files are directly imported by `brockston_core.py` or are named as live
by the task specification.

```
brockston_core.py              — The real brain
brockston_module_loader.py     — Boot loader (loads full consciousness)
crisis_detection.py            — Safety path — never remove
memory_engine.py               — Consolidated memory system
conversation_engine.py         — Conversation logic
local_reasoning_engine.py      — Brockston's own reasoning
knowledge_engine.py            — Knowledge retrieval
tone_manager.py                — Tone and emotion analysis
provider_router.py             — Ollama first, Anthropic fallback
perplexity_service.py          — External search
brockston_learning_coordinator.py — Learning coordination
brockston_speech_to_speech.py  — Voice pipeline
brockston_knows_everett.py     — Everett relationship profile
ai_learning_engine.py          — Self-improvement engine
```

Note: `api_server.py` is listed in the task as a live file but lives at
`src/api_server.py`, not inside `python_core/`. It is not in this directory.

---

## SUMMARY TABLE

| Section | Count | Action |
|---------|-------|--------|
| Retired memory files | 16 | Delete |
| ElevenLabs TTS | 3 | Delete after Polly confirmed |
| Quantum naming | 6 | Delete |
| Duplicate reasoning | 8 | Delete (reasoning_engine.py — after alias callers updated) |
| Review before deleting | ~10 | Everett reviews manually |
| **CONFIRMED DELETE TOTAL** | **33** | |
| Keep | 14 | Do not touch |

---

*Governed by Cardinal Rule 13: Absolute honesty about the code.*
*Prepared by Agent E — The Christman AI Project, BROCKSTON C Rebuild*
*© 2025 Everett Nathaniel Christman — Luma Cognify AI*
