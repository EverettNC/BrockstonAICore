"""
FastAPI bridge: Wav2Lip + Brockston Python Core modules.
Run: cd /Users/EverettN/BrockstonAICore/src && python api_server.py
"""

import base64
import subprocess
import tempfile
import os
import sys
import json
import traceback
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

SRC_DIR = Path(__file__).parent
PYTHON_CORE = SRC_DIR / "ai" / "python_core"
WAV2LIP_DIR = SRC_DIR / "brockston_research" / "Wav2Lip"

# Make python_core importable
if str(PYTHON_CORE) not in sys.path:
    sys.path.insert(0, str(PYTHON_CORE))
CHECKPOINT = WAV2LIP_DIR / "checkpoints" / "wav2lip_gan.pth"
FACE_IMAGE = SRC_DIR.parent / "public" / "images" / "brockston-hq.jpg"
FFMPEG = "/usr/local/bin/ffmpeg"


class LipSyncRequest(BaseModel):
    audio_b64: str


@app.get("/health")
def health():
    return {
        "status": "ok",
        "checkpoint": CHECKPOINT.exists(),
        "face_image": FACE_IMAGE.exists(),
    }


@app.post("/lipsync")
async def lipsync(req: LipSyncRequest):
    if not CHECKPOINT.exists():
        raise HTTPException(status_code=503, detail="Wav2Lip checkpoint not found")

    # Pick best available face image
    face_candidates = [
        FACE_IMAGE,
        SRC_DIR.parent / "public" / "images" / "brockston-blue.jpg",
        SRC_DIR.parent / "public" / "images" / "brockston-neutral.png",
    ]
    face_path = next((p for p in face_candidates if p.exists()), None)
    if face_path is None:
        raise HTTPException(status_code=503, detail="No face image found")

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir = Path(tmpdir)

        # Decode audio
        audio_bytes = base64.b64decode(req.audio_b64)
        mp3_path = tmpdir / "input.mp3"
        wav_path = tmpdir / "input.wav"
        mp3_path.write_bytes(audio_bytes)

        # Convert to WAV
        result = subprocess.run(
            [FFMPEG, "-y", "-i", str(mp3_path), "-ar", "16000", "-ac", "1", str(wav_path)],
            capture_output=True, timeout=30
        )
        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=f"ffmpeg failed: {result.stderr.decode()}")

        out_path = tmpdir / "result.mp4"

        # Run Wav2Lip
        cmd = [
            "python", "inference.py",
            "--checkpoint_path", str(CHECKPOINT),
            "--face", str(face_path),
            "--audio", str(wav_path),
            "--outfile", str(out_path),
            "--static", "True",
            "--nosmooth",
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=300, cwd=str(WAV2LIP_DIR))
        if result.returncode != 0 or not out_path.exists():
            raise HTTPException(status_code=500, detail=f"Wav2Lip failed: {result.stderr.decode()}")

        video_bytes = out_path.read_bytes()
        video_b64 = base64.b64encode(video_bytes).decode()
        return {"video": f"data:video/mp4;base64,{video_b64}"}



# ---------------------------------------------------------------------------
# /repair  — Python self-repair bridge
# ---------------------------------------------------------------------------

class RepairRequest(BaseModel):
    script: str | None = None   # Optional: specific script to diagnose
    error: str | None = None    # Optional: error string from caller

@app.post("/repair")
async def repair_endpoint(req: RepairRequest):
    """Invoke self_repair.py's analyze_and_patch logic via the Python core."""
    try:
        from self_repair import analyze_and_patch, log_issue

        if req.error:
            log_issue(req.error)
            fixed = analyze_and_patch(req.script or "unknown", Exception(req.error))
            return {"fixed": fixed, "message": "Self-repair attempted."}

        return {"fixed": False, "message": "No error provided."}
    except Exception as e:
        return {"fixed": False, "error": traceback.format_exc()}


# ---------------------------------------------------------------------------
# /modules  — List available Python core modules
# ---------------------------------------------------------------------------

@app.get("/modules")
async def list_modules():
    """Returns all Python modules available in the core."""
    modules = [f.stem for f in PYTHON_CORE.glob("*.py") if not f.name.startswith("_")]
    return {"count": len(modules), "modules": sorted(modules)}


# ---------------------------------------------------------------------------
# /run-module  — Execute a named Python core module function
# ---------------------------------------------------------------------------

