# brockston_memory_core.py

"""
BrockstonMemoryCore
-------------------
Python implementation of the memory core / resonance hook.

This mirrors the intent of the C++ BrockstonMemory:
- in-memory cache
- local file persistence
- hook-style interface (store / retrieve / status / test)

Later, this can be swapped to talk to a C++/Docker service or S3.
"""

from pathlib import Path
from threading import Lock
from typing import Dict


class BrockstonMemoryCore:
    def __init__(self, local_file: str | None = None) -> None:
        # Local persistence file
        if local_file is None:
            # keep it under ./memory/resonance.db
            self.local_file = Path("memory") / "resonance.db"
        else:
            self.local_file = Path(local_file)

        self.local_file.parent.mkdir(parents=True, exist_ok=True)

        # In-memory KV store
        self._cache: Dict[str, str] = {}
        self._lock = Lock()

        # Load any existing data
        self._load_from_local()

    def _load_from_local(self) -> None:
        with self._lock:
            if not self.local_file.exists():
                return

            lines = self.local_file.read_text(encoding="utf-8").splitlines()
            # Expect pairs: key line, value line
            it = iter(lines)
            count = 0
            for key in it:
                try:
                    value = next(it)
                except StopIteration:
                    break
                self._cache[key] = value
                count += 1
            print(f"Memory loaded from local: {count} entries.")

    def _sync_to_local(self) -> None:
        """
        Persist the full cache to disk.

        (This is where you'd later hook S3 sync, KMS, etc.)
        """
        with self._lock:
            lines: list[str] = []
            for k, v in self._cache.items():
                lines.append(k)
                lines.append(v)
            self.local_file.write_text("\n".join(lines), encoding="utf-8")
        print("Local memory sync complete. Memory resilient.")

    # POST /memory/store
    def store_resonance(self, key: str, value: str) -> None:
        with self._lock:
            self._cache[key] = value
            self._sync_to_local()
        print(f"Resonance stored: [{key}] = {value}")

    # GET /memory/retrieve
    def retrieve_resonance(self, key: str) -> str:
        with self._lock:
            if key in self._cache:
                value = self._cache[key]
                print(f"Resonance retrieved: [{key}] = {value}")
                return value
        return "No resonance found."

    # GET /memory/status
    def get_status(self) -> str:
        with self._lock:
            n = len(self._cache)
        return f"Memory Core: {n} resonances hooked. Offline-ready."

    # Hook test simulation
    def test_hook(self) -> None:
        self.store_resonance("uncle_everett", "Issue fixed. Memory online. Love preserved.")
        recalled = self.retrieve_resonance("uncle_everett")
        print(f"Test Recall: {recalled}")


if __name__ == "__main__":
    mem = BrockstonMemoryCore()
    print("Memory Core: BOOTING… HOOKED ✅\n")
    mem.test_hook()
    print(mem.get_status())

