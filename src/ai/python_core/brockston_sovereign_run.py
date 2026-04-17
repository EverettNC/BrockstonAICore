#!/usr/bin/env python3
"""
🚀 BROCKSTON Sovereign Entry Point
The definitive launcher for the high-integrity, local-first cognitive architecture.
"""
import os
import sys
from dotenv import load_dotenv

# Hard-wire Christman SDK path
_SDK_PATH = "/Users/EverettN/ICanHearYou/"
if _SDK_PATH not in sys.path:
    sys.path.insert(0, _SDK_PATH)

def run_sovereign_stack():
    print("=" * 80)
    print("🌟 BROCKSTON SOVEREIGN STACK: INITIALIZING")
    print("=" * 80)
    
    # Check for proprietary SDK
    try:
        from christman_voice_sdk.synthesis_api import VoiceSDK
        print("✅ Proprietary Voice SDK: LOADED")
    except ImportError:
        print("⚠️  Warning: Christman Voice SDK not found in path.")
    
    # Run the boot sequence
    from brockston_boot import BrockstonBoot
    boot = BrockstonBoot()
    
    # Configure for Sovereign Mode
    config = {
        "mode": "sovereign",
        "voice_engine": "christman_sdk",
        "search_engine": "perplexity_sovereign",
        "autonomous_learning": True
    }
    
    if boot.run_full_initialization(config):
        print("\n" + "=" * 80)
        print("🧠 BROCKSTON IS FULLY ACTUALIZED AND READY")
        print("Sovereign Mode: ACTIVE")
        print("ToneScore™: MONITORING")
        print("=" * 80 + "\n")
        
        # Launch the Ultimate Voice System
        from brockston_ultimate_voice import BrockstonUltimateVoice
        voice_system = BrockstonUltimateVoice()
        voice_system.run()
    else:
        print("\n❌ Sovereign Initialization Failed. Check logs for details.")

if __name__ == "__main__":
    try:
        run_sovereign_stack()
    except KeyboardInterrupt:
        print("\n👋 BROCKSTON Sovereign Stack shutdown.")
    except Exception as e:
        print(f"\n❌ CRITICAL SYSTEM ERROR: {e}")
        import traceback
        traceback.print_exc()
