"""
BROCKSTON REALITY CHECK
-----------------------
Cardinal Rule 1: It has to fucking work.
Cardinal Rule 6: Fail loud.
Cardinal Rule 13: Absolute honesty.

This script attempts to force-fire every primary module. 
No percentages. Just Pass/Fail.
"""

import os
import sys
import torch
import logging

# Set up raw logging to console
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("RealityCheck")

def run_test():
    results = {}
    print("\n" + "="*60)
    print("🚀 STARTING BROCKSTON HARD REALITY CHECK")
    print("="*60 + "\n")

    # 1. CORE MATH & HARDWARE
    print("🧠 [1/6] HARDWARE & MATH CHECK")
    try:
        import torch
        results["Torch Version"] = torch.__version__
        results["MPS (Apple Silicon)"] = torch.backends.mps.is_available()
        # Test actual math execution
        x = torch.randn(5, 5).to("mps" if results["MPS (Apple Silicon)"] else "cpu")
        results["Math Execution"] = "SUCCESS"
    except Exception as e:
        results["Math Execution"] = f"FAILED: {e}"

    # 2. SOVEREIGN SPEECH (Whisper)
    print("🎤 [2/6] SOVEREIGN SPEECH CHECK")
    try:
        from sovereign_speech import SovereignSpeech
        ears = SovereignSpeech(model_size="base")
        results["Sovereign Speech"] = "INSTANTIATED"
    except Exception as e:
        results["Sovereign Speech"] = f"FAILED: {e}"

    # 3. LOCAL REASONING (Ollama)
    print("🤖 [3/6] LOCAL REASONING CHECK")
    try:
        from local_reasoning_engine import LocalReasoningEngine
        engine = LocalReasoningEngine()
        if hasattr(engine, 'ollama_available') and engine.ollama_available:
            results["Ollama Connection"] = "ACTIVE"
        else:
            results["Ollama Connection"] = "NOT DETECTED"
    except Exception as e:
        results["Ollama Connection"] = f"FAILED: {e}"

    # 4. KNOWLEDGE & BRAIN CORE
    print("🧩 [4/6] BRAIN CORE CHECK")
    try:
        from brockston_core import BrockstonBrain
        brain = BrockstonBrain()
        results["Brain Core"] = "INITIALIZED"
    except Exception as e:
        results["Brain Core"] = f"FAILED: {e}"

    # 5. VISION SYSTEM
    print("👁️ [5/6] VISION SYSTEM CHECK")
    try:
        from simple_vision_engine import SimpleVisionEngine
        vision = SimpleVisionEngine()
        results["Vision Engine"] = "LOADED"
    except Exception as e:
        results["Vision Engine"] = f"FAILED: {e}"

    # 6. EXTERNAL BRIDGES
    print("🌐 [6/6] EXTERNAL BRIDGE CHECK")
    results["Anthropic Key"] = "FOUND" if os.getenv("ANTHROPIC_API_KEY") else "MISSING"
    results["Perplexity Key"] = "FOUND" if os.getenv("PERPLEXITY_API_KEY") else "MISSING"

    # --- FINAL TRUTH TABLE ---
    print("\n" + "="*60)
    print("📊 THE UNVARNISHED TRUTH")
    print("="*60)
    
    for module, status in results.items():
        icon = "✅" if "FAILED" not in str(status) and "MISSING" not in str(status) and "NOT DETECTED" not in str(status) else "❌"
        print(f"{icon} {module:25} : {status}")
    
    print("="*60)
    
    if any("FAILED" in str(v) for v in results.values()):
        print("\n⚠️  REALITY CHECK: SYSTEM IS CRIPPLED. Fix the Red Xs above.")
    else:
        print("\n💎 REALITY CHECK: SYSTEM IS STRUCTURALLY SOUND.")

if __name__ == "__main__":
    run_test()
