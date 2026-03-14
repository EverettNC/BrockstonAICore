#!/usr/bin/env python3
"""Enhance Derek's think() method to use knowledge trussle RAG"""

with open("brain_core.py", "r") as f:
    content = f.read()

# Find the section where we try knowledge_engine in think()
old_knowledge_logic = """            # 📚 Try Knowledge Engine for domain-specific reasoning
            if self.knowledge_engine:
                try:
                    knowledge_response = self.knowledge_engine.query(input_text)
                    if knowledge_response:
                        repaired_result = knowledge_response
                        logger.info("📚 Response from Knowledge Engine")
                    else:
                        # Fall back to executor if no knowledge found
                        raw_result = execute_task(input_text, intent, memory_context)
                        repaired_result = self.run_self_repair(input_text, raw_result)
                except Exception as e:
                    logger.warning(f"Knowledge engine failed: {e}")
                    raw_result = execute_task(input_text, intent, memory_context)
                    repaired_result = self.run_self_repair(input_text, raw_result)
            else:
                # Original logic if knowledge engine unavailable
                raw_result = execute_task(input_text, intent, memory_context)
                repaired_result = self.run_self_repair(input_text, raw_result)"""

new_knowledge_logic = """            # 📚 Try Knowledge Trussle RAG for domain-specific queries
            if self.knowledge_rag:
                try:
                    # Determine namespace from query keywords
                    namespace = "neurodivergency"  # default
                    if any(kw in input_text.lower() for kw in ["autism", "autistic", "asd", "spectrum"]):
                        namespace = "neurodivergency"
                    elif any(kw in input_text.lower() for kw in ["code", "coding", "algorithm", "programming"]):
                        namespace = "master_coding"
                    
                    rag_result = self.knowledge_rag.ask(namespace, input_text, k=6)
                    if rag_result.get("answer") and rag_result.get("confidence", 0) > 0.3:
                        repaired_result = rag_result["answer"]
                        logger.info(f"📚 Response from Knowledge Trussle RAG (confidence: {rag_result['confidence']:.2f})")
                    else:
                        # Try legacy knowledge engine
                        if self.knowledge_engine:
                            knowledge_response = self.knowledge_engine.query(input_text)
                            if knowledge_response:
                                repaired_result = knowledge_response
                                logger.info("📚 Response from Knowledge Engine")
                            else:
                                raw_result = execute_task(input_text, intent, memory_context)
                                repaired_result = self.run_self_repair(input_text, raw_result)
                        else:
                            raw_result = execute_task(input_text, intent, memory_context)
                            repaired_result = self.run_self_repair(input_text, raw_result)
                except Exception as e:
                    logger.warning(f"Knowledge Trussle RAG failed: {e}")
                    raw_result = execute_task(input_text, intent, memory_context)
                    repaired_result = self.run_self_repair(input_text, raw_result)
            elif self.knowledge_engine:
                try:
                    knowledge_response = self.knowledge_engine.query(input_text)
                    if knowledge_response:
                        repaired_result = knowledge_response
                        logger.info("📚 Response from Knowledge Engine")
                    else:
                        raw_result = execute_task(input_text, intent, memory_context)
                        repaired_result = self.run_self_repair(input_text, raw_result)
                except Exception as e:
                    logger.warning(f"Knowledge engine failed: {e}")
                    raw_result = execute_task(input_text, intent, memory_context)
                    repaired_result = self.run_self_repair(input_text, raw_result)
            else:
                # Original logic if no knowledge systems available
                raw_result = execute_task(input_text, intent, memory_context)
                repaired_result = self.run_self_repair(input_text, raw_result)"""

content = content.replace(old_knowledge_logic, new_knowledge_logic)

with open("brain_core.py", "w") as f:
    f.write(content)

print("✅ Enhanced think() method with Knowledge Trussle RAG!")
print("\nDerek can now answer domain-specific questions using:")
print("  • Autism spectrum & neurodivergency knowledge")
print("  • Coding & algorithm expertise")
print("  • Hybrid search (keyword + semantic)")
print("  • Confidence scoring for answers")
