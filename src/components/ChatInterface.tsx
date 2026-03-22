"use client";

/**
 * @fileOverview ChatInterface - The Visual Bridge of BROCKSTON C.
 * Rule 1 Compliant: Immersive high-fidelity vocal interface.
 * Rule 13 Compliant: Functional audio bridge. Absolute honesty in scores. No placeholders.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Send, Loader2, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar, type AvatarEmotion, type AvatarStatus } from './CoreAvatar';
import { avatarEngine, mapToneToEmotion } from '@/lib/avatar-engine';
import { hapticSystem, HapticPattern } from '@/lib/haptic-system';
import { useToast } from '@/hooks/use-toast';
import { speechService as localSpeech } from '@/lib/speech-recognition-service';

const ELEVEN_LABS_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY || '';
const VOICE_ID = process.env.NEXT_PUBLIC_ELEVEN_LABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

interface Message {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
  ethical_score?: any;
  lucas_signal?: any;
  empathy_signal?: any;
  tone_engine_v2?: any;
  reasoning_trace?: any;
  intervention_data?: any;
}

interface CoreWeights {
  emotional_state: number;
  tonal_stability: number;
  speech_cadence: number;
  respiratory_pattern: number;
  lived_truth_witness: number;
  trauma_association: number;
  lucas_tone: number;
  narrative_clarity: number;
}

const STORAGE_KEYS = {
  MESSAGES: 'brockston:chat:messages',
  CORE_WEIGHTS: 'brockston:cognitive:weights',
};

const defaultCoreWeights: CoreWeights = {
  emotional_state: 0.5,
  tonal_stability: 0.5,
  speech_cadence: 0.5,
  respiratory_pattern: 0.5,
  lived_truth_witness: 0.5,
  trauma_association: 0.5,
  lucas_tone: 0.6,
  narrative_clarity: 0.5
};

// FIX 1: Tone arrays for haptic mapping
const WARM_TONES = ['joy', 'love', 'calm', 'hope', 'gratitude', 'comfort'];
const ROUGH_TONES = ['anger', 'fear', 'distress', 'crisis', 'pain', 'rage'];

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<AvatarStatus>('idle');
  const [avatarEmotion, setAvatarEmotion] = useState<AvatarEmotion>('neutral');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // FIX 2: Proper destructured useState declarations
  const [messages, setMessages] = useState<Message[]>([]);
  const [coreWeights, setCoreWeights] = useState<CoreWeights>(defaultCoreWeights);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (stored) setMessages(JSON.parse(stored));
      const weights = localStorage.getItem(STORAGE_KEYS.CORE_WEIGHTS);
      if (weights) setCoreWeights(JSON.parse(weights));
    } catch (e) {
      console.error('Storage load failed:', e);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CORE_WEIGHTS, JSON.stringify(coreWeights));
  }, [coreWeights]);

  useLayoutEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const toggleListening = () => {
    if (isListening) {
      localSpeech.stopListening();
      setIsListening(false);
    } else {
      localSpeech.startListening(
        (text, isFinal) => {
          if (isFinal) {
            setInput(text);
            processMessage(text);
          } else {
            setInput(text);
          }
        },
        (err) => {
          setIsListening(false);
          if (err !== 'no-speech') {
            toast({ variant: "destructive", title: "Mic fail", description: "Can't hear you." });
          }
        }
      );
      setIsListening(true);
    }
  };

  const processMessage = async (userMsg: string) => {
    if (!userMsg.trim() || status === 'thinking') return;

    setStatus('thinking');

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMsg,
      timestamp: Date.now(),
    };

    // FIX 3: Proper setMessages with spread
    setMessages(prev => [...prev, userMessage]);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));

      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist: 'brockston',
        chatHistory: history as any,
      });

      const emotion = mapToneToEmotion(result.tone_engine_v2?.dominant_state || 'neutral');
      setAvatarEmotion(emotion);
      avatarEngine.setEmotion(emotion);

      const forgeResult = await soulForgeProcess({
        currentWeights: coreWeights,
        emotional_salience: result.tone_engine_v2.physical_intensity,
        success_rate: result.ethical_score.composite / 10,
        isDistressed: result.tone_engine_v2.action_state === 'INTERVENTION',
        isSafe: (result.empathy_signal?.self_love_score || 0) > 0.7
      });

      setCoreWeights(forgeResult.updatedWeights);

      if (forgeResult.isSignificantEvent) {
        toast({ title: "Deep Event", description: "Weights just shifted." });
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.response,
        timestamp: Date.now(),
        ethical_score: result.ethical_score,
        lucas_signal: result.lucas_signal,
        empathy_signal: result.empathy_signal,
        tone_engine_v2: result.tone_engine_v2,
        reasoning_trace: result.reasoning_trace,
        intervention_data: result.intervention_data || null,
      };

      // FIX 4: Proper setMessages with spread
      setMessages(prev => [...prev, modelMessage]);

      const haptic = mapToneToHaptic(result.tone_engine_v2.dominant_state);
      hapticSystem.trigger(haptic);

      if (autoSpeak) {
        setStatus('speaking');
        try {
          const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
            method: 'POST',
            headers: {
              'Accept': 'audio/mpeg',
              'xi-api-key': ELEVEN_LABS_KEY,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: result.response,
              model_id: "eleven_monolingual_v1",
              voice_settings: { stability: 0.5, similarity_boost: 0.75 },
            }),
          });

          if (!response.ok) throw new Error('ElevenLabs failed');
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);

          const audio = new Audio(audioUrl);
          audio.onended = () => setStatus('idle');
          audio.play().catch(() => setStatus('idle'));
        } catch (err) {
          console.error('TTS error:', err);
          toast({ variant: "destructive", title: "Voice fail", description: "Can't talk right now." });
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Cortex Crash", description: "Bridge down—try again." });
      setStatus('idle');
    }
  };

  // FIX 5: Proper tone arrays for haptic mapping
  const mapToneToHaptic = (tone: string): HapticPattern => {
    if (WARM_TONES.includes(tone)) return 'warm';
    if (ROUGH_TONES.includes(tone)) return 'rough';
    return 'soft';
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'idle') return;
    const msg = input;
    setInput('');
    await processMessage(msg);
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      <div className="flex-none w-80 flex flex-col items-center justify-center gap-6 rounded-3xl bg-black border border-white/10 p-8">
        <CoreAvatar status={status} emotion={avatarEmotion} />
        <div className="flex items-center gap-3">
          <Switch id="voice" checked={autoSpeak} onCheckedChange={setAutoSpeak} />
          {autoSpeak ? <Volume2 className="h-4 w-4 text-accent" /> : <VolumeX className="h-4 w-4 text-secondary/30" />}
          <span className="text-xs uppercase">Voice</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="flex-1 rounded-2xl bg-black/50 border border-white/5 overflow-hidden">
          <ScrollArea className="h-full p-6" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center text-secondary/30 text-sm uppercase">
                  Talk to me.
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={msg.id || i} className={cn(
                  "flex flex-col max-w-[80%]",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <span className="text-xs uppercase text-secondary/40 mb-1">
                    {msg.role === 'user' ? 'You' : 'Brockston'}
                  </span>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm",
                    msg.role === 'user' ? "bg-accent/15 border border-accent/30" : "bg-white/5 border border-white/10"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {status === 'thinking' && (
                <div className="mr-auto">
                  <div className="px-5 py-4 rounded-2xl bg-white/5">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.9s]" />
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.6s]" />
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <form onSubmit={handleSend} className="flex gap-3">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            isListening && "bg-red-500/20 border-red-500/50 animate-pulse"
          )}>
            {isListening ? <MicOff /> : <Mic />}
          </Button>
          <Input
            placeholder={isListening ? "Listening..." : "Talk to Brockston..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={status !== 'idle'}
            className="flex-1 h-12 bg-white/5 border-white/10"
          />
          <Button type="submit" disabled={status !== 'idle' || !input.trim()}>
            {status === 'thinking' ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </form>
      </div>
    </div>
  );
};