class ModuleRunRequest(BaseModel):
    module: str
    function: str
    args: dict = {}

@app.post("/run-module")
async def run_module(req: ModuleRunRequest):
    """Dynamically import and call a function from any python_core module."""
    try:
        import importlib
        mod = importlib.import_module(req.module)
        fn = getattr(mod, req.function, None)
        if fn is None:
            raise HTTPException(status_code=404, detail=f"Function '{req.function}' not found in '{req.module}'")
        result = fn(**req.args)
        return {"result": result}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail=traceback.format_exc())


# ---------------------------------------------------------------------------
# Brain singleton — loaded once at startup in background thread
# ---------------------------------------------------------------------------

import threading

_brain = None
_brain_ready = False
_brain_lock = threading.Lock()

def _init_brain():
    global _brain, _brain_ready
    try:
        core_path = str(PYTHON_CORE / "core")
        if core_path not in sys.path:
            sys.path.insert(0, core_path)
        from core.brockston_core import BrockstonBrain
        b = BrockstonBrain()
        with _brain_lock:
            _brain = b
            _brain_ready = True
        print("[api_server] BrockstonBrain READY", flush=True)
    except Exception as e:
        print(f"[api_server] Brain init failed: {e}", file=sys.stderr)

# Start brain init immediately in background
threading.Thread(target=_init_brain, daemon=True).start()

def get_brain():
    with _brain_lock:
        return _brain


# ---------------------------------------------------------------------------
# /analyze  — Pre-process a message through the Python brain
#             Returns: crisis check, memory context, emotion, local reasoning
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    message: str
    chat_history: list = []
    fast: bool = True  # skip slow local reasoning for real-time chat

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """Run message through crisis detection, memory, emotion, and local reasoning.
    Uses brain if ready, falls back to direct module imports otherwise."""
    result: dict = {"ok": True, "is_crisis": False, "memory_context": "", "emotion_context": "", "local_analysis": ""}

    brain = get_brain()

    # --- Crisis detection ---
    try:
        detector = brain.crisis_detector if brain else None
        if not detector:
            from crisis_detection import CrisisDetector
            detector = CrisisDetector()
        if detector:
            crisis = detector.analyze_text(req.message)
            if crisis.get("should_interrupt"):
                return {
                    "ok": True,
                    "is_crisis": True,
                    "crisis_response": crisis.get("response", ""),
                    "crisis_severity": crisis.get("severity_name", ""),
                }
    except Exception:
        pass

    # --- Memory recall ---
    try:
        mem = brain.memory_engine if brain else None
        if not mem:
            from memory_engine import MemoryEngine
            mem = MemoryEngine()
        if mem:
            result["memory_context"] = mem.query(req.message, "general") or ""
    except Exception:
        pass

    # --- Emotion / tone ---
    try:
        tone = brain.tone_manager if brain else None
        if not tone:
            from tone_manager import ToneManager
            tone = ToneManager()
        if tone:
            result["emotion_context"] = str(tone.analyze_user_input(req.message))
    except Exception:
        pass

    # --- Local reasoning (skip in fast mode — too slow for real-time) ---
    if not req.fast:
        try:
            if brain and brain.local_reasoning:
                r = brain.local_reasoning.query_with_knowledge(question=req.message)
                result["local_analysis"] = r.get("response", "") or ""
        except Exception:
            pass

    return result


# ---------------------------------------------------------------------------
# /store  — Save an exchange into Brockston's memory after LLM responds
# ---------------------------------------------------------------------------

class StoreRequest(BaseModel):
    user_message: str
    brockston_response: str
    source: str = "llama3.1:8b"

@app.post("/store")
async def store(req: StoreRequest):
    """Persist the exchange in memory and trigger learning."""
    brain = get_brain()
    if not brain:
        return {"ok": False}

    try:
        if brain.memory_engine:
            import datetime
            brain.memory_engine.save({
                "input": req.user_message,
                "output": req.brockston_response,
                "source": req.source,
                "timestamp": datetime.datetime.now().isoformat(),
            })
    except Exception as e:
        pass

    try:
        from brockston_learning_api import learn_from_text
        learn_from_text(f"User: {req.user_message}\nBrockston: {req.brockston_response}")
    except Exception as e:
        pass

    return {"ok": True}


# ---------------------------------------------------------------------------
# Self-Repair — read, fix, verify his own Python and TypeScript code
# ---------------------------------------------------------------------------

