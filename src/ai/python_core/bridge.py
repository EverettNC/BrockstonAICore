"""
BROCKSTON Boot Bridge
---------------------
Spawned by python-bridge.ts as a child process.
Starts BrockstonBrain, prints READY, then loops on stdin
accepting JSON action requests.

Entry point: python3 src/ai/python_core/bridge.py
"""
import sys
import json
import os
import traceback
from pathlib import Path

# Wire paths — modules live in python_core/ and python_core/core/
base_path = os.path.dirname(os.path.abspath(__file__))
for p in [base_path, os.path.join(base_path, "core")]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from core.brockston_core import BrockstonBrain

    brain = BrockstonBrain()

    print(json.dumps({"status": "READY", "message": "Brockston Brain Core Online"}), flush=True)

    for line in sys.stdin:
        try:
            req = json.loads(line)
            action = req.get("action")

            if action == "think":
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

# ==============================================================================
# © 2025 Everett Nathaniel Christman & The Christman AI Project
# Cardinal Rule 1: It has to actually work.
# Cardinal Rule 6: Fail loud.
# Cardinal Rule 13: Absolute honesty about the code.
# ==============================================================================
