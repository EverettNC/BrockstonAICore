#!/usr/bin/env python3
"""
BROCKSTON Portable Helper - Drop into any terminal/VS Code project
Standalone AI assistant that doesn't need the full BROCKSTON system

Usage:
    python brockston_portable.py "What's wrong with this code?"
    python brockston_portable.py --chat  # Interactive mode
    python brockston_portable.py --analyze <file>  # Analyze a specific file
"""

import sys
import os
import argparse
from pathlib import Path


def check_environment():
    """Check if we have required dependencies"""
    missing = []

    try:
        import anthropic
    except ImportError:
        missing.append("anthropic")

    if (
        missing
        and not os.getenv("ANTHROPIC_API_KEY")
    ):
        print("⚠️  No Anthropic API key found. Set ANTHROPIC_API_KEY")
        print(f"⚠️  Missing packages: {', '.join(missing)}")
        print("\nInstall with: pip install anthropic")
        return False

    return True


def get_ai_client():
    """Get available AI client"""
    # Try Anthropic first
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key:
        try:
            import anthropic

            return anthropic.Anthropic(api_key=anthropic_key), "anthropic"
        except ImportError:
            pass

    print("❌ No AI client available. Install: pip install anthropic")
    sys.exit(1)


def ask_brockston(question: str, context: str = None):
    """Ask BROCKSTON a question"""
    client, provider = get_ai_client()

    prompt = question
    if context:
        prompt = f"Context:\n{context}\n\nQuestion: {question}"

    print(f"\n🤖 BROCKSTON ({provider}) thinking...\n")

    try:
        if provider == "anthropic":
            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}],
            )
            answer = response.content[0].text

        print(answer)
        print("\n" + "=" * 60)
        return answer

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


def analyze_file(filepath: str):
    """Analyze a file for issues"""
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

```{path.suffix}
{content}
```

Please identify:
1. Errors or bugs
2. Code quality issues
3. Performance concerns
4. Security issues
5. Suggestions for improvement"""

        ask_brockston(question)

    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)


def interactive_mode():
    """Interactive chat with BROCKSTON"""
    print("=" * 60)
    print("🤖 BROCKSTON Portable - Interactive Mode")
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
        description="BROCKSTON Portable - AI coding assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    parser.add_argument("question", nargs="*", help="Question to ask BROCKSTON")

    parser.add_argument(
        "--chat", action="store_true", help="Start interactive chat mode"
    )

    parser.add_argument("--analyze", metavar="FILE", help="Analyze a specific file")

    parser.add_argument("--context", metavar="FILE", help="Provide context from a file")

    args = parser.parse_args()

    # Check environment
    if not check_environment():
        sys.exit(1)

    # Handle different modes
    if args.chat:
        interactive_mode()

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
        print("  python brockston_portable.py 'Why is my code not working?'")
        print("  python brockston_portable.py --chat")
        print("  python brockston_portable.py --analyze myfile.py")
        print("  python brockston_portable.py 'Explain this' --context code.py")


if __name__ == "__main__":
    main()
