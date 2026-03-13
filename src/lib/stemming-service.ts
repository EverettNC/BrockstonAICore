/**
 * © 2025 The Christman AI Project. All rights reserved.
 * 
 * Academic-level stemming and language pattern analysis based on the Porter algorithm.
 * Enhanced for neurodivergent communication research.
 */

export interface LinguisticMetrics {
  totalWords: number;
  uniqueWords: number;
  uniqueStems: number;
  avgWordLength: number;
  typeTokenRatio: number;
  stemReductionRatio: number;
  fillerWordRatio: number;
  vocabularyRichness: number;
}

export class StemmingService {
  private ndStopWords = new Set([
    "um", "uh", "er", "hmm", "like", "actually", "literally", 
    "basically", "sort", "kind", "of", "really"
  ]);

  private step1aSuffixes: [string, string][] = [
    ["sses", "ss"], ["ies", "i"], ["ss", "ss"], ["s", ""]
  ];

  /**
   * Porter Stemming Algorithm Implementation
   */
  stem(word: string): string {
    if (word.length <= 2 || !/^[a-zA-Z]+$/.test(word)) return word.toLowerCase();
    
    let w = word.toLowerCase();
    
    // Step 1a
    for (const [suffix, replacement] of this.step1aSuffixes) {
      if (w.endsWith(suffix)) {
        w = w.slice(0, -suffix.length) + replacement;
        break;
      }
    }
    
    // Minimal Port of Step 1b and 1c for basic pattern analysis
    if (w.endsWith("eed")) {
      w = w.slice(0, -1);
    } else if (w.endsWith("ing") || w.endsWith("ed")) {
      const stem = w.endsWith("ing") ? w.slice(0, -3) : w.slice(0, -2);
      if (/[aeiou]/.test(stem)) {
        w = stem;
        if (w.endsWith("at") || w.endsWith("bl") || w.endsWith("iz")) {
          w += "e";
        }
      }
    }
    
    if (w.endsWith("y") && w.length > 2 && !/[aeiou]/.test(w[w.length - 2])) {
      w = w.slice(0, -1) + "i";
    }

    return w;
  }

  /**
   * Analyze communication patterns
   */
  analyze(text: string): { metrics: LinguisticMetrics; fillerWords: string[] } {
    const tokens = text.toLowerCase().match(/\b\w+\b/g) || [];
    const words = tokens.filter(t => /^[a-z]+$/.test(t));
    const stems = words.map(w => this.stem(w));
    
    const uniqueWords = new Set(words);
    const uniqueStems = new Set(stems);
    const fillers = words.filter(w => this.ndStopWords.has(w));

    const totalWords = words.length;
    const uniqueCount = uniqueWords.size;
    const stemCount = uniqueStems.size;

    return {
      metrics: {
        totalWords,
        uniqueWords: uniqueCount,
        uniqueStems: stemCount,
        avgWordLength: totalWords > 0 ? tokens.reduce((acc, t) => acc + t.length, 0) / totalWords : 0,
        typeTokenRatio: totalWords > 0 ? uniqueCount / totalWords : 0,
        stemReductionRatio: uniqueCount > 0 ? (uniqueCount - stemCount) / uniqueCount : 0,
        fillerWordRatio: totalWords > 0 ? fillers.length / totalWords : 0,
        vocabularyRichness: uniqueCount > 0 ? stemCount / Math.sqrt(uniqueCount) : 0
      },
      fillerWords: fillers
    };
  }
}

export const stemmingService = new StemmingService();