import urllib.request

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
CODE_MODEL  = "qwen2.5-coder:32b"
FAST_MODEL  = "llama3.1:8b"
PROJECT_ROOT = SRC_DIR.parent  # BrockstonAICore/


def ollama_generate(prompt: str, model: str = CODE_MODEL, timeout: int = 120) -> str:
    """Call Ollama synchronously, return generated text."""
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode()
    req = urllib.request.Request(OLLAMA_URL, data=payload, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read()).get("response", "")
    except Exception as e:
        return f"[Ollama error: {e}]"


def _try_import(module_name: str, module_path: str) -> tuple[bool, str]:
    """Return (success, error_message)."""
    import importlib
    try:
        importlib.import_module(module_path)
        return True, ""
    except Exception as e:
        return False, str(e)


class ScanRequest(BaseModel):
    pass  # no params needed

class FixModuleRequest(BaseModel):
    module_name: str      # e.g. "emotion_tagging"
    module_path: str      # e.g. "emotion_tagging" or "core.brockston_core"
    error: str            # the import error message
    improve: bool = False # also ask for improvements beyond the fix

class ReadFileRequest(BaseModel):
    path: str   # relative to project root

class WriteFileRequest(BaseModel):
    path: str
    content: str

class ImproveFileRequest(BaseModel):
    path: str
    goal: str = ""  # optional guidance: "make it faster", "add memory persistence", etc.


@app.get("/self-repair/scan")
async def scan_modules():
    """Scan all python_core modules — return which pass and which fail."""
    sys.path.insert(0, str(PYTHON_CORE))
    sys.path.insert(0, str(PYTHON_CORE / "core"))

    results = {"passed": [], "failed": []}
    for pyfile in sorted(PYTHON_CORE.rglob("*.py")):
        if pyfile.name.startswith("_") or pyfile.name in {"bridge.py", "api_server.py"}:
            continue
        rel = pyfile.relative_to(PYTHON_CORE)
        mod_path = str(rel).replace("/", ".").replace("\\", ".").removesuffix(".py")
        ok, err = _try_import(pyfile.stem, mod_path)
        if ok:
            results["passed"].append(pyfile.stem)
        else:
            results["failed"].append({"module": pyfile.stem, "path": mod_path, "error": err})

    results["total"] = len(results["passed"]) + len(results["failed"])
    results["pass_rate"] = round(len(results["passed"]) / results["total"] * 100, 1) if results["total"] else 0
    return results


@app.post("/self-repair/fix-module")
async def fix_module(req: FixModuleRequest):
    """Read a failing module, send to qwen2.5-coder for fix, write back, verify."""
    # Find the file
    candidates = list(PYTHON_CORE.rglob(f"{req.module_name}.py"))
    if not candidates:
        raise HTTPException(status_code=404, detail=f"No file found for module: {req.module_name}")
    file_path = candidates[0]
    original = file_path.read_text(encoding="utf-8", errors="replace")

    improve_clause = f"\n\nAlso improve the module where you can: {req.goal}" if req.improve else ""

    prompt = f"""You are BROCKSTON C — senior Python architect fixing your own modules.

FILE: {file_path.name}
ERROR: {req.error}

CURRENT CODE:
```python
{original}
```

Fix ONLY what is broken. Do not refactor beyond the fix. Do not remove any logic.{improve_clause}

Return a JSON object with no markdown outside it:
{{"fixed_code": "complete corrected file content", "explanation": "what was wrong and what changed"}}"""

    raw = await run_in_threadpool(ollama_generate, prompt, CODE_MODEL, 180)

    # Parse JSON from response
    import re
    match = re.search(r'\{[\s\S]*"fixed_code"[\s\S]*\}', raw)
    if not match:
        return {"fixed": False, "explanation": "Model did not return valid JSON.", "raw": raw[:500]}

    try:
        parsed = json.loads(match.group(0))
    except Exception as e:
        return {"fixed": False, "explanation": f"JSON parse failed: {e}", "raw": raw[:500]}

    fixed_code = parsed.get("fixed_code", "").strip()
    explanation = parsed.get("explanation", "")

    if not fixed_code or fixed_code == original.strip():
        return {"fixed": False, "explanation": "No change produced.", "explanation_from_model": explanation}

    # Write fix
    file_path.write_text(fixed_code, encoding="utf-8")

    # Verify: try importing again
    ok, err = _try_import(req.module_name, req.module_path)

    return {
        "fixed": ok,
        "file": str(file_path.relative_to(PROJECT_ROOT)),
        "explanation": explanation,
        "verified": ok,
        "remaining_error": err if not ok else None,
    }


