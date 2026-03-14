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

"""
HIPAA-Compliant Memory Engine with Encryption
Production-ready data storage with full compliance features
"""

import hashlib
import json
import logging
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from security_config import HIPAAEncryption, HIPAALogger

logger = logging.getLogger(__name__)


class MemoryEngine:
    """HIPAA-compliant memory engine with encryption at rest."""

    def __init__(self, db_path: str | None = None):
        self.db_path = db_path or os.getenv(
            "DATABASE_PATH", "/var/lib/brockston/memory.db"
        )
        self.encryption = HIPAAEncryption()
        self.audit_logger = HIPAALogger()

        # Ensure database directory exists
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)

        # Initialize database
        self.initialize_database()

    def initialize_database(self):
        """Initialize database with HIPAA-compliant schema."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Users table
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL,
                    permissions TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    account_locked BOOLEAN DEFAULT FALSE,
                    failed_login_attempts INTEGER DEFAULT 0
                )
            """
            )

            # Patient data table (encrypted)
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS patient_data (
                    patient_id TEXT PRIMARY KEY,
                    encrypted_data TEXT NOT NULL,
                    data_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_by TEXT NOT NULL,
                    FOREIGN KEY (created_by) REFERENCES users (user_id)
                )
            """
            )

            # Conversation history (encrypted)
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS conversations (
                    conversation_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    patient_id TEXT,
                    encrypted_message TEXT NOT NULL,
                    encrypted_response TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    session_id TEXT,
                    FOREIGN KEY (user_id) REFERENCES users (user_id),
                    FOREIGN KEY (patient_id) REFERENCES patient_data (patient_id)
                )
            """
            )

            # Behavior analysis (encrypted)
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS behavior_analysis (
                    analysis_id TEXT PRIMARY KEY,
                    patient_id TEXT NOT NULL,
                    user_id TEXT NOT NULL,
                    encrypted_behavior_data TEXT NOT NULL,
                    encrypted_analysis TEXT NOT NULL,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    confidence_score REAL,
                    FOREIGN KEY (patient_id) REFERENCES patient_data (patient_id),
                    FOREIGN KEY (user_id) REFERENCES users (user_id)
                )
            """
            )

            # Audit log for HIPAA compliance
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS audit_log (
                    log_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    resource_type TEXT NOT NULL,
                    resource_id TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    success BOOLEAN NOT NULL,
                    details TEXT
                )
            """
            )

            # Create indexes for performance
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_conversations_patient ON conversations(patient_id)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_behavior_patient ON behavior_analysis(patient_id)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id)"
            )
            cursor.execute(
                "CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp)"
            )

            conn.commit()
            logger.info("HIPAA-compliant database initialized")

    def store_conversation(self, conversation_data: Dict[str, Any]) -> bool:
        """Store encrypted conversation data."""
        try:
            conversation_id = hashlib.sha256(
                f"{conversation_data['user_id']}{conversation_data['timestamp']}".encode()
            ).hexdigest()

            # Encrypt sensitive data
            encrypted_message = self.encryption.encrypt(conversation_data["message"])
            encrypted_response = self.encryption.encrypt(conversation_data["response"])

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO conversations
                    (conversation_id, user_id, patient_id, encrypted_message,
                     encrypted_response, timestamp, session_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        conversation_id,
                        conversation_data["user_id"],
                        conversation_data.get("patient_id"),
                        encrypted_message,
                        encrypted_response,
                        conversation_data["timestamp"],
                        conversation_data.get("session_id"),
                    ),
                )

                # Log access for HIPAA compliance
                self.audit_logger.log_access(
                    conversation_data["user_id"],
                    "STORE_CONVERSATION",
                    "conversation",
                    conversation_data.get("ip_address", "unknown"),
                    True,
                )

                return True

        except Exception as e:
            logger.error(f"Failed to store conversation: {e}")
            return False

    def store_behavior_analysis(self, analysis_data: Dict[str, Any]) -> bool:
        """Store encrypted behavior analysis data."""
        try:
            analysis_id = hashlib.sha256(
                f"{analysis_data['patient_id']}{analysis_data['timestamp']}".encode()
            ).hexdigest()

            # Encrypt sensitive data
            encrypted_behavior = self.encryption.encrypt(
                json.dumps(analysis_data["behavior_data"])
            )
            encrypted_analysis = self.encryption.encrypt(
                json.dumps(analysis_data["analysis"])
            )

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    INSERT INTO behavior_analysis
                    (analysis_id, patient_id, user_id, encrypted_behavior_data,
                     encrypted_analysis, timestamp, confidence_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        analysis_id,
                        analysis_data["patient_id"],
                        analysis_data["user_id"],
                        encrypted_behavior,
                        encrypted_analysis,
                        analysis_data["timestamp"],
                        analysis_data.get("confidence_score", 0.0),
                    ),
                )

                # Log data access
                if analysis_data.get("patient_id"):
                    self.audit_logger.log_data_access(
                        analysis_data["user_id"],
                        analysis_data["patient_id"],
                        "behavior_analysis",
                        analysis_data.get("ip_address", "unknown"),
                        "Store behavior analysis",
                    )

                return True

        except Exception as e:
            logger.error(f"Failed to store behavior analysis: {e}")
            return False

    def get_patient_data(
        self, patient_id: str, user_id: str | None = None
    ) -> Optional[Dict[str, Any]]:
        """Retrieve encrypted patient data with audit logging."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    SELECT encrypted_data, created_at, updated_at, created_by
                    FROM patient_data
                    WHERE patient_id = ?
                """,
                    (patient_id,),
                )

                result = cursor.fetchone()
                if not result:
                    return None

                # Decrypt data
                decrypted_data = self.encryption.decrypt(result[0])
                patient_data = json.loads(decrypted_data)

                # Add metadata
                patient_data.update(
                    {
                        "patient_id": patient_id,
                        "created_at": result[1],
                        "updated_at": result[2],
                        "created_by": result[3],
                    }
                )

                # Log data access
                if user_id:
                    self.audit_logger.log_data_access(
                        user_id,
                        patient_id,
                        "patient_data_retrieval",
                        "internal",
                        "Data retrieval",
                    )

                return patient_data

        except Exception as e:
            logger.error(f"Failed to retrieve patient data: {e}")
            return None

    def store_patient_data(
        self, patient_id: str, data: Dict[str, Any], user_id: str
    ) -> bool:
        """Store encrypted patient data."""
        try:
            # Encrypt data
            encrypted_data = self.encryption.encrypt(json.dumps(data))
            data_hash = hashlib.sha256(encrypted_data.encode()).hexdigest()

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Check if patient exists
                cursor.execute(
                    "SELECT patient_id FROM patient_data WHERE patient_id = ?",
                    (patient_id,),
                )
                exists = cursor.fetchone()

                if exists:
                    # Update existing record
                    cursor.execute(
                        """
                        UPDATE patient_data
                        SET encrypted_data = ?, data_hash = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE patient_id = ?
                    """,
                        (encrypted_data, data_hash, patient_id),
                    )
                else:
                    # Insert new record
                    cursor.execute(
                        """
                        INSERT INTO patient_data
                        (patient_id, encrypted_data, data_hash, created_by)
                        VALUES (?, ?, ?, ?)
                    """,
                        (patient_id, encrypted_data, data_hash, user_id),
                    )

                # Log data access
                self.audit_logger.log_data_access(
                    user_id,
                    patient_id,
                    "patient_data_storage",
                    "internal",
                    "Store patient data",
                )

                return True

        except Exception as e:
            logger.error(f"Failed to store patient data: {e}")
            return False

    def get_conversation_history(
        self, patient_id: str, user_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Retrieve conversation history with decryption."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    SELECT conversation_id, encrypted_message, encrypted_response,
                           timestamp, session_id
                    FROM conversations
                    WHERE patient_id = ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                """,
                    (patient_id, limit),
                )

                conversations = []
                for row in cursor.fetchall():
                    try:
                        # Decrypt conversation data
                        message = self.encryption.decrypt(row[1])
                        response = self.encryption.decrypt(row[2])

                        conversations.append(
                            {
                                "conversation_id": row[0],
                                "message": message,
                                "response": response,
                                "timestamp": row[3],
                                "session_id": row[4],
                            }
                        )
                    except Exception as e:
                        logger.warning(f"Failed to decrypt conversation {row[0]}: {e}")
                        continue

                # Log data access
                self.audit_logger.log_data_access(
                    user_id,
                    patient_id,
                    "conversation_history",
                    "internal",
                    f"Retrieved {len(conversations)} conversations",
                )

                return conversations

        except Exception as e:
            logger.error(f"Failed to retrieve conversation history: {e}")
            return []

    def get_status(self) -> Dict[str, Any]:
        """Get memory engine status."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Count records
                cursor.execute("SELECT COUNT(*) FROM conversations")
                conversation_count = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM patient_data")
                patient_count = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM behavior_analysis")
                analysis_count = cursor.fetchone()[0]

                cursor.execute("SELECT COUNT(*) FROM users")
                user_count = cursor.fetchone()[0]

                return {
                    "status": "operational",
                    "database_path": self.db_path,
                    "encryption_enabled": True,
                    "record_counts": {
                        "conversations": conversation_count,
                        "patients": patient_count,
                        "behavior_analyses": analysis_count,
                        "users": user_count,
                    },
                    "hipaa_compliant": True,
                }

        except Exception as e:
            logger.error(f"Failed to get status: {e}")
            return {"status": "error", "error": str(e)}

    def cleanup_old_data(self, retention_days: int = 2555):  # 7 years HIPAA retention
        """Clean up old data per HIPAA retention policies."""
        try:
            cutoff_date = datetime.now() - timedelta(days=retention_days)

            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Archive old conversations
                cursor.execute(
                    """
                    DELETE FROM conversations
                    WHERE timestamp < ?
                """,
                    (cutoff_date.isoformat(),),
                )

                conversations_deleted = cursor.rowcount

                # Archive old behavior analyses
                cursor.execute(
                    """
                    DELETE FROM behavior_analysis
                    WHERE timestamp < ?
                """,
                    (cutoff_date.isoformat(),),
                )

                analyses_deleted = cursor.rowcount

                logger.info(
                    f"Cleaned up {conversations_deleted} conversations and {analyses_deleted} analyses older than {retention_days} days"
                )

                return {
                    "conversations_deleted": conversations_deleted,
                    "analyses_deleted": analyses_deleted,
                }

        except Exception as e:
            logger.error(f"Failed to cleanup old data: {e}")
            return None


__all__ = ["MemoryEngine"]
