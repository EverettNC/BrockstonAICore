"""
Web module for Brockston
Simple web utilities and helpers
"""

from typing import Dict, Any


class WebHelper:
    """Simple web helper utilities"""

    def __init__(self):
        self.config = {}

    def get_config(self) -> Dict[str, Any]:
        """Get web configuration"""
        return self.config

    def set_config(self, config: Dict[str, Any]):
        """Set web configuration"""
        self.config = config


# Global web helper instance
web_helper = WebHelper()


def get_web_helper():
    """Get web helper instance"""
    return web_helper
