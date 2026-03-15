import sys
import json
import os
import torch
import traceback
from pathlib import Path

# Add current dir and core to path for imports
base_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(base_path)
sys.path.append(os.path.join(base_path, "core"))

try:
    from synthesis_api import VoiceSDK
    from tonescore_api import compute_tonescore
    from Resonance_Capacitor import ResonanceCapacitor
    from utils.config import Tier
    from core.brockston_core import BrockstonBrain
    
    # Initialize components
    sdk = VoiceSDK(tier=Tier.ULTRA)
    resonance = ResonanceCapacitor()
    brain = BrockstonBrain() # Initialize the Ferrari Engine
    
    print(json.dumps({"status": "READY", "message": "Brockston Brain Core Online"}), flush=True)

    for line in sys.stdin:
        try:
            req = json.loads(line)
            action = req.get("action")
            
            if action == "analyze_tone":
                audio_path = req.get("audio_path")
                result = compute_tonescore(audio_path)
                print(json.dumps({
                    "status": "SUCCESS",
                    "action": action,
                    "data": {
                        "score": result.score,
                        "arousal": result.arousal,
                        "valence": result.valence,
                        "intensity": result.intensity,
                        "response_mode": result.response_mode
                    }
                }), flush=True)
                
            elif action == "quantify_resonance":
                agony = req.get("agony", 0)
                purpose = req.get("purpose", 0)
                result = resonance.quantify_state(agony, purpose)
                print(json.dumps({"status": "SUCCESS", "action": action, "data": result}), flush=True)
                
            elif action == "synthesize":
                text = req.get("text")
                tone_score = req.get("tone_score", 50)
                result = sdk.synthesize(text, tone_score=tone_score)
                print(json.dumps({"status": "SUCCESS", "action": action, "data": {"handle": str(result)}}), flush=True)
            
            elif action == "think":
                input_text = req.get("text")
                use_voice = req.get("use_voice", False)
                result = brain.think(input_text, use_voice=use_voice)
                print(json.dumps({"status": "SUCCESS", "action": action, "data": result}), flush=True)
                
            else:
                print(json.dumps({"status": "ERROR", "message": f"Unknown action: {action}"}), flush=True)
                
        except Exception as e:
            print(json.dumps({"status": "ERROR", "message": str(e), "trace": traceback.format_exc()}), flush=True)

except Exception as e:
    print(json.dumps({"status": "FATAL", "message": str(e), "trace": traceback.format_exc()}), flush=True)
    sys.exit(1)
