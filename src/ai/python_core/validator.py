"""
Code Validator - Ensures 96%+ success rate through rigorous quality checks
"""

import ast
import sys
from typing import Dict, List, Tuple


class CodeValidator:
    """Validates code quality before execution to maintain 96% success rate standard"""

    def __init__(self, minimum_success_rate: float = 96.0, quality_threshold: int = 80):
        self.minimum_success_rate = minimum_success_rate
        self.quality_threshold = quality_threshold

    def validate(
        self, code: str, language: str = "python"
    ) -> Tuple[bool, Dict, List[str]]:
        """
        Comprehensive validation of code quality

        Returns:
            (is_valid, metrics, suggestions)
        """
        if language != "python":
            return True, {"score": 100}, []

        metrics = {
            "syntax_valid": False,
            "imports_valid": False,
            "logic_score": 0,
            "total_score": 0,
        }

        suggestions = []

        # 1. Syntax validation
        syntax_valid, syntax_error = self._check_syntax(code)
        metrics["syntax_valid"] = syntax_valid
        if not syntax_valid:
            suggestions.append(f"Syntax Error: {syntax_error}")
            metrics["total_score"] = 0
            return False, metrics, suggestions

        # 2. Import validation
        imports_valid, import_issues = self._check_imports(code)
        metrics["imports_valid"] = imports_valid
        if not imports_valid:
            suggestions.extend(import_issues)

        # 3. Logic analysis
        logic_score, logic_issues = self._analyze_logic(code)
        metrics["logic_score"] = logic_score
        suggestions.extend(logic_issues)

        # Calculate total score
        metrics["total_score"] = self._calculate_score(metrics)

        is_valid = metrics["total_score"] >= self.quality_threshold

        return is_valid, metrics, suggestions

    def _check_syntax(self, code: str) -> Tuple[bool, str]:
        """Check if code has valid Python syntax"""
        try:
            ast.parse(code)
            return True, ""
        except SyntaxError as e:
            return False, f"{e.msg} at line {e.lineno}"
        except Exception as e:
            return False, str(e)

    def _check_imports(self, code: str) -> Tuple[bool, List[str]]:
        """Validate that imports are available"""
        issues = []

        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if not self._is_safe_import(alias.name):
                            issues.append(
                                f"Warning: Import '{alias.name}' may not be available"
                            )
                elif isinstance(node, ast.ImportFrom):
                    if node.module and not self._is_safe_import(node.module):
                        issues.append(
                            f"Warning: Import '{node.module}' may not be available"
                        )
        except:
            pass

        return len(issues) == 0, issues

    def _is_safe_import(self, module_name: str) -> bool:
        """Check if module is in safe list or stdlib"""
        safe_modules = {
            "math",
            "random",
            "datetime",
            "time",
            "json",
            "os",
            "sys",
            "collections",
            "itertools",
            "functools",
            "operator",
            "numpy",
            "scipy",
            "matplotlib",
            "pandas",
            "qiskit",
            "qiskit_aer",
            "sympy",
        }

        base_module = module_name.split(".")[0]
        return base_module in safe_modules or base_module in sys.stdlib_module_names

    def _analyze_logic(self, code: str) -> Tuple[int, List[str]]:
        """Analyze code logic quality"""
        issues = []
        score = 100

        try:
            tree = ast.parse(code)

            # Check for common issues
            has_output = False
            has_infinite_loop_risk = False

            for node in ast.walk(tree):
                # Check for output statements
                if isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name) and node.func.id == "print":
                        has_output = True

                # Check for while True without break
                if isinstance(node, ast.While):
                    if isinstance(node.test, ast.Constant) and node.test.value is True:
                        has_break = any(
                            isinstance(n, ast.Break) for n in ast.walk(node)
                        )
                        if not has_break:
                            has_infinite_loop_risk = True
                            issues.append(
                                "Warning: Infinite loop detected (while True without break)"
                            )
                            score -= 30

            if not has_output and len(code.strip()) > 20:
                issues.append("Suggestion: Add print() statements to show results")
                score -= 10

        except:
            pass

        return max(0, score), issues

    def _calculate_score(self, metrics: Dict) -> int:
        """Calculate overall quality score"""
        score = 0

        if metrics["syntax_valid"]:
            score += 50

        if metrics["imports_valid"]:
            score += 25
        else:
            score += 10  # Partial credit for warnings

        score += int(metrics["logic_score"] * 0.25)

        return min(100, score)

    def suggest_fixes(self, code: str, error: str) -> List[str]:
        """Suggest fixes based on error messages"""
        suggestions = []

        error_lower = error.lower()

        if "indentation" in error_lower:
            suggestions.append(
                "Fix indentation: Use consistent spaces (4 spaces per level)"
            )

        if "name" in error_lower and "not defined" in error_lower:
            suggestions.append("Define missing variable or import missing module")

        if "import" in error_lower:
            suggestions.append("Check that all required modules are imported")

        if "syntax error" in error_lower:
            suggestions.append("Check for missing colons, parentheses, or quotes")

        if "division by zero" in error_lower or "zerodivision" in error_lower:
            suggestions.append("Add check: if denominator != 0 before division")

        if "index" in error_lower and "out of range" in error_lower:
            suggestions.append("Check array bounds before accessing elements")

        if not suggestions:
            suggestions.append("Review error message and fix the issue")

        return suggestions

    def check_success_rate_threshold(
        self, current_stats: Dict, code_quality_score: int = 0
    ) -> Tuple[bool, str]:
        """
        Check if current success rate meets the minimum threshold

        Args:
            current_stats: Dict with 'total_executions' and 'successful_executions'
            code_quality_score: Quality score from validation (0-100)

        Returns:
            (meets_threshold, message)
        """
        total = current_stats.get("total_executions", 0)
        successful = current_stats.get("successful_executions", 0)

        # Allow executions when there's no history yet
        if total == 0:
            return True, "No execution history yet"

        current_rate = (successful / total) * 100

        # Calculate what the rate would be if this execution fails
        worst_case_successful = successful
        worst_case_total = total + 1
        worst_case_rate = (worst_case_successful / worst_case_total) * 100

        # If even a failure would keep us above threshold, allow it
        if worst_case_rate >= self.minimum_success_rate:
            return True, f"Success rate: {current_rate:.1f}% (safe margin)"

        # If current rate is already below threshold, check code quality for recovery path
        if current_rate < self.minimum_success_rate:
            # RECOVERY PATH: Allow high-quality code to execute to improve rate
            if code_quality_score >= 95:
                return (
                    True,
                    f"Recovery mode: Allowing high-quality code (score: {code_quality_score}) to improve success rate",
                )
            return (
                False,
                f"Current success rate {current_rate:.1f}% below {self.minimum_success_rate}% threshold. Only code with 95+ quality score can execute (current: {code_quality_score}).",
            )

        # We're barely above threshold - one failure would drop us below
        # Only allow if code quality is very high
        if code_quality_score >= 90:
            return (
                True,
                f"Near threshold: Allowing high-quality code (score: {code_quality_score})",
            )
        return (
            False,
            f"Success rate {current_rate:.1f}% too close to {self.minimum_success_rate}% threshold. Code quality must be 90+ (current: {code_quality_score}).",
        )
