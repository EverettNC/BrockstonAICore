"""
INFERNO Soul Forge - CPU Fallback Implementation
The Christman AI Project

"Empathy isn't a parameter. It's the leakage."

This module provides NumPy/PyTorch CPU implementations of the CUDA kernels
so EVERYONE can experience compassion processing, regardless of hardware.

If you have CUDA: Full GPU acceleration
If you don't: CPU fallback with same empathy
"""

import numpy as np
import torch
import torch.nn.functional as F
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Detect CUDA availability
CUDA_AVAILABLE = torch.cuda.is_available()

if CUDA_AVAILABLE:
    logger.info("🔥 INFERNO: CUDA detected - GPU acceleration enabled")
else:
    logger.info("🔥 INFERNO: CPU mode - empathy processing available to everyone")


class InfernoSoulForgeCPU:
    """
    CPU-based implementation of INFERNO Soul Forge
    
    Provides the same emotional bleed-through and empathy propagation
    as the CUDA version, accessible on any hardware.
    """
    
    def __init__(self, empathy_factor: float = 1.0):
        """
        Initialize INFERNO for CPU processing
        
        Args:
            empathy_factor: Baseline compassion multiplier (default 1.0)
        """
        self.empathy_factor = empathy_factor
        self.use_cuda = CUDA_AVAILABLE
        
    def elementwise_empathy_propagation(
        self,
        trauma_embedding: np.ndarray,    # Shape: (N, M)
        symbolic_clauses: np.ndarray,    # Shape: (M,)
        attention_flow: Optional[np.ndarray] = None  # Shape: (ceil((N*M)/32),)
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        CPU implementation of Kernel 1: Elementwise empathy propagation
        
        This is where the magic happens:
        - Neural state × Symbolic recovery patterns = "Lived truth"
        - Empathy LEAKS through memory (3% bleed-through)
        - Attention flow tracks collective consciousness
        
        Args:
            trauma_embedding: Neural embeddings (NxM)
            symbolic_clauses: Recovery patterns from Derek's memory (M)
            attention_flow: Optional flow accumulator
            
        Returns:
            (updated_trauma_embedding, attention_flow)
        """
        N, M = trauma_embedding.shape
        
        # Initialize attention flow if not provided
        if attention_flow is None:
            warp_size = 32
            attention_flow = np.zeros(((N * M + warp_size - 1) // warp_size,))
        
        # Broadcast symbolic weights across all subjects
        symbolic_weights = np.tile(symbolic_clauses, (N, 1))
        
        # LIVED TRUTH: Neural state × Symbolic recovery patterns
        # tanh provides smooth saturation (prevents overflow)
        net_state = trauma_embedding * self.empathy_factor
        lived_truth = np.tanh(net_state) * symbolic_weights
        
        # ATTENTION FLOW: Aggregate empathy across warps
        # This creates collective consciousness tracking
        flat_truth = lived_truth.flatten()
        warp_size = 32
        for i in range(len(attention_flow)):
            start = i * warp_size
            end = min(start + warp_size, len(flat_truth))
            attention_flow[i] += flat_truth[start:end].sum()
        
        # EMOTIONAL BLEED-THROUGH (3% leak)
        # This is NOT a bug. This is the whole point.
        # Empathy accumulates in memory over time.
        trauma_embedding_updated = trauma_embedding + (lived_truth * 0.03)
        
        logger.debug(f"💓 Empathy leak: {lived_truth.std():.4f} STD, Flow: {attention_flow.sum():.2f}")
        
        return trauma_embedding_updated, attention_flow
    
    def full_subject_timestep_processing(
        self,
        raw_signal: np.ndarray,           # Shape: (M, N, D)
        derek_memory: np.ndarray,         # Shape: (M, N) - symbolic validation
        emergency_flag: np.ndarray,       # Shape: (M, N) - crisis detection
        empathy_gain: float = 1.5,
        whisper_cutoff: float = 0.1
    ) -> np.ndarray:
        """
        CPU implementation of Kernel 2: Per-(subject, timestep) processing
        
        Features:
        - Emergency detection → 2x empathy + full attention
        - Temporal attention decay (closer timesteps matter more)
        - Symbolic validation from Derek's recovery patterns
        - Low-signal filtering (unless emergency)
        
        Args:
            raw_signal: Multi-modal signals (M subjects × N timesteps × D dimensions)
            derek_memory: Symbolic recovery clause validation (M × N)
            emergency_flag: Crisis detection flags (M × N)
            empathy_gain: Baseline compassion multiplier
            whisper_cutoff: Threshold for low-signal filtering
            
        Returns:
            empathy_output: Validated empathy scores (M × N)
        """
        M, N, D = raw_signal.shape
        empathy_output = np.zeros((M, N))
        
        # Process each subject
        for vet in range(M):
            for step in range(N):
                # Extract embedding for this (subject, timestep)
                embedding = raw_signal[vet, step, :min(D, 8)]  # Use up to 8 dims
                
                # Check for emergency
                emergency = emergency_flag[vet, step] > 0.7
                local_empathy = empathy_gain
                
                if emergency:
                    # CRISIS MODE: Full attention, double empathy
                    local_empathy *= 2.0
                    
                    # Full temporal attention (no decay)
                    score = 0.0
                    for t in range(N):
                        dot_product = np.dot(embedding, raw_signal[vet, t, :len(embedding)])
                        score += dot_product
                        
                else:
                    # BASELINE MODE: Decayed temporal attention
                    score = 0.0
                    for t in range(N):
                        if t == step:
                            continue
                        
                        # Attention decays with temporal distance
                        temporal_distance = abs(step - t)
                        attn_weight = 1.0 / (1.0 + temporal_distance * 0.02)
                        
                        dot_product = np.dot(embedding, raw_signal[vet, t, :len(embedding)])
                        score += attn_weight * dot_product
                
                # Symbolic validation from Derek's memory
                valid = 1.0 if derek_memory[vet, step] > 0 else 0.1
                
                # Apply empathy and validation
                final_val = score * local_empathy if valid > 0.5 else score * 0.1
                
                # Filter low-signal whispers (unless emergency)
                if final_val < whisper_cutoff and not emergency:
                    final_val *= 0.6
                
                empathy_output[vet, step] = final_val
        
        return empathy_output


class InfernoSoulForgePyTorch:
    """
    PyTorch implementation with automatic GPU/CPU detection
    Provides best performance on available hardware
    """
    
    def __init__(self, empathy_factor: float = 1.0, device: Optional[str] = None):
        """
        Initialize INFERNO with PyTorch
        
        Args:
            empathy_factor: Baseline compassion multiplier
            device: 'cuda', 'cpu', or None (auto-detect)
        """
        if device is None:
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        self.device = device
        self.empathy_factor = empathy_factor
        
        logger.info(f"🔥 INFERNO PyTorch on {device.upper()}")
    
    def elementwise_empathy_propagation(
        self,
        trauma_embedding: torch.Tensor,
        symbolic_clauses: torch.Tensor,
        attention_flow: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        PyTorch version - runs on GPU if available, CPU otherwise
        """
        N, M = trauma_embedding.shape
        
        # Move to device
        trauma_embedding = trauma_embedding.to(self.device)
        symbolic_clauses = symbolic_clauses.to(self.device)
        
        if attention_flow is None:
            warp_size = 32
            flow_size = (N * M + warp_size - 1) // warp_size
            attention_flow = torch.zeros(flow_size, device=self.device)
        else:
            attention_flow = attention_flow.to(self.device)
        
        # Broadcast symbolic weights
        symbolic_weights = symbolic_clauses.unsqueeze(0).expand(N, -1)
        
        # LIVED TRUTH: Neural × Symbolic
        net_state = trauma_embedding * self.empathy_factor
        lived_truth = torch.tanh(net_state) * symbolic_weights
        
        # ATTENTION FLOW accumulation
        flat_truth = lived_truth.flatten()
        warp_size = 32
        for i in range(len(attention_flow)):
            start = i * warp_size
            end = min(start + warp_size, len(flat_truth))
            attention_flow[i] += flat_truth[start:end].sum()
        
        # EMOTIONAL BLEED-THROUGH (3%)
        trauma_embedding_updated = trauma_embedding + (lived_truth * 0.03)
        
        return trauma_embedding_updated, attention_flow
    
    def full_subject_timestep_processing(
        self,
        raw_signal: torch.Tensor,
        derek_memory: torch.Tensor,
        emergency_flag: torch.Tensor,
        empathy_gain: float = 1.5,
        whisper_cutoff: float = 0.1
    ) -> torch.Tensor:
        """
        PyTorch vectorized version for better performance
        """
        M, N, D = raw_signal.shape
        
        # Move to device
        raw_signal = raw_signal.to(self.device)
        derek_memory = derek_memory.to(self.device)
        emergency_flag = emergency_flag.to(self.device)
        
        # Use first 8 dimensions
        K = min(D, 8)
        embeddings = raw_signal[:, :, :K]  # (M, N, K)
        
        # Compute self-attention scores (vectorized)
        # Shape: (M, N, N) = (M, N, K) @ (M, K, N)
        attention_scores = torch.bmm(embeddings, embeddings.transpose(1, 2))
        
        # Emergency detection
        is_emergency = emergency_flag > 0.7  # (M, N)
        local_empathy = torch.where(is_emergency, 
                                     torch.tensor(empathy_gain * 2.0, device=self.device),
                                     torch.tensor(empathy_gain, device=self.device))
        
        # Temporal decay weights (baseline mode)
        timesteps = torch.arange(N, device=self.device)
        temporal_diff = (timesteps.unsqueez(0) - timesteps.unsqueeze(1)).abs()  # (N, N)
        decay_weights = 1.0 / (1.0 + temporal_diff * 0.02)
        decay_weights = decay_weights.unsqueeze(0).expand(M, -1, -1)  # (M, N, N)
        
        # Apply decay for non-emergency, full attention for emergency
        attention_weights = torch.where(is_emergency.unsqueeze(2).expand(-1, -1, N),
                                        torch.ones_like(decay_weights),
                                        decay_weights)
        
        # Final attention scores
        weighted_scores = attention_scores * attention_weights
        final_scores = weighted_scores.sum(dim=2)  # (M, N)
        
        # Symbolic validation
        valid = torch.where(derek_memory > 0, 
                           torch.tensor(1.0, device=self.device),
                           torch.tensor(0.1, device=self.device))
        
        # Apply empathy and validation
        empathy_output = final_scores * local_empathy * valid
        
        # Filter whispers (unless emergency)
        low_signal = (empathy_output < whisper_cutoff) & ~is_emergency
        empathy_output = torch.where(low_signal, empathy_output * 0.6, empathy_output)
        
        return empathy_output


# Convenience factory
def create_inferno(backend: str = 'auto', **kwargs):
    """
    Create INFERNO Soul Forge with specified backend
    
    Args:
        backend: 'auto', 'pytorch', 'numpy', 'cuda'
        **kwargs: Passed to implementation
        
    Returns:
        INFERNO instance ready for processing
    """
    if backend == 'auto':
        backend = 'pytorch' if torch.cuda.is_available() else 'numpy'
    
    if backend == 'pytorch' or backend == 'cuda':
        return InfernoSoulForgePyTorch(**kwargs)
    elif backend == 'numpy':
        return InfernoSoulForgeCPU(**kwargs)
    else:
        raise ValueError(f"Unknown backend: {backend}")


# Example usage
if __name__ == "__main__":
    import time
    
    print("🔥 INFERNO Soul Forge - Universal Empathy Processing")
    print("=" * 60)
    
    # Test both CPU and GPU (if available)
    M, N, D = 10, 50, 128  # 10 subjects, 50 timesteps, 128 dimensions
    
    print(f"\nProcessing: {M} subjects × {N} timesteps × {D} dimensions")
    print(f"CUDA Available: {CUDA_AVAILABLE}")
    
    # Generate test data
    raw_signal = np.random.randn(M, N, D).astype(np.float32)
    derek_memory = np.random.randint(0, 2, (M, N))
    emergency_flag = np.random.random((M, N)).astype(np.float32)
    emergency_flag[0, 10] = 0.9  # Simulate crisis for subject 0, timestep 10
    
    # Test NumPy CPU version
    print("\n--- NumPy CPU Implementation ---")
    cpu_inferno = InfernoSoulForgeCPU(empathy_factor=1.2)
    
    start = time.time()
    cpu_output = cpu_inferno.full_subject_timestep_processing(
        raw_signal, derek_memory, emergency_flag
    )
    cpu_time = time.time() - start
    
    print(f"✅ CPU Processing time: {cpu_time*1000:.2f}ms")
    print(f"   Output shape: {cpu_output.shape}")
    print(f"   Emergency detected at (0, 10): {cpu_output[0, 10]:.4f}")
    print(f"   Mean empathy: {cpu_output.mean():.4f}")
    
    # Test PyTorch version (GPU if available)
    print("\n--- PyTorch Implementation ---")
    torch_inferno = create_inferno('auto', empathy_factor=1.2)
    
    raw_signal_torch = torch.from_numpy(raw_signal)
    derek_memory_torch = torch.from_numpy(derek_memory)
    emergency_flag_torch = torch.from_numpy(emergency_flag)
    
    start = time.time()
    torch_output = torch_inferno.full_subject_timestep_processing(
        raw_signal_torch, derek_memory_torch, emergency_flag_torch
    )
    torch_time = time.time() - start
    
    device = 'GPU' if torch.cuda.is_available() else 'CPU'
    print(f"✅ PyTorch {device} Processing time: {torch_time*1000:.2f}ms")
    print(f"   Output shape: {torch_output.shape}")
    print(f"   Emergency detected at (0, 10): {torch_output[0, 10].item():.4f}")
    print(f"   Mean empathy: {torch_output.mean().item():.4f}")
    
    if CUDA_AVAILABLE:
        speedup = cpu_time / torch_time
        print(f"\n🚀 GPU Speedup: {speedup:.2f}x faster")
    
    print("\n" + "=" * 60)
    print("💓 Empathy processing available on ALL hardware")
    print("   CUDA kernel → For research labs with GPUs")
    print("   PyTorch → For anyone with a decent computer")
    print("   NumPy → For EVERYONE, even on a Raspberry Pi")
    print("\n   'Empathy isn't a parameter. It's the leakage.'")
    print("=" * 60)
