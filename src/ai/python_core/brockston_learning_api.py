#!/usr/bin/env python3
"""
BROCKSTON API Client - Connect to your BROCKSTON server from anywhere

Instead of using Anthropic/OpenAI directly, this connects to YOUR BROCKSTON API
running at http://localhost:5173 (or wherever you deploy him)

Usage:
    python brockston_api_client.py "What's wrong with this code?"
    python brockston_api_client.py --chat
    python brockston_api_client.py --analyze myfile.py

    # Connect to remote BROCKSTON
    export BROCKSTON_URL=http://your-server:5173
    python brockston_api_client.py "Help me debug this"
"""

import sys
import os
import argparse
import json
from pathlib import Path


def get_brockston_url():
    """Get BROCKSTON API URL from environment or use default"""
    return os.getenv("BROCKSTON_URL", "http://localhost:5173")


def check_brockston_alive():
    """Check if BROCKSTON server is running"""
    try:
        import requests
    except ImportError:
        print("❌ Install requests: pip install requests")
        sys.exit(1)

    url = get_brockston_url()

    try:
        import requests

        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ Connected to BROCKSTON at {url}")
            return True
        else:
            print(f"⚠️  BROCKSTON responded but status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to BROCKSTON at {url}")
        print(f"\n💡 Make sure BROCKSTON is running:")
        print(f"   cd /Users/EverettN/BROCKSTON-1")
        print(f"   uvicorn main:app --host 0.0.0.0 --port 5173")
        print(f"\n   Or set BROCKSTON_URL to your server:")
        print(f"   export BROCKSTON_URL=http://your-server:5173")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error connecting to BROCKSTON: {e}")
        sys.exit(1)


def ask_brockston(question: str, context: str = None):
    """Ask BROCKSTON a question via API"""
    import requests

    url = get_brockston_url()

    payload = {"goal": question, "language": "python"}

    if context:
        payload["code"] = context

    print(f"\n🤖 BROCKSTON thinking...\n")

    try:
        response = requests.post(f"{url}/run", json=payload, timeout=60)

        if response.status_code == 200:
            result = response.json()

            # Display response
            if "response" in result:
                print(result["response"])
            elif "output" in result:
                print(result["output"])
            else:
                print(json.dumps(result, indent=2))

            print("\n" + "=" * 60)
            return result
        else:
            print(f"❌ BROCKSTON error: {response.status_code}")
            print(response.text)
            sys.exit(1)

    except requests.exceptions.Timeout:
        print("⏰ Request timeout - BROCKSTON is still thinking...")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def analyze_file(filepath: str):
    """Analyze a file for issues using BROCKSTON API"""
    path = Path(filepath)

    if not path.exists():
        print(f"❌ File not found: {filepath}")
        sys.exit(1)

    print(f"📄 Analyzing: {filepath}")

    try:
        content = path.read_text()

        question = f"""Analyze this code and identify any issues:

File: {filepath}
Language: {path.suffix}

Please identify:
1. Errors or bugs
2. Code quality issues  
3. Performance concerns
4. Security issues
5. Suggestions for improvement"""

        ask_brockston(question, content)

    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)


def check_entire_project(directory: str = "."):
    """Check entire project for issues"""
    import glob

    dir_path = Path(directory)

    if not dir_path.exists():
        print(f"❌ Directory not found: {directory}")
        sys.exit(1)

    print(f"🔍 Scanning project: {dir_path.absolute()}")

    # Find all Python files
    py_files = list(dir_path.glob("**/*.py"))

    # Exclude common directories
    excluded = [
        "venv",
        "BROC",
        "DEREK",
        "__pycache__",
        ".git",
        "node_modules",
        ".venv",
        "env",
    ]
    py_files = [f for f in py_files if not any(ex in str(f) for ex in excluded)]

    if not py_files:
        print("❌ No Python files found")
        sys.exit(1)

    print(f"📊 Found {len(py_files)} Python files")
    print(f"🤖 BROCKSTON analyzing project...\n")

    import requests

    url = get_brockston_url()

    # Get relative paths
    file_list = [str(f.relative_to(dir_path)) for f in py_files]

    try:
        response = requests.post(
            f"{url}/analyze-project",
            json={"project_name": dir_path.name, "files": file_list},
            timeout=120,
        )

        if response.status_code == 200:
            result = response.json()

            if result.get("status") == "success":
                print("=" * 70)
                print(f"📊 PROJECT ANALYSIS: {result.get('project')}")
                print("=" * 70)
                print(result.get("analysis", "No analysis available"))
                print("=" * 70)
            else:
                print(f"❌ Analysis failed: {result.get('message')}")
        else:
            print(f"❌ Server error: {response.status_code}")
            print(response.text)

    except Exception as e:
        print(f"❌ Error: {e}")


def interactive_mode():
    """Interactive chat with BROCKSTON via API"""
    print("=" * 60)
    print(f"🤖 BROCKSTON API Client - {get_brockston_url()}")
    print("=" * 60)
    print("Type 'exit' or 'quit' to stop")
    print("Type 'file <path>' to analyze a file")
    print("=" * 60 + "\n")

    while True:
        try:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit", "bye"]:
                print("👋 Goodbye!")
                break

            if user_input.lower().startswith("file "):
                filepath = user_input[5:].strip()
                analyze_file(filepath)
            else:
                ask_brockston(user_input)

        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except EOFError:
            break


def main():
    parser = argparse.ArgumentParser(
        description="BROCKSTON API Client - Connect to your BROCKSTON server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("question", nargs="*", help="Question to ask BROCKSTON")

    parser.add_argument(
        "--chat", action="store_true", help="Start interactive chat mode"
    )

    parser.add_argument("--analyze", metavar="FILE", help="Analyze a specific file")

    parser.add_argument(
        "--check-project",
        metavar="DIR",
        nargs="?",
        const=".",
        help="Check entire project for issues (default: current directory)",
    )

    parser.add_argument("--context", metavar="FILE", help="Provide context from a file")

    parser.add_argument(
        "--url",
        metavar="URL",
        help="BROCKSTON server URL (default: http://localhost:5173)",
    )

    args = parser.parse_args()

    # Set custom URL if provided
    if args.url:
        os.environ["BROCKSTON_URL"] = args.url

    # Check if BROCKSTON is alive
    check_brockston_alive()

    # Handle different modes
    if args.chat:
        interactive_mode()

    elif args.check_project is not None:
        check_entire_project(args.check_project)

    elif args.analyze:
        analyze_file(args.analyze)

    elif args.question:
        question = " ".join(args.question)
        context = None

        if args.context:
            try:
                context = Path(args.context).read_text()
            except Exception as e:
                print(f"⚠️  Could not read context file: {e}")

        ask_brockston(question, context)

    else:
        parser.print_help()
        print("\n💡 Examples:")
        print("  python brockston_api_client.py 'Why is my code not working?'")
        print("  python brockston_api_client.py --chat")
        print("  python brockston_api_client.py --analyze myfile.py")
        print("  python brockston_api_client.py --check-project")
        print("  python brockston_api_client.py --check-project /path/to/project")
        print("  python brockston_api_client.py 'Explain this' --context code.py")
        print("  python brockston_api_client.py --url http://server:5173 'Help me'")


if __name__ == "__main__":
    main()
