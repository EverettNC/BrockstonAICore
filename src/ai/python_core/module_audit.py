
import sys
import os
import importlib
import logging
from pathlib import Path

# Setup basic logging
logging.basicConfig(level=logging.ERROR)

# Add project root to path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from brockston_module_loader import get_brockston_loader

def audit_modules():
    loader = get_brockston_loader()
    
    print("🔍 Starting Module Audit...")
    print("=" * 60)
    
    results = {
        'missing_file': [],
        'import_error': [], # Dependency issues
        'syntax_error': [],
        'other': []
    }
    
    # We want to check EVERY module in the defined paths
    for module_name, import_path in loader.module_paths.items():
        try:
            importlib.import_module(import_path)
            # If successful, do nothing (or print dot)
            print(".", end="", flush=True)
        except ModuleNotFoundError as e:
            error_msg = str(e)
            if f"No module named '{import_path}'" in error_msg or f"No module named '{import_path.split('.')[0]}'" in error_msg:
                 results['missing_file'].append((module_name, import_path, error_msg))
            else:
                 # This means a dependency IS missing
                 results['import_error'].append((module_name, import_path, error_msg))
            print("F", end="", flush=True)
            
        except SyntaxError as e:
            results['syntax_error'].append((module_name, import_path, str(e)))
            print("S", end="", flush=True)
            
        except Exception as e:
            results['other'].append((module_name, import_path, f"{type(e).__name__}: {str(e)}"))
            print("E", end="", flush=True)

    print("\n\n" + "=" * 60)
    print("📊 AUDIT RESULTS")
    print("=" * 60)
    
    if results['missing_file']:
        print(f"\n❌ MISSING FILES/PATHS ({len(results['missing_file'])}):")
        for name, path, err in results['missing_file']:
            print(f"  - {name} (path: {path}) -> {err}")

    if results['import_error']:
        print(f"\n📦 MISSING DEPENDENCIES ({len(results['import_error'])}):")
        for name, path, err in results['import_error']:
            print(f"  - {name} -> {err}")
            
    if results['syntax_error']:
        print(f"\n⚠️  SYNTAX ERRORS ({len(results['syntax_error'])}):")
        for name, path, err in results['syntax_error']:
            print(f"  - {name} -> {err}")

    if results['other']:
        print(f"\n🔥 RUNTIME ERRORS ({len(results['other'])}):")
        for name, path, err in results['other']:
            print(f"  - {name} -> {err}")

if __name__ == "__main__":
    audit_modules()
