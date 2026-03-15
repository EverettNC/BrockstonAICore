# lucas_recovery.py
# Alzheimer's & Dementia LTP Refile Kernel
# Carbon–Silicon Symbiosis v1.0 (logic prototype)
from __future__ import annotations
from dataclasses import dataclass
from typing import Dict
import torch

@dataclass
class LucasConfig:
    # "LC wake" multiplier (metaphor for readiness / noradrenergic tone)
    ltp_boost: float = 1.15
    # How much safety reduces trauma association per session
    safe_overlay: float = 0.08
    # How much safety is added into lived_truth as an "on-top" layer
    safety_gain: float = 0.20
    # LC threshold required to allow decay of trauma association
    threshold: float = 0.70
    # Nonlinearity gain for safety spike
    spike_gain: float = 10.0

class LucasRecovery:
    """
    State vectors (per patient or per memory-slot system):
    trauma_embedding: association strength of threat-tagged memory cues
    lived_truth: untouchable core (never erased; only appended/overlaid)
    lucas_state: readiness / regulation state (metaphor for LC tone)
    explicit_memory: narrative workspace (what we present / refile)
    """
    def __init__(self, memory_size: int, device: str | None = None, cfg: LucasConfig | None = None):
        self.cfg = cfg or LucasConfig()
        if device is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        self.device = torch.device(device)
        
        # Core state
        self.trauma_embedding = torch.zeros(memory_size, device=self.device)
        self.lived_truth = torch.zeros(memory_size, device=self.device)
        
        # Start semi-awake regulation baseline
        self.lucas_state = torch.full((memory_size,), 0.6, device=self.device)
        self.explicit_memory = torch.zeros(memory_size, device=self.device)

    # ---------------------------
    # Core operations
    # ---------------------------
    def submit_pain(self, pain_level: torch.Tensor) -> None:
        """
        pain_level: tensor in [0, 1] or higher if you want, shape [memory_size]
        Rule: never erase lived_truth; pain is allowed to deepen witness.
        """
        pain_level = self._as_vec(pain_level)
        # Wake state slightly (threat arousal)
        self.lucas_state = torch.clamp(self.lucas_state * 1.10, 0.0, 2.0)
        # Preserve witness: lived_truth becomes at least the pain tag
        self.lived_truth = torch.maximum(self.lived_truth, pain_level)
        # Threat association can increase (optional, but coherent)
        self.trauma_embedding = torch.maximum(self.trauma_embedding, pain_level)
        # Narrative workspace reflects current truth
        self.explicit_memory = self.lived_truth.clone()

    def safety_replay(self, safety_signal: torch.Tensor) -> None:
        """
        safety_signal: tensor in [0, 1], shape [memory_size]
        Rule: safety overlays context; it does not delete lived_truth.
        Trauma association decays only if lucas_state is strong enough.
        """
        safety_signal = self._as_vec(safety_signal).clamp(0.0, 1.0)
        # Wake regulation state (metaphor: bring clarity online)
        self.lucas_state = torch.clamp(self.lucas_state * self.cfg.ltp_boost, 0.0, 2.0)
        # Safety spike is nonlinear and gated by lucas_state
        safe_spike = torch.tanh(safety_signal * self.lucas_state * self.cfg.spike_gain)
        # Overlay safety onto lived_truth (append, never erase)
        self.lived_truth = self.lived_truth + (safe_spike * self.cfg.safety_gain)
        # Narrative workspace is "truth + safety context"
        self.explicit_memory = self.lived_truth + safe_spike
        # Only decay trauma if regulation is strong enough
        can_decay = self.lucas_state > self.cfg.threshold
        # Decay term: proportional to safe_spike
        decay = safe_spike * self.cfg.safe_overlay
        # Apply decay only where allowed, clamp at 0
        new_trauma = torch.clamp(self.trauma_embedding - decay, min=0.0)
        self.trauma_embedding = torch.where(can_decay, new_trauma, self.trauma_embedding)
        
        # Optional: as safety succeeds, lucas_state settles slightly
        self.lucas_state = torch.where(can_decay, self.lucas_state * 0.92, self.lucas_state)

    # ---------------------------
    # Utilities
    # ---------------------------
    def _as_vec(self, x: torch.Tensor) -> torch.Tensor:
        if not torch.is_tensor(x):
            raise TypeError("Input must be a torch.Tensor")
        x = x.to(self.device)
        if x.dim() == 0:
            x = x.repeat(self.lived_truth.shape[0])
        if x.shape[0] != self.lived_truth.shape[0]:
            raise ValueError(f"Expected shape [{self.lived_truth.shape[0]}], got {tuple(x.shape)}")
        return x

    def get_state(self) -> Dict[str, object]:
        return {
            "lived_truth": self.lived_truth.detach().cpu().numpy(),
            "trauma": self.trauma_embedding.detach().cpu().numpy(),
            "lucas_state": self.lucas_state.detach().cpu().numpy(),
            "narrative": self.explicit_memory.detach().cpu().numpy(),
            "device": str(self.device),
        }

# ---------------------------
# Usage
# ---------------------------
if __name__ == "__main__":
    model = LucasRecovery(1024)
    # Inject pain (PTSD tag, or a distress spike)
    model.submit_pain(torch.ones(1024) * 0.9)
    # Safety overlay session (voice, warmth, trusted presence)
    model.safety_replay(torch.ones(1024) * 0.85)
    
    state = model.get_state()
    print("device:", state["device"])
    print("lived_truth mean:", state["lived_truth"].mean())
    print("trauma mean:", state["trauma"].mean())
    print("lucas_state mean:", state["lucas_state"].mean())
