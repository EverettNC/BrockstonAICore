# InfernoTraumaInference.py
import time
import numpy as np
from InfernoSoulForge import InfernoConfig, inferno_soul_forge_full


def main() -> None:
    print("🔥 Inferno Soul Forge - Trauma Inference Example")
    print("================================================\n")

    # Configuration (mirrors your C++ main)
    NUM_VETS = 4
    TIMESTEPS = 64
    EMBED_DIM = 128
    EMPATHY_FACTOR = 6.3
    EMPATHY_GAIN = 1.2
    WHISPER_CUTOFF = 0.4

    print("Configuration:")
    print(f"  Veterans:            {NUM_VETS}")
    print(f"  Timesteps:           {TIMESTEPS}")
    print(f"  Embedding Dimension: {EMBED_DIM}")
    print(f"  Empathy Factor:      {EMPATHY_FACTOR:.1f} (6.3 years of experience)")
    print(f"  Empathy Gain:        {EMPATHY_GAIN:.1f}")
    print(f"  Whisper Cutoff:      {WHISPER_CUTOFF:.1f}\n")

    # --- Synthetic data setup (same intent as C++) ---
    print("Initializing synthetic trauma data...")

    # rawSignal: shape (M, N, D)
    raw_signal = np.random.uniform(
        low=-1.0,
        high=1.0,
        size=(NUM_VETS, TIMESTEPS, EMBED_DIM),
    ).astype(np.float32)

    # Derek's 12-year memory: (M, N), 80% positive patterns
    derek_memory = (np.random.rand(NUM_VETS, TIMESTEPS) < 0.8).astype(np.int32)

    # Emergency flags: (M, N) – one crisis at vet #2, timestep 32
    emergency_flag = np.zeros((NUM_VETS, TIMESTEPS), dtype=np.float32)
    emergency_flag[2, 32] = 0.9  # emergency trigger
    print("  ⚠  Simulated emergency at Vet #2, timestep 32\n")

    # --- Run full Inferno engine ---
    print("Running Inferno Soul Forge engine...\n")

    config = InfernoConfig(
        empathy_factor=EMPATHY_FACTOR,
        whisper_cutoff=WHISPER_CUTOFF,
    )

    start = time.perf_counter()
    empathy_output = inferno_soul_forge_full(
        raw_signal=raw_signal,
        derek_memory=derek_memory,
        emergency_flag=emergency_flag,
        config=config,
        empathy_gain=EMPATHY_GAIN,
    )
    elapsed_ms = (time.perf_counter() - start) * 1000.0
    print(f"✅ Inference complete in {elapsed_ms:.2f} ms\n")

    # --- Analysis (same vibe as C++) ---
    print("Results Analysis:")
    print("================================================")

    for vet in range(NUM_VETS):
        print(f"\nVeteran #{vet}:")
        vet_empathy = empathy_output[vet]  # shape: (TIMESTEPS,)
        avg_empathy = float(vet_empathy.mean())
        max_response = float(vet_empathy.max())
        max_step = int(vet_empathy.argmax())

        print(f"  Avg Empathy:    {avg_empathy:.3f}")
        print(f"  Peak Response:  {max_response:.3f} at timestep {max_step}")

        emergency_here = (
            emergency_flag[vet, max_step] > config.emergency_threshold
        )

        if emergency_here:
            print("  🚨 EMERGENCY DETECTED - Full attention activated")
        elif max_response < config.whisper_cutoff:
            print("  🤫 Whisper mode - gentle presence")
        else:
            print("  💬 Normal therapeutic mode")

    print("\n================================================")
    print(f"🧠 Empathy as leakage: {config.micro_bleed * 100:.3f}% memory bleed-through")
    print(f"❤  {config.empathy_factor:.1f} years of lived experience encoded (conceptually)")
    print("✅ System ready for synthetic trauma inference run\n")


if __name__ == "__main__":
    main()


# ==============================================================================
# InfernoSoulForge API reference (what this file expects from InfernoSoulForge.py)
# ==============================================================================
#
# InfernoConfig
#   Holds knobs like:
#     empathy_factor
#     micro_bleed
#     emergency_threshold
#     whisper_cutoff
#
# inferno_soul_forge(trauma_embedding, symbolic_clauses, config)
#   Python/NumPy version of this CUDA kernel:
#   __global__ void infernoSoulForge(
#       float* traumaEmbedding,
#       int*   symbolicClauses,
#       float* attentionFlow,
#       int N, int M,
#       float empathyFactor
#   );
#
# inferno_soul_forge_full(raw_signal, derek_memory, emergency_flag, config, empathy_gain)
#   Python/NumPy version of:
#   __global__ void infernoSoulForge_full(
#       float* rawSignal,
#       int*   derekMemory,
#       float* emergencyFlag,
#       float* attentionFlow,
#       float* empathyOutput,
#       int N, int M, int D,
#       float empathyGain,
#       float whisperCutoff
#   );
# ==============================================================================
