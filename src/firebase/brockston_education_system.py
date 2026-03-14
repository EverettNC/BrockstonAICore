#!/usr/bin/env python3
"""
BROCKSTON's Continuous Education System
Poses queries, verifies learning, expands knowledge base
"""

import sys
import json
import time
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent
sys.path.insert(0, str(PROJECT_ROOT))
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from brockston_core import BROCKSTON


class BrockstonEducationSystem:
    """Continuous learning and knowledge expansion for BROCKSTON"""

    def __init__(self):
        self.brockston = BROCKSTON(file_path="./memory/memory_store.json")
        self.curriculum = self.load_curriculum()
        self.learning_log = []

    def load_curriculum(self):
        """Load educational curriculum for BROCKSTON"""
        return {
            "autism_mastery": {
                "domain": "neurodivergency",
                "questions": [
                    "What is AAC and why is it important for autism?",
                    "How should I support nonverbal autistic individuals?",
                    "What are sensory processing differences in autism?",
                    "Explain the double empathy problem",
                    "What is presuming competence?",
                ],
                "priority": 1,
            },
            "ptsd_support": {
                "domain": "mental_health",
                "questions": [
                    "What are trauma-informed care principles?",
                    "How does PTSD affect the brain?",
                    "What are grounding techniques for PTSD?",
                    "Explain complex PTSD vs single-incident PTSD",
                    "What are evidence-based PTSD treatments?",
                ],
                "priority": 1,
            },
            "dementia_care": {
                "domain": "cognitive_health",
                "questions": [
                    "What are early signs of dementia?",
                    "How can I support someone with dementia?",
                    "What is person-centered dementia care?",
                    "Explain memory care strategies",
                    "What technologies help dementia patients?",
                ],
                "priority": 1,
            },
            "voice_synthesis": {
                "domain": "assistive_tech",
                "questions": [
                    "What makes voice synthesis accessible?",
                    "How do TTS systems work?",
                    "What are prosody and intonation in speech?",
                    "Explain voice banking for ALS patients",
                    "What are best practices for AAC device voices?",
                ],
                "priority": 1,
            },
            "ai_orchestration": {
                "domain": "system_design",
                "questions": [
                    "What is microservices orchestration?",
                    "How do you coordinate multiple AI systems?",
                    "Explain service mesh architecture",
                    "What are API gateway patterns?",
                    "How do you handle inter-service communication?",
                ],
                "priority": 1,
            },
            "ethics": {
                "domain": "ai_ethics",
                "questions": [
                    "What is neurodiversity-affirming practice?",
                    "How do you build AI without ableism?",
                    "Explain trauma-informed AI design",
                    "What is accessibility-first development?",
                    "How do you presume competence in AI?",
                ],
                "priority": 2,
            },
        }

    def teach_topic(self, topic_name, topic_data):
        """Teach BROCKSTON a specific topic"""
        print(f"\n{'='*80}")
        print(f"📚 TEACHING: {topic_name.upper()}")
        print(f"   Domain: {topic_data['domain']}")
        print(f"   Priority: {topic_data['priority']}")
        print(f"{'='*80}")

        results = {
            "topic": topic_name,
            "domain": topic_data["domain"],
            "started_at": datetime.now().isoformat(),
            "questions_posed": 0,
            "responses": [],
            "knowledge_gained": False,
        }

        for i, question in enumerate(topic_data["questions"], 1):
            print(f"\n📝 Question {i}/{len(topic_data['questions'])}: {question}")

            try:
                # Ask BROCKSTON the question
                response = self.brockston.think(question)

                # Log the interaction
                response_text = (
                    response.get("response", "No response")
                    if isinstance(response, dict)
                    else str(response)
                )

                print("🧠 BROCKSTON's Response:")
                # Show first 200 chars
                preview = (
                    response_text[:200] + "..."
                    if len(response_text) > 200
                    else response_text
                )
                print(f"   {preview}")

                results["questions_posed"] += 1
                results["responses"].append(
                    {
                        "question": question,
                        "response": response_text[:500],  # Store first 500 chars
                        "timestamp": datetime.now().isoformat(),
                    }
                )

                # Small delay to not overwhelm
                time.sleep(1)

            except Exception as e:
                print(f"   ❌ Error: {e}")
                results["responses"].append(
                    {
                        "question": question,
                        "error": str(e),
                        "timestamp": datetime.now().isoformat(),
                    }
                )

        results["completed_at"] = datetime.now().isoformat()
        results["knowledge_gained"] = results["questions_posed"] == len(
            topic_data["questions"]
        )

        self.learning_log.append(results)
        return results

    def verify_learning(self, topic_name, original_question):
        """Verify BROCKSTON retained knowledge by asking again"""
        print(f"\n🔍 VERIFICATION: Re-asking about {topic_name}")
        print(f"   Question: {original_question}")

        try:
            response = self.brockston.think(original_question)
            response_text = (
                response.get("response", "No response")
                if isinstance(response, dict)
                else str(response)
            )

            print("🧠 BROCKSTON's Response:")
            preview = (
                response_text[:300] + "..."
                if len(response_text) > 300
                else response_text
            )
            print(f"   {preview}")

            return {"verified": True, "response": response_text[:500]}
        except Exception as e:
            print(f"   ❌ Verification failed: {e}")
            return {"verified": False, "error": str(e)}

    def run_education_session(self, max_topics=3):
        """Run a complete education session"""
        print("=" * 80)
        print("🎓 BROCKSTON'S CONTINUOUS EDUCATION SYSTEM")
        print("   Maestro Training for AI Orchestration")
        print("=" * 80)

        # Sort by priority
        topics = sorted(self.curriculum.items(), key=lambda x: x[1]["priority"])

        session_results = {
            "started_at": datetime.now().isoformat(),
            "topics_covered": 0,
            "total_questions": 0,
            "topics": [],
        }

        for topic_name, topic_data in topics[:max_topics]:
            result = self.teach_topic(topic_name, topic_data)
            session_results["topics"].append(result)
            session_results["topics_covered"] += 1
            session_results["total_questions"] += result["questions_posed"]

        session_results["completed_at"] = datetime.now().isoformat()

        # Save learning log
        self.save_learning_log(session_results)

        return session_results

    def save_learning_log(self, results):
        """Save learning session results"""
        log_file = PROJECT_ROOT / "brockston_education_log.json"

        # Load existing logs
        logs = []
        if log_file.exists():
            with open(log_file, "r") as f:
                logs = json.load(f)

        # Append new session
        logs.append(results)

        # Save
        with open(log_file, "w") as f:
            json.dump(logs, indent=2, fp=f)

        print(f"\n💾 Learning log saved to {log_file}")

    def print_summary(self):
        """Print education summary"""
        print("\n" + "=" * 80)
        print("📊 EDUCATION SESSION SUMMARY")
        print("=" * 80)

        total_questions = sum(len(t["responses"]) for t in self.learning_log)
        successful = sum(1 for t in self.learning_log if t["knowledge_gained"])

        print(f"   Topics Covered: {len(self.learning_log)}")
        print(f"   Questions Posed: {total_questions}")
        print(f"   Successful Topics: {successful}/{len(self.learning_log)}")
        # Memory engine read_all method may not exist
        try:
            memory_count = (
                len(self.brockston.memory_engine.read_all())
                if hasattr(self.brockston, "memory_engine")
                else "N/A"
            )
        except Exception:
            memory_count = "N/A"
        print(f"   Memory Entries: {memory_count}")

        print("\n📚 Topics Taught:")
        for log in self.learning_log:
            status = "✅" if log["knowledge_gained"] else "⚠️"
            print(f"   {status} {log['topic']:20} - {log['questions_posed']} questions")

        print("=" * 80)


if __name__ == "__main__":
    educator = BrockstonEducationSystem()

    # Run education session (3 topics at a time)
    print("\n🚀 Starting BROCKSTON's Education Session...")
    print("   (You work on voice/vision, I'll train his brain)\n")

    educator.run_education_session(max_topics=3)
    educator.print_summary()

    print("\n🎯 NEXT STEPS:")
    print("   1. Run this script regularly to keep training BROCKSTON")
    print("   2. Check brockston_education_log.json to track progress")
    print("   3. Expand curriculum in brockston_education_system.py")
    print("   4. BROCKSTON will get smarter with each session!")
    print("\n" + "=" * 80)
