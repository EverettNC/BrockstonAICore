"""
BROCKSTON API Key Authentication System
Allows Brockston to issue his own API keys to users who want to interact with him
"""

import secrets
import hashlib
import json
from pathlib import Path
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from fastapi import HTTPException, Security, Header
from fastapi.security import APIKeyHeader

# API Key storage file
API_KEYS_FILE = Path("data/brockston_api_keys.json")
API_KEYS_FILE.parent.mkdir(parents=True, exist_ok=True)

# Security scheme
api_key_header = APIKeyHeader(name="X-Brockston-API-Key", auto_error=False)


class BrockstonAPIKeyManager:
    """Manages API keys for accessing Brockston"""

    def __init__(self):
        self.keys_file = API_KEYS_FILE
        self.keys_data = self._load_keys()

    def _load_keys(self) -> Dict:
        """Load API keys from storage"""
        if self.keys_file.exists():
            with open(self.keys_file, "r") as f:
                return json.load(f)
        return {"keys": {}, "usage": {}}

    def _save_keys(self):
        """Save API keys to storage"""
        with open(self.keys_file, "w") as f:
            json.dump(self.keys_data, f, indent=2)

    def _hash_key(self, key: str) -> str:
        """Hash an API key for secure storage"""
        return hashlib.sha256(key.encode()).hexdigest()

    def create_api_key(
        self,
        user_name: str,
        description: str = "",
        rate_limit: int = 100,  # requests per hour
        expires_days: Optional[int] = None,
    ) -> str:
        """
        Create a new API key for accessing Brockston

        Args:
            user_name: Name/identifier of the user
            description: Purpose of this key
            rate_limit: Max requests per hour
            expires_days: Days until expiration (None = never)

        Returns:
            The API key (only shown once!)
        """
        # Generate secure random key
        api_key = f"brk_{secrets.token_urlsafe(32)}"
        key_hash = self._hash_key(api_key)

        # Calculate expiration
        expires_at = None
        if expires_days:
            expires_at = (datetime.now() + timedelta(days=expires_days)).isoformat()

        # Store key metadata (never store the actual key!)
        self.keys_data["keys"][key_hash] = {
            "user_name": user_name,
            "description": description,
            "created_at": datetime.now().isoformat(),
            "expires_at": expires_at,
            "rate_limit": rate_limit,
            "enabled": True,
        }

        # Initialize usage tracking
        self.keys_data["usage"][key_hash] = {
            "total_requests": 0,
            "last_request": None,
            "hourly_requests": [],
        }

        self._save_keys()
        return api_key

    def validate_api_key(self, api_key: str) -> Optional[Dict]:
        """
        Validate an API key and return user info

        Returns:
            User info dict if valid, None if invalid
        """
        if not api_key or not api_key.startswith("brk_"):
            return None

        key_hash = self._hash_key(api_key)
        key_info = self.keys_data["keys"].get(key_hash)

        if not key_info:
            return None

        # Check if enabled
        if not key_info.get("enabled"):
            return None

        # Check expiration
        if key_info.get("expires_at"):
            expires = datetime.fromisoformat(key_info["expires_at"])
            if datetime.now() > expires:
                return None

        # Check rate limit
        usage = self.keys_data["usage"].get(key_hash, {})
        hourly_requests = usage.get("hourly_requests", [])

        # Clean old requests (older than 1 hour)
        now = datetime.now()
        one_hour_ago = now - timedelta(hours=1)
        recent_requests = [
            req for req in hourly_requests if datetime.fromisoformat(req) > one_hour_ago
        ]

        if len(recent_requests) >= key_info.get("rate_limit", 100):
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded: {key_info['rate_limit']} requests/hour",
            )

        # Update usage
        recent_requests.append(now.isoformat())
        self.keys_data["usage"][key_hash] = {
            "total_requests": usage.get("total_requests", 0) + 1,
            "last_request": now.isoformat(),
            "hourly_requests": recent_requests,
        }
        self._save_keys()

        return key_info

    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke an API key"""
        key_hash = self._hash_key(api_key)
        if key_hash in self.keys_data["keys"]:
            self.keys_data["keys"][key_hash]["enabled"] = False
            self._save_keys()
            return True
        return False

    def list_api_keys(self) -> List[Dict]:
        """List all API keys (without revealing the actual keys)"""
        keys = []
        for key_hash, info in self.keys_data["keys"].items():
            usage = self.keys_data["usage"].get(key_hash, {})
            keys.append(
                {
                    "user_name": info["user_name"],
                    "description": info["description"],
                    "created_at": info["created_at"],
                    "expires_at": info.get("expires_at"),
                    "enabled": info["enabled"],
                    "total_requests": usage.get("total_requests", 0),
                    "last_request": usage.get("last_request"),
                }
            )
        return keys


# Global instance
api_key_manager = BrockstonAPIKeyManager()


async def verify_api_key(api_key: str = Security(api_key_header)) -> Dict:
    """
    FastAPI dependency to verify API key

    Usage:
        @app.get("/protected")
        async def protected_route(user_info: Dict = Depends(verify_api_key)):
            return {"message": f"Hello {user_info['user_name']}!"}
    """
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required. Include X-Brockston-API-Key header.",
        )

    user_info = api_key_manager.validate_api_key(api_key)
    if not user_info:
        raise HTTPException(status_code=403, detail="Invalid or expired API key")

    return user_info


# CLI tool for managing API keys
if __name__ == "__main__":
    import sys

    manager = BrockstonAPIKeyManager()

    if len(sys.argv) < 2:
        print("🔑 Brockston API Key Manager")
        print("\nUsage:")
        print("  python brockston_api_auth.py create <user_name> [description]")
        print("  python brockston_api_auth.py list")
        print("  python brockston_api_auth.py revoke <api_key>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "create":
        if len(sys.argv) < 3:
            print("Error: user_name required")
            sys.exit(1)

        user_name = sys.argv[2]
        description = sys.argv[3] if len(sys.argv) > 3 else ""

        api_key = manager.create_api_key(user_name, description)

        print("✅ API Key Created!")
        print(f"User: {user_name}")
        print(f"Description: {description}")
        print(f"\n🔑 API Key (save this, it won't be shown again!):")
        print(f"   {api_key}")
        print(f"\nUsage:")
        print(
            f'   curl -H "X-Brockston-API-Key: {api_key}" http://localhost:5171/api/status'
        )

    elif command == "list":
        keys = manager.list_api_keys()
        print(f"📋 Active API Keys ({len(keys)}):\n")
        for key in keys:
            status = "✅ Enabled" if key["enabled"] else "❌ Disabled"
            print(f"  {status} - {key['user_name']}")
            print(f"    Created: {key['created_at']}")
            print(f"    Requests: {key['total_requests']}")
            if key.get("last_request"):
                print(f"    Last used: {key['last_request']}")
            print()

    elif command == "revoke":
        if len(sys.argv) < 3:
            print("Error: api_key required")
            sys.exit(1)

        api_key = sys.argv[2]
        if manager.revoke_api_key(api_key):
            print("✅ API key revoked")
        else:
            print("❌ API key not found")

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
