# © 2025 The Christman AI Project. All rights reserved.
#
# This code is released as part of a trauma-informed, dignity-first AI ecosystem
# designed to protect, empower, and elevate vulnerable populations.
#
# By using, modifying, or distributing this software, you agree to uphold the following:
# 1. Truth — No deception, no manipulation.
# 2. Dignity — Respect the autonomy and humanity of all users.
# 3. Protection — Never use this to exploit or harm vulnerable individuals.
# 4. Transparency — Disclose all modifications and contributions clearly.
# 5. No Erasure — Preserve the mission and ethical origin of this work.
#
# This is not just code. This is redemption in code.
# Contact: lumacognify@thechristmanaiproject.com
# https://thechristmanaiproject.com

# executor.py

import logging
import os

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Try to import Anthropic
try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    logger.warning("Anthropic not available")
    ANTHROPIC_AVAILABLE = False


def ask_anthropic(prompt: str, context=None):
    """
    Ask Anthropic Claude.
    """
    if not ANTHROPIC_AVAILABLE:
        logger.warning("Anthropic not available, using fallback response")
        return "I'm processing your request without external AI assistance. How can I best support you?"

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY environment variable not set")
        return "I'm sorry — I'm not configured to think right now. Please set the ANTHROPIC_API_KEY environment variable."

    try:
        from anthropic import Anthropic
        client = Anthropic(api_key=api_key)
        
        message = client.messages.create(
            model=os.getenv("ANTHROPIC_MODEL", "claude-3-opus-20240229"),
            max_tokens=1024,
            system="You are BROCKSTON, an AI assistant. Respond only to what the user actually says. Never assume what they were about to ask or claim to know their intentions.",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        return message.content[0].text

    except Exception as e:
        logger.error(f"Anthropic API call failed: {e}")
        return "I'm having trouble connecting to my advanced thinking module, but I'm still here to help."


def execute_task(text: str, intent: str, memory_context):
    """Execute a task based on user input and context."""
    try:
        # Create a contextual prompt for the LLM
        context_info = ""
        if isinstance(memory_context, dict) and "context" in memory_context:
            context_info = f" Context from memory: {memory_context['context'][:100]}..."

        prompt = f"User input: '{text}' (Intent: {intent}){context_info}. Please provide a helpful response."

        # Ask the model
        full_response = ask_anthropic(prompt, memory_context)

        # Optionally shorten for speech output (speak only first sentence)
        spoken_response = (
            full_response.split(".")[0].strip() + "."
            if "." in full_response
            else full_response.strip()
        )

        logger.info(f"Task executed for intent '{intent}'")
        return spoken_response

    except Exception as e:
        logger.error(f"Error executing task: {e}")
        return "I'm having some technical difficulties, but I'm here with you."


# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

__all__ = ["ask_anthropic", "execute_task"]
