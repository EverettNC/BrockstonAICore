# dependency_shield.py
import json
import os
import sys
from pathlib import Path
from datetime import datetime

import pkg_resources
from packaging.requirements import Requirement
from packaging.version import Version

SHIELD_LOCK = Path("dependency_shield.lock.json")
CONSTRAINTS_FILE = Path("constraints.txt")

# pkg → { dep: version_spec }
KNOWN_BREAKERS = {
    "thinc": {"numpy": "<1.24.0"},           # thinc 8.2+ hates numpy 2.x
    "torch": {"numpy": "<2.0.0"},            # torch 2.3+ still fragile with numpy 2
    "spacy": {"thinc": ">=8.2.0,<8.3.0"},    # spacy pins thinc hard
}


def scan_and_shield():
    # Normalize names to lowercase
    installed = {d.project_name.lower(): d.version for d in pkg_resources.working_set}
    conflicts = []

    for pkg, constraints in KNOWN_BREAKERS.items():
        pkg_key = pkg.lower()
        if pkg_key not in installed:
            continue

        for dep, version_spec in constraints.items():
            dep_key = dep.lower()
            if dep_key not in installed:
                continue

            req = Requirement(f"{dep}{version_spec}")
            current_ver = Version(installed[dep_key])

            if not req.specifier.contains(current_ver, prereleases=True):
                conflicts.append({
                    "breaker": pkg,
                    "breaker_version": installed[pkg_key],
                    "dependency": dep,
                    "dependency_version": installed[dep_key],
                    "required_spec": str(req.specifier),
                })

    if conflicts:
        print("🚨 DEPENDENCY SHIELD ACTIVATED")
        for c in conflicts:
            print(
                f"  {c['breaker']} {c['breaker_version']} breaks "
                f"{c['dependency']} {c['dependency_version']} — "
                f"needs {c['required_spec']}"
            )

        # Ensure constraints file exists and load existing lines
        existing = set()
        if CONSTRAINTS_FILE.exists():
            existing = {
                line.strip()
                for line in CONSTRAINTS_FILE.read_text().splitlines()
                if line.strip() and not line.startswith("#")
            }

        new_lines = []
        for c in conflicts:
            line = f"{c['dependency']}{c['required_spec']}"
            if line not in existing:
                new_lines.append(line)
                existing.add(line)

        if new_lines:
            with CONSTRAINTS_FILE.open("a") as f:
                for line in new_lines:
                    f.write(f"\n{line}")
            print(f"  → Patched {CONSTRAINTS_FILE} with:")
            for line in new_lines:
                print(f"      {line}")
        else:
            print(f"  → No new constraints needed in {CONSTRAINTS_FILE}")

        # Update lockfile
        SHIELD_LOCK.write_text(json.dumps({
            "blocked_at": datetime.now().isoformat(),
            "conflicts": conflicts,
        }, indent=2))

        print("Shield complete. Run pip with:")
        print("  pip install -r requirements.txt --constraint constraints.txt")
    else:
        print("DependencyShield: All clear. Fleet is stable.")


if __name__ == "__main__":
    scan_and_shield()