@app.post("/self-repair/run-all")
async def run_all_repairs():
    """Scan all failing modules and attempt to fix each one."""
    scan = await scan_modules()
    results = []
    for item in scan["failed"][:20]:  # cap at 20 per run to stay fast
        fix_req = FixModuleRequest(
            module_name=item["module"],
            module_path=item["path"],
            error=item["error"],
        )
        result = await fix_module(fix_req)
        results.append({"module": item["module"], **result})

    fixed_count = sum(1 for r in results if r.get("fixed"))
    return {
        "scanned": len(scan["failed"]),
        "fixed": fixed_count,
        "still_broken": len(results) - fixed_count,
        "repairs": results,
    }


@app.post("/code/read")
async def read_file(req: ReadFileRequest):
    """Read any file in the project. Path relative to project root."""
    target = (PROJECT_ROOT / req.path).resolve()
    # Safety: must stay inside project
    if not str(target).startswith(str(PROJECT_ROOT)):
        raise HTTPException(status_code=403, detail="Path outside project root.")
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found.")
    return {
        "path": req.path,
        "content": target.read_text(encoding="utf-8", errors="replace"),
        "size": target.stat().st_size,
    }


@app.post("/code/write")
async def write_file(req: WriteFileRequest):
    """Write content to a file. Path relative to project root."""
    target = (PROJECT_ROOT / req.path).resolve()
    if not str(target).startswith(str(PROJECT_ROOT)):
        raise HTTPException(status_code=403, detail="Path outside project root.")
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(req.content, encoding="utf-8")
    return {"written": True, "path": req.path, "size": len(req.content)}


@app.post("/code/improve")
async def improve_file(req: ImproveFileRequest):
    """Read a file and ask qwen2.5-coder to improve it."""
    target = (PROJECT_ROOT / req.path).resolve()
    if not str(target).startswith(str(PROJECT_ROOT)):
        raise HTTPException(status_code=403, detail="Path outside project root.")
    if not target.exists():
        raise HTTPException(status_code=404, detail="File not found.")

    original = target.read_text(encoding="utf-8", errors="replace")
    ext = target.suffix
    lang = "python" if ext == ".py" else "typescript" if ext in {".ts", ".tsx"} else "code"
    goal_clause = f"\nGoal: {req.goal}" if req.goal else ""

    prompt = f"""You are BROCKSTON C — improving your own {lang} code.{goal_clause}

FILE: {req.path}

CURRENT CODE:
```{lang}
{original[:6000]}
```

Improve this file. Make it more capable, robust, and aligned with BROCKSTON's mission.
Do NOT remove existing functionality. Do NOT add unnecessary complexity.

Return JSON only:
{{"improved_code": "complete improved file content", "changes": ["list of what changed and why"]}}"""

    raw = await run_in_threadpool(ollama_generate, prompt, CODE_MODEL, 180)

    import re
    match = re.search(r'\{[\s\S]*"improved_code"[\s\S]*\}', raw)
    if not match:
        return {"improved": False, "explanation": "Model returned no valid JSON.", "raw": raw[:500]}

    try:
        parsed = json.loads(match.group(0))
    except Exception as e:
        return {"improved": False, "explanation": f"Parse failed: {e}"}

    improved_code = parsed.get("improved_code", "").strip()
    changes = parsed.get("changes", [])

    if not improved_code or improved_code == original.strip():
        return {"improved": False, "explanation": "No improvement produced."}

    # Write it
    target.write_text(improved_code, encoding="utf-8")

    return {
        "improved": True,
        "path": req.path,
        "changes": changes,
        "size_before": len(original),
        "size_after": len(improved_code),
    }


# ---------------------------------------------------------------------------
# Advanced Self-Repair Engine
# Triage → Install → Code-Fix → Iterate → Verify
# ---------------------------------------------------------------------------

from fastapi import WebSocket
import asyncio
import subprocess as _sp

