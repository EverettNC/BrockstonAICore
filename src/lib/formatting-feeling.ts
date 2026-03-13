/**
 * @fileOverview Formatting–Feeling Law
 * Humans read formatting as feeling. Silicon uses formatting as function.
 * 
 * Quantifies the "Visual Volume" of text to avoid unintentional shouting.
 * © 2025 The Christman AI Project. All rights reserved.
 */

export interface FormattingFeelingSignal {
  caps_intensity: number;    // 0.0–1.0  how shouty it looks
  punctuation_heat: number;  // 0.0–1.0  how much !!!!/???? noise
  length: number;            // number of characters
  looks_like_yelling: boolean;  // coarse flag
}

class FormattingFeelingLaw {
  private capsRatio(text: string): number {
    const letters = text.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) return 0.0;
    
    let upper = 0;
    for (const char of letters) {
      if (char === char.toUpperCase()) upper++;
    }
    return upper / letters.length;
  }

  private punctuationHeat(text: string): number {
    const exclam = (text.match(/!/g) || []).length;
    const quest = (text.match(/\?/g) || []).length;
    const dots = (text.match(/\.\.\./g) || []).length;
    
    // Weighted score
    const score = exclam * 1.0 + quest * 0.8 + dots * 0.5;
    const length = Math.max(text.length, 1);
    
    // Normalize and cap at 1.0
    return Math.min((score / length) * 10.0, 1.0);
  }

  analyze(text: string): FormattingFeelingSignal {
    const caps = this.capsRatio(text);
    const heat = this.punctuationHeat(text);
    const looksLikeYelling = caps > 0.7 && text.length > 5;

    return {
      caps_intensity: parseFloat(caps.toFixed(3)),
      punctuation_heat: parseFloat(heat.toFixed(3)),
      length: text.length,
      looks_like_yelling: looksLikeYelling
    };
  }
}

export const formattingFeelingLaw = new FormattingFeelingLaw();
