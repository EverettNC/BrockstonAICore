"""
Auto-Repair System - Automatically fixes common code issues to maintain 96%+ success rate
"""

import re
from typing import Tuple


class AutoRepair:
    """Automatically repairs common code issues"""

    MAX_REPAIR_ATTEMPTS = 3

    def attempt_repair(
        self, code: str, error: str, attempt: int = 1
    ) -> Tuple[str, str]:
        """
        Attempt to repair code based on error message

        Returns:
            (repaired_code, repair_description)
        """
        if attempt > self.MAX_REPAIR_ATTEMPTS:
            return code, "Max repair attempts reached"

        error_lower = error.lower()

        # Indentation errors
        if "indentation" in error_lower or "unexpected indent" in error_lower:
            return self._fix_indentation(code)

        # Missing imports
        if "name" in error_lower and "not defined" in error_lower:
            return self._add_missing_imports(code, error)

        # Syntax errors
        if "syntax error" in error_lower:
            return self._fix_common_syntax(code, error)

        # Missing colons
        if "invalid syntax" in error_lower and ":" in error:
            return self._add_missing_colons(code)

        # Unclosed strings/brackets
        if "eol while scanning" in error_lower or "eof while scanning" in error_lower:
            return self._fix_unclosed_structures(code)

        return code, "No automatic repair available"

    def _fix_indentation(self, code: str) -> Tuple[str, str]:
        """Fix indentation issues"""
        lines = code.split("\n")
        fixed_lines = []

        for line in lines:
            # Replace tabs with 4 spaces
            fixed_line = line.replace("\t", "    ")

            # Remove trailing whitespace
            fixed_line = fixed_line.rstrip()

            fixed_lines.append(fixed_line)

        return "\n".join(fixed_lines), "Fixed indentation (converted tabs to spaces)"

    def _add_missing_imports(self, code: str, error: str) -> Tuple[str, str]:
        """Add common missing imports"""
        # Extract variable name from error
        match = re.search(r"name '(\w+)' is not defined", error, re.IGNORECASE)
        if not match:
            return code, "Could not identify missing import"

        var_name = match.group(1)

        # Common module mappings
        import_map = {
            "np": "import numpy as np",
            "numpy": "import numpy",
            "pd": "import pandas as pd",
            "pandas": "import pandas",
            "plt": "import matplotlib.pyplot as plt",
            "math": "import math",
            "random": "import random",
            "datetime": "import datetime",
            "json": "import json",
            "os": "import os",
            "sys": "import sys",
            "time": "import time",
            "QuantumCircuit": "from qiskit import QuantumCircuit",
            "Aer": "from qiskit import Aer",
            "execute": "from qiskit import execute",
            "symbols": "from sympy import symbols",
            "sqrt": "from math import sqrt",
            "pi": "from math import pi",
        }

        if var_name in import_map:
            import_statement = import_map[var_name]
            # Check if import already exists
            if import_statement not in code:
                repaired = import_statement + "\n" + code
                return repaired, f"Added missing import: {import_statement}"

        return code, f"Unknown module for '{var_name}'"

    def _fix_common_syntax(self, code: str, error: str) -> Tuple[str, str]:
        """Fix common syntax errors"""
        # Missing parentheses in print (Python 3)
        if "print" in code and "print " in code:
            fixed = re.sub(
                r"print\s+([^(].*?)$", r"print(\1)", code, flags=re.MULTILINE
            )
            if fixed != code:
                return fixed, "Fixed print statements (added parentheses)"

        return code, "No common syntax fix applied"

    def _add_missing_colons(self, code: str) -> Tuple[str, str]:
        """Add missing colons to control structures"""
        lines = code.split("\n")
        fixed_lines = []
        modified = False

        keywords = [
            "if",
            "elif",
            "else",
            "for",
            "while",
            "def",
            "class",
            "try",
            "except",
            "finally",
            "with",
        ]

        for line in lines:
            stripped = line.lstrip()

            # Check if line starts with keyword and doesn't end with colon
            for keyword in keywords:
                if stripped.startswith(keyword + " ") or stripped == keyword:
                    if not stripped.rstrip().endswith(":"):
                        line = line.rstrip() + ":"
                        modified = True
                        break

            fixed_lines.append(line)

        if modified:
            return "\n".join(fixed_lines), "Added missing colons to control structures"

        return code, "No missing colons found"

    def _fix_unclosed_structures(self, code: str) -> Tuple[str, str]:
        """Fix unclosed strings or brackets"""
        # Count quotes
        single_quotes = code.count("'") - code.count("\\'")
        double_quotes = code.count('"') - code.count('\\"')

        # Fix unclosed strings
        if single_quotes % 2 != 0:
            code += "'"
            return code, "Closed unclosed single quote"

        if double_quotes % 2 != 0:
            code += '"'
            return code, "Closed unclosed double quote"

        # Count brackets
        open_paren = code.count("(")
        close_paren = code.count(")")
        open_bracket = code.count("[")
        close_bracket = code.count("]")
        open_brace = code.count("{")
        close_brace = code.count("}")

        repairs = []

        if open_paren > close_paren:
            code += ")" * (open_paren - close_paren)
            repairs.append(f"Added {open_paren - close_paren} closing parenthesis")

        if open_bracket > close_bracket:
            code += "]" * (open_bracket - close_bracket)
            repairs.append(f"Added {open_bracket - close_bracket} closing bracket")

        if open_brace > close_brace:
            code += "}" * (open_brace - close_brace)
            repairs.append(f"Added {open_brace - close_brace} closing brace")

        if repairs:
            return code, "; ".join(repairs)

        return code, "No unclosed structures found"

    def enhance_code_quality(self, code: str) -> Tuple[str, str]:
        """Enhance code to improve success rate"""
        enhancements = []

        # Ensure output for verification
        if "print(" not in code:
            # Add result printing if there's a calculation
            lines = code.split("\n")
            last_line = lines[-1].strip() if lines else ""

            # If last line is an expression, print it
            if last_line and not last_line.startswith(("print", "#", "import", "from")):
                if "=" in last_line:
                    var_name = last_line.split("=")[0].strip()
                    code += f'\nprint(f"Result: {{{var_name}}}")'
                    enhancements.append("Added result output")

        if enhancements:
            return code, "; ".join(enhancements)

        return code, "No enhancements needed"
