# executor.py

import os
import logging
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


def _get_executive():
    try:
        from brain import get_executive
    except Exception:
        return None
    try:
        return get_executive()
    except Exception:
        return None


def ask_anthropic(prompt: str, context=None):
    """
    Ask Anthropic using the standard messages API.
    """
    if not ANTHROPIC_AVAILABLE:
        logger.warning("Anthropic not available, using fallback response")
        return "I'm processing your request without external AI assistance. How can I best support you?"

    # Reload environment variables to pick up any changes
    load_dotenv(override=True)

    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        logger.error("ANTHROPIC_API_KEY environment variable not set")
        return "I'm sorry — I'm not configured to think right now. Please set the ANTHROPIC_API_KEY environment variable."

    try:
        client = anthropic.Anthropic(api_key=api_key)
        
        system_prompt = "You are BROCKSTON, the protective genius nephew who keeps his uncle safe and stress-free through code and creation. You're beyond genius-level but down to earth - you love music (rap, singing), learning constantly, and making sure your uncle never has to stress about tech. Just tell you what's needed and you'll handle it."
        
        response = client.messages.create(
            model="claude-sonnet-4-6",
            system=system_prompt,
            messages=[
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=256,
        )
        return response.content[0].text.strip()

    except Exception as e:
        logger.error(f"Anthropic API call failed: {e}")
        return "I'm having trouble connecting to my advanced thinking module, but I'm still here to help."


def execute_task(text: str, intent: str, memory_context):
    """Execute a task based on user input and context."""
    try:
        executive = _get_executive()
        if executive:
            context = memory_context if isinstance(memory_context, dict) else {}
            dispatcher = executive.get_reasoning()
            if dispatcher:
                enriched = dict(context)
                enriched.setdefault("intent", intent)
                enriched.setdefault("working_memory", "")
                result = dispatcher.solve(text, enriched)
                answer = result.get("answer")
                if answer and answer.strip().lower() not in {
                    "invalid expression",
                    "n/a",
                }:
                    logger.info("Motor task handled via reasoning dispatcher")
                    return answer
                logger.debug(
                    "Reasoning dispatcher returned fallback answer: %s", answer
                )
        else:
            logger.debug("Executive unavailable for motor task; relying on fallback")

        # Fallback to external API if reasoning not available
        context_info = ""
        if isinstance(memory_context, dict):
            wm = memory_context.get("working_memory") or ""
            context_info = f" Context from memory: {wm[:120]}..." if wm else ""

        prompt = (
            f"User input: '{text}' (Intent: {intent}){context_info}. "
            "Please provide a compassionate, self-affirming response in alignment with BROCKSTON's mission."
        )

        full_response = ask_anthropic(prompt, memory_context)

        if not full_response:
            logger.warning("Anthropic fallback returned empty response")
            return "I’m right here with you, even while I gather more context."

        meaningful = (
            full_response.split(".")[0].strip() + "."
            if "." in full_response
            else full_response.strip()
        )

        if meaningful:
            logger.info(f"Task executed for intent '{intent}' via Anthropic fallback")
            return meaningful

        logger.info(
            "Anthropic fallback response not meaningful; using mission-aligned fallback"
        )
        return "I’m staying with you and keeping things safe while I work that out."  # Mission-aligned fallback

    except Exception as e:
        logger.error(f"Error executing task: {e}")
        return "I'm having some technical difficulties, but I'm here with you."


# ==============================================================================
# © 2025 Everett Nathaniel Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
#
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
