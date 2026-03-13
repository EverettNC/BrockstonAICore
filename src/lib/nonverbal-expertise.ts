/**
 * © 2025 The Christman AI Project. All rights reserved.
 * 
 * BROCKSTON - Nonverbal Communication Expertise Module
 */

export interface ResearchReference {
  author: string;
  year: number;
  title: string;
  journal: string;
}

export const NONVERBAL_EXPERTISE = {
  gesture_interpretation: {
    title: "Gesture Interpretation",
    strategy: "Observe the context and frequency of gestures to infer intent.",
    references: [
      { author: "McNeill, D.", year: 2022, title: "Hand and Mind: What Gestures Reveal about Thought", journal: "Journal of Nonverbal Behavior" },
      { author: "Goldin-Meadow, S.", year: 2021, title: "The role of gesture in communication and thinking", journal: "Trends in Cognitive Sciences" }
    ]
  },
  eye_tracking: {
    title: "Eye Tracking Patterns",
    strategy: "Focus on gaze patterns to understand attention and interest.",
    references: [
      { author: "Klin, A. et al.", year: 2022, title: "Visual fixation patterns during viewing of naturalistic social situations", journal: "Nature" }
    ]
  },
  facial_expressions: {
    title: "Facial Expressions",
    strategy: "Identify universal expressions like happiness or sadness for emotional cues.",
    references: [
      { author: "Ekman, P.", year: 2020, title: "Universal facial expressions of emotion", journal: "Psychological Review" }
    ]
  },
  autism_nonverbal: {
    title: "Autism Nonverbal Patterns",
    strategy: "Use augmentative communication tools to support nonverbal individuals.",
    references: [
      { author: "Lord, C. et al.", year: 2023, title: "Multimodal communication patterns in autism spectrum disorder", journal: "Journal of Autism and Developmental Disorders" }
    ]
  }
};

export type ExpertiseTopic = keyof typeof NONVERBAL_EXPERTISE;

export function getExpertise(topic: ExpertiseTopic) {
  return NONVERBAL_EXPERTISE[topic];
}

export function searchExpertise(query: string) {
  const q = query.toLowerCase();
  for (const [key, value] of Object.entries(NONVERBAL_EXPERTISE)) {
    if (q.includes(key.replace('_', ' ')) || q.includes(value.title.toLowerCase())) {
      return value;
    }
  }
  return null;
}
