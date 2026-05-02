"""
Test configuration for BROCKSTON C test suite.
Sets up sys.path so tests can import from python_core.
"""
import sys
from pathlib import Path

# Add python_core to path
PYTHON_CORE = Path(__file__).parent.parent / "src" / "ai" / "python_core"
if str(PYTHON_CORE) not in sys.path:
    sys.path.insert(0, str(PYTHON_CORE))

# Add repo root to path so SOUL.py can be imported
ROOT = Path(__file__).parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))
