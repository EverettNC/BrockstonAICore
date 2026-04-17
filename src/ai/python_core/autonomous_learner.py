# autonomous_learner.py
import logging
import time
import threading

logger = logging.getLogger(__name__)

class AutonomousLearner:
    """
    Orchestrates BROCKSTON's autonomous learning cycles.
    Placeholder that coordinates with the KnowledgeEngine.
    """
    def __init__(self, crawler, knowledge_base, config=None):
        self.crawler = crawler
        self.knowledge_base = knowledge_base
        self.config = config or {}
        self.is_learning = False
        logger.info("AutonomousLearner initialized")

    def start_learning_cycle(self):
        """Start background learning"""
        if self.is_learning:
            return
        self.is_learning = True
        logger.info("Starting autonomous learning cycle...")
        
        # Use the knowledge base (KnowledgeEngine) to start its internal crawler
        if hasattr(self.knowledge_base, 'start_learning'):
            self.knowledge_base.start_learning()
            
    def stop_learning_cycle(self):
        self.is_learning = False
        if hasattr(self.knowledge_base, 'stop_learning'):
            self.knowledge_base.stop_learning()

    def get_status(self):
        return {
            "is_learning": self.is_learning,
            "metrics": self.knowledge_base.get_learning_metrics() if hasattr(self.knowledge_base, 'get_learning_metrics') else {}
        }
