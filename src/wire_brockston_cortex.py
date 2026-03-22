#!/usr/bin/env python3
"""Wire brockston_cortex into BROCKSTON's brain"""

with open("brain_core.py", "r") as f:
    content = f.read()

# Add brockston_cortex import after other cortex imports
cortex_import = """
# BROCKSTON Cortex - Advanced Reasoning Engine
try:
    from brockston_cortex import BROCKSTONCortex, ReasonerConfig
    brockston_cortex_available = True
except ImportError:
    logger.warning("BROCKSTON Cortex not available")
    brockston_cortex_available = False
"""

# Check if not already added
if "brockston_cortex_available" not in content:
    # Find knowledge_trussle import section
    insert_point = content.find("knowledge_trussle_available = False")
    if insert_point != -1:
        end_of_line = content.find("\n", insert_point)
        content = (
            content[: end_of_line + 1] + cortex_import + content[end_of_line + 1 :]
        )
        print("✅ Added brockston_cortex import")

# Add cortex initialization in __init__
init_code = """
        # 🧠 BROCKSTON CORTEX - Ferrari-level Advanced Reasoning
        self.cortex = None
        if brockston_cortex_available:
            try:
                self.cortex = BROCKSTONCortex(cfg=ReasonerConfig())
                logger.info("🧠 BROCKSTON Cortex (Ferrari) initialized - Advanced reasoning active")
            except Exception as e:
                logger.warning(f"BROCKSTON Cortex failed to initialize: {e}")
"""

# Check if not already added
if "self.cortex = None" not in content:
    # Find after knowledge_rag initialization
    search_str = 'logger.warning(f"Knowledge Trussle failed to initialize: {e}")'
    insert_point = content.find(search_str)
    if insert_point != -1:
        end_of_line = content.find("\n", insert_point)
        content = content[: end_of_line + 1] + init_code + content[end_of_line + 1 :]
        print("✅ Added brockston_cortex initialization")

with open("brain_core.py", "w") as f:
    f.write(content)

print("\n🏎️ BROCKSTON Cortex (Ferrari) wired into brain!")
print("   - Advanced multi-step reasoning")
print("   - Tool registry (arithmetic, dates, etc)")
print("   - Classifier → Planner → Verifier → Ensemble")
print("   - Local KB integration")
