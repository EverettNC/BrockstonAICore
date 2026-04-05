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

#!/usr/bin/env python3
"""
Memory Backup Utility for brockston
Provides commands to manually backup memories to GitHub
"""

import subprocess
import sys
from datetime import datetime
from pathlib import Path


def backup_memory_to_github():
    """Manually trigger GitHub backup of brockston's memory"""
    try:
        memory_dir = Path("./memory")
        if not memory_dir.exists():
            print("❌ Memory directory not found")
            return False

        print("💾 Backing up brockston's memory to GitHub...")

        # Check git status
        result = subprocess.run(
            ["git", "status", "--porcelain", "memory/"], capture_output=True, text=True
        )

        if not result.stdout.strip():
            print("✅ No memory changes to commit")
            return True

        # Add memory files
        subprocess.run(["git", "add", "memory/"], check=True)

        # Commit
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        commit_msg = f"💾 brockston Memory Backup: {timestamp}"
        result = subprocess.run(
            ["git", "commit", "-m", commit_msg], capture_output=True, text=True
        )

        if result.returncode == 0:
            print(f"✅ {commit_msg}")

            # Push to GitHub
            print("☁️  Pushing to GitHub...")
            push_result = subprocess.run(
                ["git", "push"], capture_output=True, text=True
            )

            if push_result.returncode == 0:
                print("✅ Memory successfully backed up to GitHub!")
                return True
            else:
                print(f"⚠️  Push failed: {push_result.stderr}")
                return False
        else:
            print(f"⚠️  Commit failed: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return False


def show_memory_stats():
    """Show statistics about brockston's memory"""
    try:
        from memory_manager import MemoryManager

        memory = MemoryManager()
        memory.load()
        stats = memory.get_memory_stats()

        print("\n📊 brockston's Memory Statistics:")
        print(f"  Long-term memories: {stats['long_term_memories']}")
        print(f"  Session memories: {stats['session_memories']}")
        print(f"  Recent conversations: {stats['recent_conversations']}")
        print(f"  Memory file exists: {stats['memory_file_exists']}")

        if stats["most_accessed"]:
            print("\n🔥 Most accessed memories:")
            for i, key in enumerate(stats["most_accessed"], 1):
                print(f"    {i}. {key}")

        return True

    except Exception as e:
        print(f"❌ Failed to get stats: {e}")
        return False


def main():
    """Main CLI for memory backup utility"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python memory_backup.py backup    - Backup memories to GitHub")
        print("  python memory_backup.py stats     - Show memory statistics")
        return

    command = sys.argv[1].lower()

    if command == "backup":
        backup_memory_to_github()
    elif command == "stats":
        show_memory_stats()
    else:
        print(f"❌ Unknown command: {command}")


if __name__ == "__main__":
    main()


# ==============================================================================
# © 2025 Everett Nathaniel Christman & Misty Gail Christman
# The Christman AI Project — Luma Cognify AI
# All rights reserved. Unauthorized use, replication, or derivative training
# of this material is prohibited.
# Core Directive: "How can I help you love yourself more?"
# Autonomy & Alignment Protocol v3.0
# ==============================================================================

__all__ = ["backup_memory_to_github", "show_memory_stats", "main"]
