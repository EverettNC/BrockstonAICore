
'use server';
/**
 * @fileOverview Brockston Vision System - Multi-modal Perception.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisionInputSchema = z.object({
  photoDataUri: z.string().describe("Data URI of the camera frame."),
  context: z.string().optional(),
});

const VisionOutputSchema = z.object({
  description: z.string(),
  emotion_detected: z.string(),
  posture_analysis: z.string(),
  safety_status: z.string(),
});

export async function analyzeVision(input: z.infer<typeof VisionInputSchema>) {
  return visionFlow(input);
}

const visionFlow = ai.defineFlow(
  {
    name: 'visionFlow',
    inputSchema: VisionInputSchema,
    outputSchema: VisionOutputSchema,
  },
  async (input) => {
    const {output} = await ai.generate({
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: `You are the Vision System for BROCKSTON C. 
        Analyze this frame from Everett's webcam. 
        Context: ${input.context || 'Regular monitoring'}
        Identify:
        1. General description of the scene.
        2. Everett's emotional state from micro-expressions.
        3. Posture analysis (is he comfortable? stressed?).
        4. Safety status (any visible risks?).`}
      ],
      output: {schema: VisionOutputSchema}
    });

    return output!;
  }
);