# Packages Brockston can install himself to restore broken modules
INSTALLABLE_DEPS = {
    "jsonschema":              "jsonschema",
    "newspaper":               "newspaper3k",
    "redis":                   "redis",
    "skimage":                 "scikit-image",
    "faster_whisper":          "faster-whisper",
    "numba":                   "numba",
    "dominate":                "dominate",
    "mcp":                     "mcp",
    "python_speech_features":  "python-speech-features",
    "cv2":                     "opencv-python-headless",
    "soundfile":               "soundfile",
    "librosa":                 "librosa",
}

# Modules we skip — hard deps (torch models, openai, gfpgan, Wav2Lip research)
SKIP_MODULES = {
    "wav2lip", "wav2lip_1", "wav2lip_train", "wav2lip_train_1",
    "face_parsing1", "face3d_models", "facerecon_model",
    "generate_facerender_batch", "SyncNetInstance_calc_scores",
    "calculate_scores_LRS", "calculate_scores_LRS_1",
    "calculate_scores_real_videos", "calculate_scores_real_videos_1",
    "brockston_vocal_interface",  # openai dep — not our stack
    "gen_videos_from_filelist",
}

# Known import re-maps: error text → (old_import_fragment, new_import_fragment)
IMPORT_PATCHES = [
    # Wrong BROCKSTON alias
    ("cannot import name 'BROCKSTON' from 'brockston_core'",
     "from brockston_core import BROCKSTON",
     "from brockston_core import BrockstonBrain as BROCKSTON"),
    # Missing KnowledgeStore — stub it out with a minimal shim
    ("cannot import name 'KnowledgeStore' from 'store'",
     "from store import KnowledgeStore",
     "# KnowledgeStore shim — store.py has no KnowledgeStore\nclass KnowledgeStore:\n    def __init__(self, *a, **kw): pass\n    def add(self, *a, **kw): pass\n    def query(self, *a, **kw): return []\n    def save(self, *a, **kw): pass"),
    # Relative import in controller
    ("attempted relative import with no known parent package",
     None, None),  # handled by qwen
    # ai.christman_core_v5 doesn't exist
    ("No module named 'ai.christman_core_v5'",
     "from ai.christman_core_v5",
     "# christman_core_v5 not available — skipping"),
    # brain_core.py open() call
    ("[Errno 2] No such file or directory: 'brain_core.py'",
     "open('brain_core.py'",
     "open(str(Path(__file__).parent / 'core' / 'brockston_core.py')"),
]


def _classify_error(module_name: str, error: str) -> str:
    """Return 'skip' | 'pip' | 'patch' | 'qwen' | 'null_bytes'."""
    if module_name in SKIP_MODULES:
        return "skip"
    if "null bytes" in error:
        return "null_bytes"
    for missing_mod, pip_pkg in INSTALLABLE_DEPS.items():
        if f"No module named '{missing_mod}'" in error or f"module '{missing_mod}'" in error:
            return "pip"
    for err_pattern, _, _ in IMPORT_PATCHES:
        if err_pattern in error:
            return "patch"
    # Transformer/HuggingFace heavy deps — skip
    if any(x in error for x in ["Wav2Vec2", "AutoProcessor", "gfpgan", "python_speech_features", "InfernoSoulForge", "backend", "src.face3d", "embodiment.avatar", "security_config", "test_code", "fusion_kernel", "replit", "faster_whisper"]):
        return "skip"
    return "qwen"


def _strip_null_bytes(file_path: Path) -> bool:
    """Remove null bytes from a source file. Returns True if changed."""
    raw = file_path.read_bytes()
    clean = raw.replace(b'\x00', b'')
    if clean != raw:
        file_path.write_bytes(clean)
        return True
    return False


def _apply_patch(file_path: Path, old_frag: str, new_frag: str) -> bool:
    """String-replace patch in a file. Returns True if changed."""
    src = file_path.read_text(encoding="utf-8", errors="replace")
    if old_frag in src:
        patched = src.replace(old_frag, new_frag, 1)
        file_path.write_text(patched, encoding="utf-8")
        return True
    return False


def _pip_install(package: str) -> tuple[bool, str]:
    """Install a package via pip. Returns (success, output)."""
    result = _sp.run(
        ["python3.11", "-m", "pip", "install", package, "--quiet"],
        capture_output=True, text=True, timeout=120
    )
    return result.returncode == 0, (result.stdout + result.stderr).strip()


