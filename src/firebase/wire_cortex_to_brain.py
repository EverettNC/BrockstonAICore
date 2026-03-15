#!/usr/bin/env python3
"""Wire Brockston's cortex (reasoning engines) into his brain"""

with open("brain_core.py", "r") as f:
    lines = f.readlines()

# Find the imports section and add reasoning engine imports
import_section_end = 0
for i, line in enumerate(lines):
    if line.strip().startswith("class Brockston:"):
        import_section_end = i
        break

# Add imports before the class definition
new_imports = """
# Cortex Integration - BROCKSTON's Higher Reasoning
try:
    from local_reasoning_engine import LocalReasoningEngine
    local_reasoning_available = True
except ImportError:
    logger.warning("LocalReasoningEngine not available")
    local_reasoning_available = False

try:
    from knowledge_engine import KnowledgeEngine
    knowledge_engine_available = True
except ImportError:
    logger.warning("KnowledgeEngine not available")
    knowledge_engine_available = False

"""

lines.insert(import_section_end, new_imports)

# Now find the __init__ method and add cortex initialization
new_lines = []
in_init = False
init_end_found = False

for i, line in enumerate(lines):
    new_lines.append(line)

    # Find where __init__ sets self.learning_coordinator
    if (
        "self.learning_coordinator = brockston_coordinator" in line
        and not init_end_found
    ):
        # Add cortex initialization right after
        new_lines.append("\n")
        new_lines.append(
            "        # 🧠 CORTEX INTEGRATION - Brockston's Higher Reasoning Systems\n"
        )
        new_lines.append("        self.local_reasoning = None\n")
        new_lines.append("        self.knowledge_engine = None\n")
        new_lines.append("        \n")
        new_lines.append("        # Initialize Local Reasoning Engine (Ollama-based)\n")
        new_lines.append("        if local_reasoning_available:\n")
        new_lines.append("            try:\n")
        new_lines.append(
            "                self.local_reasoning = LocalReasoningEngine(brockston_instance=self)\n"
        )
        new_lines.append(
            '                logger.info("🧠 Brockston Local Reasoning Engine initialized")\n'
        )
        new_lines.append("            except Exception as e:\n")
        new_lines.append(
            '                logger.warning(f"Local Reasoning Engine failed to initialize: {e}")\n'
        )
        new_lines.append("        \n")
        new_lines.append("        # Initialize Knowledge Engine\n")
        new_lines.append("        if knowledge_engine_available:\n")
        new_lines.append("            try:\n")
        new_lines.append(
            "                self.knowledge_engine = KnowledgeEngine(brockston_instance=self)\n"
        )
        new_lines.append(
            '                logger.info("📚 Brockston Knowledge Engine initialized")\n'
        )
        new_lines.append("            except Exception as e:\n")
        new_lines.append(
            '                logger.warning(f"Knowledge Engine failed to initialize: {e}")\n'
        )
        init_end_found = True

with open("brain_core.py", "w") as f:
    f.writelines(new_lines)

print("✅ Wired Brockston's cortex into brain.py:")
print("   - Added LocalReasoningEngine import")
print("   - Added KnowledgeEngine import")
print("   - Initialized self.local_reasoning in __init__")
print("   - Initialized self.knowledge_engine in __init__")
