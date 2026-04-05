"""Combined autonomous learning and self-improvement runner for BROCKSTON."""

import asyncio
import logging
import aioschedule as schedule

# from autonomous_learning_engine import AutonomousLearningEngine  # Using actual root module
from self_modifying_code import CodeModifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [BROCKSTON] - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# Import the actual autonomous learning engine from root level
try:
    from autonomous_learning_engine import AutonomousLearningEngine as AutonomousLearner
except ImportError:
    # Fallback placeholder if module not available
    class AutonomousLearner:
        """Fallback placeholder for autonomous learning system"""

        async def autonomous_learning_session(self):
            return {"total_articles_learned": 0, "chambers_processed": []}


class BrockstonAutonomousSystem:
    """Coordinates BROCKSTON's learning chambers and self-modification cycles."""

    def __init__(self, safe_mode: bool = False) -> None:
        self.learner = AutonomousLearner()
        self.modifier = CodeModifier(
            backup_dir="./memory/daily"
        )  # CodeModifier uses backup_dir parameter, not safe_mode
        self.safe_mode = safe_mode
        self.is_running = False

    async def daily_learning_cycle(self) -> None:
        logger.info("Starting daily learning cycle")
        try:
            report = await self.learner.autonomous_learning_session()
            logger.info(
                "Learning cycle complete: %s articles across %s chambers",
                report["total_articles_learned"],
                len(report["chambers_processed"]),
            )
        except Exception as exc:
            logger.error("Learning cycle failed: %s", exc)

    # Note: Weekly self-improvement is still synchronous.
    # If it becomes I/O bound, consider making it async as well.
    def weekly_self_improvement_cycle(self) -> None:
        logger.info("Starting weekly self-improvement cycle")
        try:
            # Simple self-improvement using available CodeModifier methods
            report = {"files_modified": 0}  # Placeholder for now
            logger.info(
                "Self-improvement cycle complete: %s files modified",
                report["files_modified"],
            )
        except Exception as exc:
            logger.error("Self-improvement cycle failed: %s", exc)

    async def start_autonomous_operation(self) -> None:
        logger.info("BROCKSTON Autonomous System activated")
        self.is_running = True

        # Schedule the asynchronous daily learning cycle
        schedule.every().day.at("02:00").do(self.daily_learning_cycle)

        # Schedule the synchronous weekly self-improvement cycle
        schedule.every().sunday.at("03:00").do(self.weekly_self_improvement_cycle)

        logger.info("Scheduler started. Waiting for the first run.")
        while self.is_running:
            await schedule.run_pending()
            await asyncio.sleep(1)  # Use asyncio.sleep in an async function

    def stop(self) -> None:
        self.is_running = False
        logger.info("BROCKSTON Autonomous System deactivated")


async def main() -> None:
    system = BrockstonAutonomousSystem()
    try:
        await system.start_autonomous_operation()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received; shutting down")
        system.stop()
    except asyncio.CancelledError:
        logger.info("Async operation cancelled; shutting down")
        system.stop()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application shutdown.")

# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================