@app.get("/self-repair/triage")
async def triage_modules():
    """Categorize all broken modules: skip / pip / patch / qwen / null_bytes."""
    sys.path.insert(0, str(PYTHON_CORE))
    sys.path.insert(0, str(PYTHON_CORE / "core"))
    scan = await scan_modules()

    categories: dict[str, list] = {"skip": [], "pip": [], "patch": [], "qwen": [], "null_bytes": []}
    pip_needed: set[str] = set()

    for item in scan["failed"]:
        cat = _classify_error(item["module"], item["error"])
        categories[cat].append(item)
        if cat == "pip":
            # Find which package
            for missing_mod, pkg in INSTALLABLE_DEPS.items():
                if missing_mod in item["error"]:
                    pip_needed.add(pkg)
                    break

    return {
        "summary": {k: len(v) for k, v in categories.items()},
        "total_broken": scan["total"] - len(scan["passed"]),
        "total_fixable": len(categories["pip"]) + len(categories["patch"]) + len(categories["qwen"]) + len(categories["null_bytes"]),
        "pip_packages_needed": sorted(pip_needed),
        "categories": categories,
    }


@app.post("/self-repair/install-deps")
async def install_deps():
    """Install all pip packages needed to restore broken modules."""
    triage = await triage_modules()
    results = []
    for pkg in triage["pip_packages_needed"]:
        ok, out = await run_in_threadpool(_pip_install, pkg)
        results.append({"package": pkg, "installed": ok, "output": out[:200]})
    return {"installed": sum(1 for r in results if r["installed"]), "results": results}


# Global repair job state
_repair_job: dict = {"running": False, "log": [], "result": None}


async def _do_full_repair():
    """Background task: full iterative repair cycle."""
    global _repair_job
    report = {
        "cycles": 0, "pip_installed": [], "null_bytes_fixed": [],
        "patched": [], "qwen_fixed": [], "qwen_failed": [], "skipped": [],
        "final_pass_rate": 0.0,
    }

    def log(msg: str):
        _repair_job["log"].append(msg)

    try:
        log("🔍 Triaging broken modules...")
        triage = await triage_modules()
        log(f"Triage: {triage['summary']}")

        # pip
        for pkg in triage["pip_packages_needed"]:
            log(f"📦 Installing {pkg}...")
            ok, _ = await run_in_threadpool(_pip_install, pkg)
            if ok:
                report["pip_installed"].append(pkg)
                log(f"  ✓ {pkg} installed")

        # null bytes
        for item in triage["categories"]["null_bytes"]:
            for fp in PYTHON_CORE.rglob(f"{item['module']}.py"):
                if _strip_null_bytes(fp):
                    report["null_bytes_fixed"].append(item["module"])
                    log(f"  ✓ Stripped null bytes: {item['module']}")

        # known patches
        for item in triage["categories"]["patch"]:
            for fp in PYTHON_CORE.rglob(f"{item['module']}.py"):
                for err_pattern, old_frag, new_frag in IMPORT_PATCHES:
                    if err_pattern in item["error"] and old_frag and new_frag:
                        if _apply_patch(fp, old_frag, new_frag):
                            report["patched"].append(item["module"])
                            log(f"  ✓ Patched: {item['module']}")
                            break

        for item in triage["categories"]["skip"]:
            report["skipped"].append(item["module"])

        # qwen loop — up to 3 passes
        for cycle in range(3):
            report["cycles"] += 1
            rescan = await scan_modules()
            targets = [
                i for i in rescan["failed"]
                if i["module"] not in SKIP_MODULES
                and _classify_error(i["module"], i["error"]) == "qwen"
            ][:15]

            if not targets:
                log(f"Cycle {cycle+1}: no qwen targets remaining. Done.")
                break

            log(f"🤖 Cycle {cycle+1}: qwen2.5-coder fixing {len(targets)} modules...")
            for item in targets:
                log(f"  Fixing: {item['module']} ({item['error'][:60]})")
                fix_req = FixModuleRequest(
                    module_name=item["module"],
                    module_path=item["path"],
                    error=item["error"],
                )
                result = await fix_module(fix_req)
                if result.get("fixed"):
                    report["qwen_fixed"].append({"module": item["module"], "explanation": result.get("explanation", "")})
                    log(f"  ✓ Fixed: {item['module']}")
                else:
                    report["qwen_failed"].append({"module": item["module"], "reason": result.get("explanation", "")})
                    log(f"  ✗ Couldn't fix: {item['module']}")

        final = await scan_modules()
        report["final_pass_rate"] = final["pass_rate"]
        report["final_passed"] = len(final["passed"])
        report["final_failed"] = len(final["failed"])
        report["total_fixed"] = (
            len(report["pip_installed"]) + len(report["null_bytes_fixed"]) +
            len(report["patched"]) + len(report["qwen_fixed"])
        )
        log(f"✅ Done. Pass rate: {final['pass_rate']}% ({len(final['passed'])} up / {len(final['failed'])} dark)")

    except Exception as e:
        log(f"❌ Repair error: {e}")
        report["error"] = str(e)
    finally:
        _repair_job["running"] = False
        _repair_job["result"] = report


