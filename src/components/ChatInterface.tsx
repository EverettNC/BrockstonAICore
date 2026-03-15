
"use client";

/**
 * @fileOverview ChatInterface - The Visual Bridge of BROCKSTON C.
 * Rule 1 Compliant: Immersive high-fidelity vocal interface.
 * Rule 13 Compliant: Functional audio bridge. Absolute honesty in scores. No placeholders.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Volume2, VolumeX, ShieldCheck, Zap, BrainCircuit, Mic, MicOff, GraduationCap, UserCheck, Lock, ShieldAlert, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { shieldPayload } from '@/lib/quantum-defense';
import { Switch } from '@/components/ui/switch';
import { hapticSystem, HapticPattern } from '@/lib/haptic-system';
import { useToast } from '@/hooks/use-toast';
import { speechService as localSpeech } from '@/lib/speech-recognition-service';
import { brockstonSpeech } from '@/lib/speech-service';
import { vortexEngine } from '@/lib/vortex-engine';
import { topologyEngine } from '@/lib/topology-engine';
import { visionContext } from '@/lib/vision-context';

export const ChatInterface: React.FC = () => {
  const db = useFirestore();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  
  const chatId = "ultimate-v5-session";
  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
  }, [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const docRef = useMemo(() => db ? doc(db, 'cognitive_core', 'main-bridge') : null, [db]);
  const { data: coreWeights } = useDoc<any>(docRef);

  // Knowledge Engine — pull recent learned insights so Brockston can speak from what he's studied
  const insightsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'learned_insights'), orderBy('timestamp', 'desc'), limit(8));
  }, [db]);
  const { data: learnedInsights } = useCollection<any>(insightsQuery);

  const masteryQuery = useMemo(() => db ? query(collection(db, 'knowledge_domains')) : null, [db]);
  const { data: masteryData } = useCollection<any>(masteryQuery);

  const knowledgeContext = useMemo(() => {
    if (!learnedInsights?.length && !masteryData?.length) return undefined;
    const lines: string[] = [];
    if (masteryData?.length) {
      lines.push('DOMAIN MASTERY:');
      masteryData.forEach((d: any) => {
        lines.push(`  ${d.domain}: ${((d.mastery_level || 0) * 100).toFixed(1)}% mastery`);
      });
    }
    if (learnedInsights?.length) {
      lines.push('RECENT INSIGHTS:');
      learnedInsights.slice(0, 6).forEach((ins: any) => {
        lines.push(`  [${ins.domain}] ${ins.topic}: "${ins.insight}"`);
      });
    }
    return lines.join('\n');
  }, [learnedInsights, masteryData]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Robust Auto-Scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight;
        }, 100);
      }
    }
  }, [messages, status]);

  const isInterventionMode = useMemo(() => {
    if (!messages?.length) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.role === 'model' && lastMsg.tone_engine_v2?.action_state === 'INTERVENTION';
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
            console.error(err);
            toast({ variant: "destructive", title: "Vocal Loop Error", description: "Microphone activation failed." });
          }
        }
      );
      setIsListening(true);
    }
  };

  const processMessage = async (userMsg: string) => {
    if (!userMsg.trim() || status === 'thinking') return;
    
    setStatus('thinking');
    const shield = shieldPayload('brockston');

    // 1. Record Intention in Vortex Engine
    const intentId = db ? await vortexEngine.recordIntention(db, `Conversational Intent: ${userMsg.substring(0, 20)}...`, 0.99) : null;

    // 2. Persist User Message
    if (db) {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'user',
        content: userMsg,
        specialist: 'brockston',
        quantum_shield: shield,
        vortex_data: { intent_id: intentId, confidence: 0.99, routing_mode: 'direct' },
        timestamp: serverTimestamp(),
        source: 'interface'
      });
    }

    try {
      const history = (messages || []).map(m => ({ role: m.role, content: m.content }));
      const visionSnapshot = visionContext.snapshot();

      // 3. Trigger Silicon Neural Cortex
      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist: 'brockston',
        chatHistory: history as any,
        visionSnapshot,
        knowledgeContext
      });

      // 4. Actualize Intention
      if (db && intentId) {
        await vortexEngine.markManifested(db, intentId, "Brockston response actualized");
      }

      // 5. Update Relational Topology
      const resonance = result.empathy_signal?.self_love_score || 0;
      const empathyMath = result.ethical_score.composite / 10;
      
      if (db) {
        await topologyEngine.updateProximity(db, resonance, empathyMath);
      }

      // 6. SoulForge LTP Update
      const currentWeights = coreWeights || {
        emotional_state: 0.5,
        tonal_stability: 0.5,
        speech_cadence: 0.5,
        respiratory_pattern: 0.5,
        lived_truth_witness: 0.5,
        trauma_association: 0.5,
        lucas_tone: 0.6,
        narrative_clarity: 0.5
      };

      if (db) {
        const forgeResult = await soulForgeProcess({
          currentWeights,
          emotional_salience: result.tone_engine_v2.physical_intensity,
          success_rate: result.ethical_score.composite / 10,
          isDistressed: result.tone_engine_v2.action_state === 'INTERVENTION',
          isSafe: resonance > 0.7
        });

        await setDoc(doc(db, 'cognitive_core', 'main-bridge'), {
          ...forgeResult.updatedWeights,
          last_ltp_event: serverTimestamp()
        }, { merge: true });

        if (forgeResult.isSignificantEvent) {
          toast({ title: "Deep LTP Event", description: "Emotional salience triggered weight potentiation." });
        }
      }

      // 7. Persist Brockston's Response
      if (db) {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          role: 'model',
          content: result.response,
          specialist: 'brockston',
          ethical_score: result.ethical_score,
          lucas_signal: result.lucas_signal,
          empathy_signal: result.empathy_signal,
          quantum_shield: shield,
          tone_engine_v2: result.tone_engine_v2,
          reasoning_trace: result.reasoning_trace,
          intervention_data: result.intervention_data || null,
          timestamp: serverTimestamp()
        });
      }

      // 8. Haptic & Vocal Execution
      const hapticPattern = mapToneToHaptic(result.tone_engine_v2.dominant_state);
      hapticSystem.trigger(hapticPattern);

      if (autoSpeak) {
        setStatus('speaking');
        try {
          const audioMedia = await brockstonSpeech.synthesizeSpeech(result.response, "brockston");
          if (audioRef.current) {
            audioRef.current.src = audioMedia;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => {
                console.warn("Vocal bridge paused by browser policy.", e);
                setStatus('idle');
              });
            }
          }
        } catch (ttsErr) {
          console.error("Vocal bridge failure:", ttsErr);
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error("Core Processing Error:", err);
      toast({ variant: "destructive", title: "Cortex Stall", description: "Brockston's neural bridge encountered a temporary bottleneck." });
      setStatus('idle');
    }
  };

  const mapToneToHaptic = (tone: string): HapticPattern => {
    if (['sweetheart', 'happy', 'proud'].includes(tone)) return 'warm';
    if (['tremble', 'annoyed', 'sarcastic', 'last_breath'].includes(tone)) return 'rough';
    if (['neutral', 'emphasis'].includes(tone)) return 'soft';
    return 'none';
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
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} onError={() => setStatus('idle')} />

      {/* Left — Brockston */}
      <div className={cn(
        "flex-none w-80 flex flex-col items-center justify-center gap-6 rounded-3xl bg-black border border-white/10 p-8 transition-all duration-700",
        isInterventionMode && "border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.2)]"
      )}>
        <CoreAvatar status={status} className="w-56 h-56 md:w-64 md:h-64" />

        <div className="text-center">
          <div className="text-4xl font-headline tracking-tighter uppercase text-white font-black">
            BROCKSTON <span className="text-accent">C</span>
          </div>
          <div className="text-[10px] font-code text-secondary/50 uppercase tracking-[0.3em] mt-1">
            Chief Operations Officer
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-code uppercase tracking-widest transition-all",
          isInterventionMode
            ? "border-red-500/50 text-red-400 bg-red-950/30"
            : status === 'speaking'
            ? "border-accent/60 text-accent bg-accent/10 shadow-[0_0_20px_rgba(0,255,127,0.15)]"
            : status === 'thinking'
            ? "border-accent/30 text-accent/60 animate-pulse"
            : "border-white/10 text-secondary/40"
        )}>
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            isInterventionMode ? "bg-red-500 animate-pulse" :
            status === 'idle' ? "bg-accent/40" : "bg-accent animate-pulse"
          )} />
          {isInterventionMode ? "INTERVENTION" : status === 'speaking' ? "SPEAKING" : status === 'thinking' ? "THINKING..." : "READY"}
        </div>

        {/* Voice toggle */}
        <div className="flex items-center gap-3 mt-2">
          <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent" />
          {autoSpeak ? <Volume2 className="h-4 w-4 text-accent" /> : <VolumeX className="h-4 w-4 text-secondary/30" />}
          <span className="text-[9px] font-code text-secondary/40 uppercase">Voice</span>
        </div>
      </div>

      {/* Right — Conversation */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-0">

        {/* Messages */}
        <div className="flex-1 min-h-0 rounded-2xl bg-black/50 border border-white/5 overflow-hidden">
          <ScrollArea className="h-full p-6" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {(!messages || messages.length === 0) && status === 'idle' && (
                <div className="h-full flex items-center justify-center py-20 text-center">
                  <div className="text-secondary/30 font-code text-sm uppercase tracking-widest">
                    Say something to Brockston.
                  </div>
                </div>
              )}
              {messages?.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[80%] animate-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <span className="text-[9px] font-code uppercase text-secondary/40 tracking-widest mb-1 px-1">
                    {msg.role === 'user' ? 'You' : 'Brockston'}
                  </span>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-accent/15 border border-accent/30 text-foreground rounded-tr-sm"
                      : "bg-white/5 border border-white/10 text-foreground rounded-tl-sm",
                    msg.tone_engine_v2?.action_state === 'INTERVENTION' && "border-red-500/50 bg-red-950/40 text-red-100"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {status === 'thinking' && (
                <div className="mr-auto flex flex-col items-start max-w-[80%]">
                  <span className="text-[9px] font-code uppercase text-accent/40 tracking-widest mb-1 px-1">Brockston</span>
                  <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm">
                    <div className="flex gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-accent animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex-none flex gap-3">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            "h-12 w-12 rounded-xl border border-white/10 bg-white/5 flex-none",
            isListening && "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
          )}>
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-accent/70" />}
          </Button>
          <Input
            placeholder={isListening ? "Listening..." : "Talk to Brockston..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={status !== 'idle' || isInterventionMode}
            className="flex-1 h-12 bg-white/5 border border-white/10 focus-visible:ring-accent rounded-xl px-4 text-sm placeholder:text-secondary/30"
          />
          <Button type="submit" disabled={status !== 'idle' || !input.trim() || isInterventionMode} className={cn(
            "h-12 w-12 rounded-xl flex-none",
            isInterventionMode ? "bg-red-600 hover:bg-red-700" : "bg-accent hover:bg-accent/80 text-black"
          )}>
            {status === 'thinking' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
      </div>
    </div>
  );
};
