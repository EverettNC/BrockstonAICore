"""
Failure Analyzer - Identifies learning opportunities from code failures
"""

import re
from typing import List, Dict


class FailureAnalyzer:
    """Analyzes code failures to identify what knowledge BROCKSTON needs to learn"""

    def __init__(self):
        self.error_patterns = {
            "import": r"No module named ['\"]([^'\"]+)['\"]|cannot import name ['\"]([^'\"]+)['\"]",
            "undefined": r"name ['\"]([^'\"]+)['\"] is not defined",
            "attribute": r"'([^']+)' object has no attribute ['\"]([^'\"]+)['\"]",
            "syntax": r"invalid syntax|SyntaxError",
            "type": r"TypeError: (.+)",
            "value": r"ValueError: (.+)",
            "index": r"IndexError: (.+)",
            "key": r"KeyError: ['\"]([^'\"]+)['\"]",
            "zero_division": r"ZeroDivisionError|division by zero",
        }

    def analyze_failure(self, code: str, error: str, goal: str) -> Dict:
        """
        Analyze a failure and identify learning needs

        Returns:
            {
                'error_type': str,
                'learning_topics': List[str],
                'search_queries': List[str],
                'concepts': List[str],
                'severity': str  # 'critical', 'moderate', 'minor'
            }
        """
        error_type = self._classify_error(error)
        learning_topics = self._extract_topics(code, error, goal, error_type)
        search_queries = self._generate_search_queries(
            error_type, learning_topics, goal
        )
        concepts = self._extract_concepts(code, error, goal)
        severity = self._assess_severity(error_type, error)

        return {
            "error_type": error_type,
            "learning_topics": learning_topics,
            "search_queries": search_queries,
            "concepts": concepts,
            "severity": severity,
            "requires_learning": len(search_queries) > 0,
        }

    def _classify_error(self, error: str) -> str:
        """Classify the type of error"""
        error_lower = error.lower()

        for error_type, pattern in self.error_patterns.items():
            if re.search(pattern, error, re.IGNORECASE):
                return error_type

        return "unknown"

    def _extract_topics(
        self, code: str, error: str, goal: str, error_type: str
    ) -> List[str]:
        """Extract learning topics from the failure"""
        topics = []

        # Extract from error messages
        if error_type == "import":
            match = re.search(r"No module named ['\"]([^'\"]+)['\"]", error)
            if match:
                module = match.group(1)
                topics.append(f"Python {module} module")
                topics.append(f"How to use {module}")

        elif error_type == "undefined":
            match = re.search(r"name ['\"]([^'\"]+)['\"] is not defined", error)
            if match:
                name = match.group(1)
                topics.append(f"Python {name} function")
                topics.append(f"{name} usage examples")

        elif error_type == "attribute":
            match = re.search(
                r"'([^']+)' object has no attribute ['\"]([^'\"]+)['\"]", error
            )
            if match:
                obj_type, attr = match.group(1), match.group(2)
                topics.append(f"{obj_type} methods and attributes")
                topics.append(f"Python {obj_type} {attr}")

        # Extract from goal
        goal_lower = goal.lower()
        if "quantum" in goal_lower:
            topics.append("quantum computing basics")
            topics.append("qiskit tutorial")
        if "matrix" in goal_lower or "linear algebra" in goal_lower:
            topics.append("numpy linear algebra")
            topics.append("matrix operations python")
        if "plot" in goal_lower or "graph" in goal_lower or "visualiz" in goal_lower:
            topics.append("matplotlib tutorial")
            topics.append("python data visualization")

        return topics[:5]  # Limit to top 5 topics

    def _generate_search_queries(
        self, error_type: str, topics: List[str], goal: str
    ) -> List[str]:
        """Generate search queries for learning"""
        queries = []

        # Add topic-based queries
        for topic in topics[:3]:  # Top 3 topics
            queries.append(f"{topic} tutorial")
            queries.append(f"{topic} python examples")

        # Add error-specific queries
        if error_type == "import":
            queries.append("python module installation guide")
        elif error_type == "syntax":
            queries.append("python syntax best practices")
        elif error_type in ["type", "value"]:
            queries.append("python error handling patterns")

        # Prioritize educational sources
        educational_queries = [
            q
            for q in queries
            if any(
                kw in q.lower()
                for kw in ["tutorial", "guide", "examples", "basics", "introduction"]
            )
        ]

        return educational_queries[:5]  # Return top 5 queries

    def _extract_concepts(self, code: str, error: str, goal: str) -> List[str]:
        """Extract programming concepts involved"""
        concepts = []

        code_lower = code.lower()

        # Detect concepts from code
        if "class " in code_lower:
            concepts.append("object-oriented programming")
        if "def " in code_lower:
            concepts.append("functions")
        if "import" in code_lower:
            concepts.append("modules and imports")
        if any(kw in code_lower for kw in ["for ", "while "]):
            concepts.append("loops")
        if "if " in code_lower:
            concepts.append("conditionals")
        if any(kw in code_lower for kw in ["list", "dict", "set", "[]", "{}"]):
            concepts.append("data structures")
        if any(kw in code_lower for kw in ["numpy", "array", "matrix"]):
            concepts.append("numerical computing")
        if any(kw in code_lower for kw in ["quantum", "qubit", "circuit"]):
            concepts.append("quantum computing")

        return concepts[:5]

    def _assess_severity(self, error_type: str, error: str) -> str:
        """Assess failure severity"""
        critical_types = ["import", "syntax"]
        moderate_types = ["undefined", "attribute", "type"]

        if error_type in critical_types:
            return "critical"
        elif error_type in moderate_types:
            return "moderate"
        else:
            return "minor"

    def should_trigger_learning(self, analysis: Dict) -> bool:
        """Determine if this failure should trigger autonomous learning"""
        # Always learn from critical failures
        if analysis["severity"] == "critical":
            return True

        # Learn from moderate failures if we have clear topics
        if analysis["severity"] == "moderate" and len(analysis["learning_topics"]) > 0:
            return True

        # Learn if we have specific search queries
        if len(analysis["search_queries"]) > 2:
            return True

        return False
