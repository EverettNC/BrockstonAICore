#!/usr/bin/env python3
"""Enhance think() to use BROCKSTON Cortex for complex reasoning"""

with open("brain_core.py", "r") as f:
    content = f.read()

# Find the question handling section and add cortex before local reasoning
old_logic = """            # 🧠 CORTEX REASONING - Try local reasoning first, then web search
            if self.local_reasoning:"""

new_logic = """            # 🏎️ BROCKSTON CORTEX - Ferrari-level reasoning for complex queries
            cortex_keywords = ["calculate", "compute", "solve", "what is", "how many", "when is"]
            use_cortex = any(kw in input_text.lower() for kw in cortex_keywords)
            
            if use_cortex and self.cortex:
                try:
                    logger.info("🏎️ Using BROCKSTON Cortex for complex reasoning")
                    cortex_result = self.cortex.analyze(input_text)
                    if cortex_result.confidence > 0.5:
                        repaired_result = f"{cortex_result.final_answer} (confidence: {cortex_result.confidence:.2f})"
                        logger.info(f"🏎️ Cortex solved it! Tools used: {cortex_result.used_tools}")
                    else:
                        # Cortex not confident, fall through to other methods
                        raise Exception("Cortex confidence too low")
                except Exception as e:
                    logger.debug(f"Cortex couldn't solve, trying other methods: {e}")
                    # Continue to local reasoning
                    use_cortex = False
            
            # 🧠 LOCAL REASONING - Try local AI if cortex didn't handle it
            if not use_cortex and self.local_reasoning:"""

content = content.replace(old_logic, new_logic)

with open("brain_core.py", "w") as f:
    f.write(content)

print("✅ Enhanced think() with BROCKSTON Cortex!")
print("\nCortex will handle:")
print("  • Calculations (calculate, compute, solve)")
print("  • Math queries (what is 12 + 5)")
print("  • Counting (how many)")
print("  • Date queries (when is)")
print("\nFlow: Cortex → Local Reasoning → Knowledge Trussle → Web Search")
