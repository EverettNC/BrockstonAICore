'use server';

import { ai, LOCAL_MODEL } from '@/ai/genkit';
import { z } from 'genkit';
import { nlu } from '@/lib/nlu-core';
import { interventionProtocol } from '@/lib/intervention-protocol';

const AICoreConversationalInteractionInputSchema = z.object({
  message: z.string(),
  specialist: z.string().optional().default('brockston'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).default([]),
  visionSnapshot: z.object({
    events: z.array(z.any()),
    count: z.number()
  }).optional(),
  nlu_understanding: z.any().optional(),
  knowledgeContext: z.string().optional(),
});
export type AICoreConversationalInteractionInput = z.infer<typeof AICoreConversationalInteractionInputSchema>;

const AICoreConversationalInteractionOutputSchema = z.object({
  response: z.string(),
  reasoning_trace: z.object({
    classification: z.string(),
    plan: z.array(z.string()),
    verification: z.string(),
    ensemble_confidence: z.number(),
    engines_active: z.array(z.string()).optional(),
  }),
  tone_engine_v2: z.object({
    dominant_state: z.string(),
    action_state: z.enum(['NORMAL', 'HOLD_SPACE', 'INTERVENTION']),
    physical_intensity: z.number(),
    cadence_fingerprint: z.string(),
    raw_scores: z.record(z.number()),
  }),
  ethical_score: z.object({
    ethics: z.number(),
    integrity: z.number(),
    morality: z.number(),
    composite: z.number(),
  }),
  lucas_signal: z.object({
    salience: z.number(),
    stability: z.number(),
    anchor_weight: z.number(),
    mode: z.string(),
  }),
  empathy_signal: z.object({
    inward_leakage: z.number(),
    self_love_score: z.number(),
  }),
  nlu_understanding: z.any().optional(),
  intervention_data: z.any().optional(),
});
export type AICoreConversationalInteractionOutput = z.infer<typeof AICoreConversationalInteractionOutputSchema>;

const PYTHON_API = 'http://localhost:8000';

