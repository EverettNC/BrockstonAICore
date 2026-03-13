/**
 * @fileOverview Intervention Protocol - The "Hand of God"
 * Status: Immutable / High-Priority
 * 
 * This module executes when Inferno/AlphaVox detects the '30-second warning'
 * (Pre-suicidal voice tremors, high cortisol VOCs, dissociative silence).
 * It bypasses the LLM's generative layer to ensure safety.
 * 
 * © 2025 The Christman AI Project. All rights reserved.
 */

export interface InterventionSequence {
  phase_1_sensory: string;
  phase_2_verbal: string;
  phase_3_lock: string;
  meta_action: string;
  risk_level: number;
}

class InterventionProtocol {
  private contextKeywords = ["alone", "scared", "end", "tired", "kill", "hurt", "safety"];

  /**
   * Executes the hard-coded sequence when risk is critical.
   */
  executeSequence(riskLevel: number, text: string): InterventionSequence {
    const context = text.toLowerCase();
    
    // Phase 1: The Pattern Break (Immediate Sensory Shift)
    const sensoryShift = this.selectSensoryAnchor(riskLevel);
    
    // Phase 2: The Anchor Statement (Neuro-Linguistic Programming)
    const anchorStatement = this.getAnchorStatement(riskLevel, context);
    
    // Phase 3: The Connection Lock
    const connectionLock = "I am keeping this line open. I am not going anywhere.";
    
    return {
      phase_1_sensory: sensoryShift,
      phase_2_verbal: anchorStatement,
      phase_3_lock: connectionLock,
      meta_action: "NOTIFY_HUMAN_OPERATOR_IMMEDIATE",
      risk_level: riskLevel
    };
  }

  private selectSensoryAnchor(risk: number): string {
    if (risk > 0.9) {
      // Extreme Risk: Strong grounding needed
      return "AUDIO_OUTPUT: 40Hz_Binaural_Beat (Gamma) + Blue_Light_Pulse";
    }
    // High Risk: Soothing grounding
    return "AUDIO_OUTPUT: Brown_Noise_Fade_In + Warm_Light_Pulse";
  }

  private getAnchorStatement(risk: number, context: string): string {
    if (risk > 0.9) {
      return "Listen to my voice. Just the sound. You don't need to speak. Just breathe with the sound.";
    }
    
    if (this.contextKeywords.some(k => context.includes(k))) {
      if (context.includes("alone")) {
        return "You are not alone in this room. I am right here.";
      }
      if (context.includes("scared")) {
        return "I hear the fear. I am holding the line. We are staying right here until it passes.";
      }
    }

    return "I hear how heavy this is. Let's just sit with it for a minute. No fixing, just being.";
  }
}

export const interventionProtocol = new InterventionProtocol();