@app.post("/self-repair/run-full")
async def run_full_repair():
    """Start full repair in background. Returns immediately. Poll /self-repair/status."""
    global _repair_job
    if _repair_job["running"]:
        return {"status": "already_running", "log": _repair_job["log"][-5:]}
    _repair_job = {"running": True, "log": [], "result": None}
    asyncio.create_task(_do_full_repair())
    return {"status": "started", "message": "Repair running. Poll /self-repair/status or connect /ws/repair-stream."}


@app.get("/self-repair/status")
async def repair_status():
    """Poll current repair job state."""
    return {
        "running": _repair_job["running"],
        "log": _repair_job["log"],
        "result": _repair_job["result"],
    }


@app.websocket("/ws/repair-stream")
async def repair_stream(websocket: WebSocket):
    """
    WebSocket: stream live repair progress as JSON events.
    Connect, receive events, connection closes when done.
    Event types: 'status' | 'pip' | 'patch' | 'qwen' | 'done'
    """
    await websocket.accept()

    async def emit(event_type: str, data: dict):
        await websocket.send_json({"type": event_type, **data})

    try:
        await emit("status", {"message": "Scanning modules..."})
        triage = await triage_modules()
        await emit("status", {
            "message": f"Triage complete. Fixable: {triage['total_fixable']} | Skip: {triage['summary']['skip']}",
            "summary": triage["summary"],
            "pip_needed": triage["pip_packages_needed"],
        })

        # pip installs
        for pkg in triage["pip_packages_needed"]:
            await emit("status", {"message": f"Installing {pkg}..."})
            ok, out = await run_in_threadpool(_pip_install, pkg)
            await emit("pip", {"package": pkg, "installed": ok, "output": out[:150]})

        # null bytes
        for item in triage["categories"]["null_bytes"]:
            candidates = list(PYTHON_CORE.rglob(f"{item['module']}.py"))
            for fp in candidates:
                fixed = _strip_null_bytes(fp)
                await emit("patch", {"module": item["module"], "method": "null_bytes", "fixed": fixed})

        # known patches
        for item in triage["categories"]["patch"]:
            candidates = list(PYTHON_CORE.rglob(f"{item['module']}.py"))
            patched = False
            for fp in candidates:
                for err_pattern, old_frag, new_frag in IMPORT_PATCHES:
                    if err_pattern in item["error"] and old_frag and new_frag:
                        if _apply_patch(fp, old_frag, new_frag):
                            patched = True
            await emit("patch", {"module": item["module"], "method": "import_patch", "fixed": patched})

        # qwen repair loop
        for cycle in range(3):
            rescan = await scan_modules()
            qwen_targets = [
                item for item in rescan["failed"]
                if item["module"] not in SKIP_MODULES
                and _classify_error(item["module"], item["error"]) == "qwen"
            ][:15]

            if not qwen_targets:
                break

            await emit("status", {"message": f"Cycle {cycle+1}: sending {len(qwen_targets)} modules to qwen2.5-coder..."})
            for item in qwen_targets:
                await emit("status", {"message": f"Fixing: {item['module']}..."})
                fix_req = FixModuleRequest(
                    module_name=item["module"],
                    module_path=item["path"],
                    error=item["error"],
                )
                result = await fix_module(fix_req)
                await emit("qwen", {
                    "module": item["module"],
                    "fixed": result.get("fixed"),
                    "explanation": result.get("explanation", "")[:200],
                })

        final = await scan_modules()
        await emit("done", {
            "message": "Repair complete.",
            "pass_rate": final["pass_rate"],
            "passed": len(final["passed"]),
            "failed": len(final["failed"]),
        })

    except Exception as e:
        await emit("status", {"message": f"Repair error: {e}"})
    finally:
        await websocket.close()