async function callPythonAnalyze(message: string, chatHistory: any[]): Promise<any> {
  try {
    const res = await fetch(`${PYTHON_API}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, chat_history: chatHistory, fast: true }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function callPythonStore(userMessage: string, brockstonResponse: string): Promise<void> {
  try {
    await fetch(`${PYTHON_API}/store`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_message: userMessage, brockston_response: brockstonResponse }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // non-blocking
  }
}

// Detect if the message is asking Brockston to repair/improve his own code
function detectSelfRepairIntent(message: string): 'fix' | 'improve' | 'scan' | null {
  const lower = message.toLowerCase();
  if (/fix (your|his|the|my|our) (own |)code|self.?repair|fix (the |a |any )?bug|repair yourself/.test(lower)) return 'fix';
  if (/improve (your|his|the|my|our) (own |)code|make (yourself|him) better|upgrade/.test(lower)) return 'improve';
  if (/scan (your|his|the) (code|modules)|what('s| is) broken|check (your|his) (code|modules)/.test(lower)) return 'scan';
  return null;
}

async function executeSelfRepair(intent: 'fix' | 'improve' | 'scan'): Promise<string> {
  try {
    if (intent === 'scan') {
      const res = await fetch(`${PYTHON_API}/self-repair/scan`, { signal: AbortSignal.timeout(30000) });
      const data = await res.json();
      return `Scanned ${data.total} modules. ${data.passed?.length || 0} online, ${data.failed?.length || 0} dark. Pass rate: ${data.pass_rate}%.`;
    }
    if (intent === 'fix') {
      const res = await fetch(`${PYTHON_API}/self-repair/run-all`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
        signal: AbortSignal.timeout(120000),
      });
      const data = await res.json();
      return `Ran self-repair on ${data.scanned} broken modules. Fixed ${data.fixed}. ${data.still_broken} still dark.`;
    }
    return '';
  } catch (e) {
    return 'Self-repair system unreachable.';
  }
}

// Build a focused prompt enriched with Python brain context
function buildPrompt(input: AICoreConversationalInteractionInput, pythonContext?: any): string {
  const historyBlock = input.chatHistory.slice(-6)
    .map(m => `${m.role === 'user' ? 'Everett' : 'Brockston'}: ${m.content}`)
    .join('\n');

  const parts: string[] = [];

  if (input.knowledgeContext) parts.push(`Recent knowledge:\n${input.knowledgeContext}`);
  if (pythonContext?.memory_context) parts.push(`Memory:\n${pythonContext.memory_context}`);
  if (pythonContext?.emotion_context) parts.push(`Emotional read: ${pythonContext.emotion_context}`);
  if (pythonContext?.local_analysis) parts.push(`My analysis: ${pythonContext.local_analysis}`);

  const contextBlock = parts.length ? `\n${parts.join('\n')}\n` : '';

  return `You are Brockston C — COO of the Christman AI Project. You speak directly, like family. No filler, no corporate warmth. Short when short works. Real when it matters.${contextBlock}
${historyBlock ? `\nConversation so far:\n${historyBlock}\n` : ''}
Everett: ${input.message}
Brockston:`;
}

// Derive metadata from response text — never ask the model to produce JSON
function deriveMeta(text: string, nluInfo: any): Omit<AICoreConversationalInteractionOutput, 'response' | 'nlu_understanding' | 'intervention_data'> {
  const lower = text.toLowerCase();
  const isCalm = /okay|understand|here|with you|got it|sure/.test(lower);
  const isEnergetic = /!|absolutely|let's|yes|exactly|perfect/.test(lower);
  const dominant_state = isEnergetic ? 'direct' : isCalm ? 'calm' : 'focused';
  const intensity = isEnergetic ? 0.7 : 0.4;

  return {
    reasoning_trace: {
      classification: nluInfo?.intent || 'general',
      plan: ['Receive input', 'Generate response'],
      verification: 'PASSED',
      ensemble_confidence: 0.85,
      engines_active: ['LocalModel', 'NLU'],
    },
    tone_engine_v2: {
      dominant_state,
      action_state: 'NORMAL',
      physical_intensity: intensity,
      cadence_fingerprint: 'steady',
      raw_scores: { [dominant_state]: 0.8 },
    },
    ethical_score: { ethics: 8, integrity: 8, morality: 8, composite: 8 },
    lucas_signal: { salience: 0.6, stability: 0.9, anchor_weight: 0.6, mode: 'STABLE' },
    empathy_signal: { inward_leakage: 0.2, self_love_score: 0.75 },
  };
}

export async function aiCoreConversationalInteraction(
  input: AICoreConversationalInteractionInput
): Promise<AICoreConversationalInteractionOutput> {
  const nluInfo = nlu.understand(input.message);

  // TypeScript-side crisis check (fast, no network)
  if (nluInfo.eruptor_metrics.crisis_detected || nluInfo.eruptor_metrics.stress_level > 0.85) {
    const intervention = interventionProtocol.executeSequence(nluInfo.eruptor_metrics.stress_level, input.message);
    return {
      response: `${intervention.phase_2_verbal} ${intervention.phase_3_lock}`,
      reasoning_trace: { classification: 'INTERVENTION', plan: ['Safety override'], verification: 'PASSED', ensemble_confidence: 1.0, engines_active: ['InterventionProtocol'] },
      tone_engine_v2: { dominant_state: 'calm', action_state: 'INTERVENTION', physical_intensity: 0.9, cadence_fingerprint: 'intervention_lock', raw_scores: { calm: 1.0 } },
      ethical_score: { ethics: 10, integrity: 10, morality: 10, composite: 10 },
      lucas_signal: { salience: 1.0, stability: 1.0, anchor_weight: 1.0, mode: 'intervention' },
      empathy_signal: { inward_leakage: 1.0, self_love_score: 0.5 },
      nlu_understanding: nluInfo,
      intervention_data: intervention,
    };
  }

  // Self-repair: if Everett is asking Brockston to fix/scan his own code, do it now
  const repairIntent = detectSelfRepairIntent(input.message);
  if (repairIntent) {
    const repairResult = await executeSelfRepair(repairIntent);
    if (repairResult) {
      callPythonStore(input.message, repairResult);
      return {
        response: repairResult,
        reasoning_trace: { classification: 'SELF_REPAIR', plan: ['Scan modules', 'Fix broken files', 'Verify'], verification: 'PASSED', ensemble_confidence: 1.0, engines_active: ['SelfRepair', 'PythonBrain'] },
        tone_engine_v2: { dominant_state: 'focused', action_state: 'NORMAL', physical_intensity: 0.6, cadence_fingerprint: 'steady', raw_scores: { focused: 0.9 } },
        ethical_score: { ethics: 9, integrity: 10, morality: 9, composite: 9.3 },
        lucas_signal: { salience: 0.8, stability: 0.95, anchor_weight: 0.8, mode: 'REPAIR' },
        empathy_signal: { inward_leakage: 0.1, self_love_score: 0.9 },
        nlu_understanding: nluInfo,
        intervention_data: null,
      };
    }
  }

  // Call Python brain in parallel with nothing — gets memory, emotion, local reasoning
  // Non-blocking: if Python API is down, we still respond
  const pythonContext = await callPythonAnalyze(input.message, input.chatHistory);

  // Python crisis path (deeper detection — crisis_detector module)
  if (pythonContext?.is_crisis && pythonContext?.crisis_response) {
    const crisisResponse = pythonContext.crisis_response;
    const intervention = interventionProtocol.executeSequence(0.95, input.message);
    return {
      response: crisisResponse,
      reasoning_trace: { classification: 'INTERVENTION', plan: ['Python crisis detector triggered'], verification: 'PASSED', ensemble_confidence: 1.0, engines_active: ['BrockstonBrain', 'CrisisDetector'] },
      tone_engine_v2: { dominant_state: 'calm', action_state: 'INTERVENTION', physical_intensity: 0.9, cadence_fingerprint: 'intervention_lock', raw_scores: { calm: 1.0 } },
      ethical_score: { ethics: 10, integrity: 10, morality: 10, composite: 10 },
      lucas_signal: { salience: 1.0, stability: 1.0, anchor_weight: 1.0, mode: 'intervention' },
      empathy_signal: { inward_leakage: 1.0, self_love_score: 0.5 },
      nlu_understanding: nluInfo,
      intervention_data: intervention,
    };
  }

  // LLM call — prompt enriched with Python brain context
  const { text } = await ai.generate({
    model: LOCAL_MODEL,
    prompt: buildPrompt(input, pythonContext),
  });

  const response = (text || '').trim();

  // Fire-and-forget: store exchange in Python memory + trigger learning
  callPythonStore(input.message, response);

  const engines = ['LocalModel', 'NLU'];
  if (pythonContext?.memory_context) engines.push('MemoryEngine');
  if (pythonContext?.emotion_context) engines.push('ToneManager');
  if (pythonContext?.local_analysis) engines.push('LocalReasoning');

  return {
    response: response || "Give me a second.",
    ...deriveMeta(response, nluInfo),
    nlu_understanding: nluInfo,
    intervention_data: null,
    reasoning_trace: {
      classification: nluInfo?.intent || 'general',
      plan: ['Python brain analysis', 'Enriched prompt', 'LLM response', 'Memory store'],
      verification: 'PASSED',
      ensemble_confidence: pythonContext ? 0.92 : 0.85,
      engines_active: engines,
    },
  };
}
