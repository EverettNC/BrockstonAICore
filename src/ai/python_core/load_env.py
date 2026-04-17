#!/usr/bin/env python3
"""
BROCKSTON Environment Loader
Loads environment variables from .env file and validates configuration
"""
import os
from pathlib import Path


def load_env_file(env_file_path: str = None) -> dict:
    """
    Load environment variables from .env file

    Args:
        env_file_path: Path to .env file. Defaults to .env in project root.

    Returns:
        Dictionary of loaded environment variables
    """
    if env_file_path is None:
        env_file_path = Path(__file__).parent / ".env"
    else:
        env_file_path = Path(env_file_path)

    loaded_vars = {}

    if not env_file_path.exists():
        print(f"⚠️  .env file not found at {env_file_path}")
        print("   Create one from .env.example to configure BROCKSTON features")
        return loaded_vars

    try:
        with open(env_file_path, "r", encoding="utf-8") as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()

                # Skip empty lines and comments
                if not line or line.startswith("#"):
                    continue

                # Parse key=value pairs
                if "=" not in line:
                    print(f"⚠️  Invalid line {line_num} in .env: {line}")
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip()

                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]

                # Only set if not already in environment (respect system env vars)
                if key not in os.environ:
                    os.environ[key] = value
                    loaded_vars[key] = value

    except Exception as e:
        print(f"❌ Error loading .env file: {e}")
        return {}

    print(f"✅ Loaded {len(loaded_vars)} environment variables from {env_file_path}")
    return loaded_vars


def validate_config() -> dict:
    """
    Validate BROCKSTON configuration and show status

    Returns:
        Dictionary with feature availability status
    """
    status = {
        "speech_available": False,
        "ai_orchestration_available": False,
        "elevenlabs_configured": False,
    }

    # Check ElevenLabs configuration
    eleven_key = os.getenv("ELEVENLABS_API_KEY")
    if eleven_key:
        status["elevenlabs_configured"] = True
        status["speech_available"] = True
        print("✅ ElevenLabs configured - Speech synthesis available")
    else:
        print("⚠️  ELEVENLABS_API_KEY missing - Speech synthesis disabled")

    # Check AI Orchestration configuration (Anthropic or Ollama)
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    ollama_model = os.getenv("OLLAMA_MODEL")
    
    if anthropic_key or ollama_model:
        status["ai_orchestration_available"] = True
        if anthropic_key:
            print("✅ Anthropic Claude configured - AI orchestration available")
        if ollama_model:
            print(f"✅ Ollama Local Brain configured ({ollama_model}) - Local orchestration available")
    else:
        print("⚠️  No AI orchestration provider found (Anthropic or Ollama)")
        print("   Set ANTHROPIC_API_KEY or OLLAMA_MODEL for intelligence features")

    # Check Replit AI Integrations (legacy, keeping as silent check)
    replit_base = os.getenv("AI_INTEGRATIONS_OPENAI_BASE_URL")
    replit_key = os.getenv("AI_INTEGRATIONS_OPENAI_API_KEY")
    if replit_base and replit_key:
        print("✅ Replit AI Integrations configured")

    # Show Perplexity status
    if os.getenv("PERPLEXITY_API_KEY"):
        print("✅ Perplexity API configured (optional)")

    # Anthropic status (Double check for boot log)
    if os.getenv("ANTHROPIC_API_KEY"):
        print("✅ Anthropic Claude available as secondary fallback")

    # Show optional service status
    if os.getenv("ANTHROPIC_API_KEY"):
        print("✅ Anthropic Claude configured (optional)")

    if os.getenv("PERPLEXITY_API_KEY"):
        print("✅ Perplexity API configured (optional)")

    return status


def main():
    """Main function for command line usage"""
    print("🔧 BROCKSTON Environment Configuration")
    print("=" * 60)

    # Load environment variables
    loaded_vars = load_env_file()

    if loaded_vars:
        print("\n📋 Loaded Variables:")
        for key in sorted(loaded_vars.keys()):
            # Mask sensitive values
            if any(
                sensitive in key.lower()
                for sensitive in ["key", "secret", "token", "password"]
            ):
                value = loaded_vars[key]
                masked = (
                    value[:8] + "*" * (len(value) - 12) + value[-4:]
                    if len(value) > 12
                    else "*" * len(value)
                )
                print(f"   {key} = {masked}")
            else:
                print(f"   {key} = {loaded_vars[key]}")

    # Validate configuration
    print("\n🔍 Configuration Status:")
    status = validate_config()

    print("\n🚀 To start BROCKSTON:")
    print("   uvicorn main:app --host 0.0.0.0 --port 5000")

    return status


if __name__ == "__main__":
    main()