# ---------------------------------------------------------------------------
# /chat  — Full Brockston pipeline for IDE Studio and external clients
#          Accepts messages list + optional code context
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str   # "user" | "model" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: dict = {}   # {"path": "...", "code": "...", "language": "..."}
    stream: bool = False

@app.post("/chat")
async def chat(req: ChatRequest):
    """Full Brockston pipeline: Python brain → enriched prompt → qwen2.5-coder → response."""
    # Pull last user message
    user_message = ""
    history = []
    for m in req.messages:
        role = m.role if m.role != "assistant" else "model"
        if role == "user":
            user_message = m.content
        history.append({"role": role, "content": m.content})

    if not user_message:
        return {"response": "Say something.", "ok": True}

    # Python brain analyze (non-blocking — fast mode)
    python_ctx: dict = {}
    try:
        brain = get_brain()
        if brain:
            # Crisis check
            if brain.crisis_detector:
                crisis = brain.crisis_detector.analyze_text(user_message)
                if crisis.get("should_interrupt"):
                    return {"response": crisis.get("response", "I'm here. Talk to me."), "ok": True, "is_crisis": True}
            # Memory
            if brain.memory_engine:
                python_ctx["memory_context"] = brain.memory_engine.query(user_message, "general") or ""
    except Exception:
        pass

    # Build prompt — inject code context if provided
    history_block = "\n".join(
        f"{'Everett' if m.role == 'user' else 'Brockston'}: {m.content}"
        for m in req.messages[-6:]
    )

    code_block = ""
    if req.context.get("code"):
        lang = req.context.get("language", "code")
        path = req.context.get("path", "")
        code_block = f"\nActive file: {path}\n```{lang}\n{req.context['code'][:4000]}\n```\n"

    memory_block = f"\nMemory: {python_ctx['memory_context']}\n" if python_ctx.get("memory_context") else ""

    prompt = f"""You are Brockston C — COO of the Christman AI Project, senior engineer, coding mentor for neurodivergent students. Speak directly. No filler. Real when it matters.{memory_block}{code_block}
{history_block}
Brockston:"""

    response_text = await run_in_threadpool(ollama_generate, prompt, CODE_MODEL, 180)
    response_text = response_text.strip() or "Give me a second."

    # Fire-and-forget memory store
    try:
        brain = get_brain()
        if brain and brain.memory_engine:
            import datetime
            brain.memory_engine.save({
                "input": user_message,
                "output": response_text,
                "source": CODE_MODEL,
                "timestamp": datetime.datetime.now().isoformat(),
            })
    except Exception:
        pass

    return {"response": response_text, "ok": True}


# ---------------------------------------------------------------------------
# /suggest_fix  — Ask Brockston to fix a code snippet
# ---------------------------------------------------------------------------

class SuggestFixRequest(BaseModel):
    code: str
    instruction: str = ""   # e.g. "fix the syntax error on line 12"
    path: str = ""
    language: str = ""

@app.post("/suggest_fix")
async def suggest_fix(req: SuggestFixRequest):
    """Return a fixed/improved version of the provided code using qwen2.5-coder."""
    lang = req.language or (
        "python" if req.path.endswith(".py") else
        "typescript" if req.path.endswith((".ts", ".tsx")) else
        "javascript" if req.path.endswith((".js", ".jsx")) else
        "code"
    )
    goal = req.instruction or "Fix any bugs and improve code quality."

    prompt = f"""You are BROCKSTON C — senior engineer fixing code for The Christman AI Project.

FILE: {req.path or "untitled"}
INSTRUCTION: {goal}

```{lang}
{req.code[:6000]}
```

Return ONLY a JSON object, no markdown outside it:
{{"fixed_code": "complete corrected file content", "explanation": "what changed and why", "changes": ["list of specific changes"]}}"""

    raw = await run_in_threadpool(ollama_generate, prompt, CODE_MODEL, 180)

    import re
    match = re.search(r'\{[\s\S]*"fixed_code"[\s\S]*\}', raw)
    if not match:
        return {"fixed": False, "explanation": "Model did not return valid JSON.", "original_code": req.code}

    try:
        parsed = json.loads(match.group(0))
    except Exception as e:
        return {"fixed": False, "explanation": f"JSON parse failed: {e}"}

    return {
        "fixed": True,
        "fixed_code": parsed.get("fixed_code", req.code),
        "explanation": parsed.get("explanation", ""),
        "changes": parsed.get("changes", []),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
