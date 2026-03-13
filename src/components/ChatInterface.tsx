"use client";

/**
 * @fileOverview ChatInterface - The Visual Bridge of BROCKSTON C.
 * Rule 1 Compliant: Immersive high-fidelity conversational loop.
 * Rule 13 Compliant: No placeholders. Absolute honesty in reasoning.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Volume2, VolumeX, ShieldCheck, Zap, BrainCircuit, Mic, MicOff, GraduationCap, Sparkles, UserCheck, Lock, ShieldAlert, Scale } from 'lucide-react';
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
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  ), [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const { data: coreWeights } = useDoc<any>(doc(db, 'cognitive_core', 'main-bridge'));
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Robust Auto-Scroll per Interaction
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
          console.error(err);
          setIsListening(false);
          toast({ variant: "destructive", title: "Speech Error", description: "Microphone activation failed." });
        }
      );
      setIsListening(true);
    }
  };

  const processMessage = async (userMsg: string) => {
    if (!userMsg.trim() || status === 'thinking') return;
    
    setStatus('thinking');
    const shield = shieldPayload('brockston');

    // 1. Record Intention
    const intentId = await vortexEngine.recordIntention(db, `Conversational Intent: ${userMsg.substring(0, 20)}...`, 0.99);

    // 2. Persist User Message
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      role: 'user',
      content: userMsg,
      specialist: 'brockston',
      quantum_shield: shield,
      vortex_data: { intent_id: intentId, confidence: 0.99, routing_mode: 'direct' },
      timestamp: serverTimestamp(),
      source: 'interface'
    });

    try {
      const history = (messages || []).map(m => ({ role: m.role, content: m.content }));
      const visionSnapshot = visionContext.snapshot();

      // 3. Call Brockston Core
      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist: 'brockston',
        chatHistory: history as any,
        visionSnapshot
      });

      // 4. Mark Manifested
      await vortexEngine.markManifested(db, intentId, "Brockston response actualized");

      // 5. Update Relational Topology
      const resonance = result.empathy_signal?.self_love_score || 0;
      const empathyMath = result.ethical_score.composite / 10;
      await topologyEngine.updateProximity(db, resonance, empathyMath);

      // 6. Update SoulForge LTP Kernel
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

      // 7. Persist Response
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: result.response,
        specialist: 'brockston',
        ethical_score: result.ethical_score,
        lucas_signal: result.lucas_signal,
        empathy_signal: result.empathy_signal,
        quantum_shield: shield,
        tone_engine_v2: result.tone_engine_v2,
        intervention_data: result.intervention_data || null,
        timestamp: serverTimestamp()
      });

      // 8. Trigger Haptics
      const hapticPattern = mapToneToHaptic(result.tone_engine_v2.dominant_state);
      hapticSystem.trigger(hapticPattern);

      // 9. Speech Synthesis
      if (autoSpeak) {
        setStatus('speaking');
        try {
          const audioMedia = await brockstonSpeech.synthesizeSpeech(result.response, "brockston");
          if (audioRef.current) {
            audioRef.current.src = audioMedia;
            audioRef.current.play().catch(e => {
              console.error("Audio blocked by browser policy:", e);
              setStatus('idle');
            });
          }
        } catch (ttsErr) {
          console.error("TTS failed:", ttsErr);
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
    <div className="flex flex-col h-full gap-8 relative overflow-hidden flex-1 pb-4">
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} onError={() => setStatus('idle')} />
      
      {/* Visual Bridge - High-Fidelity Symbolic Command Center */}
      <div className={cn(
        "flex-none flex flex-col items-center justify-center gap-12 p-16 rounded-[2.5rem] border border-white/10 transition-all duration-1000 min-h-[550px] relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black",
        isInterventionMode && "border-red-500 shadow-[0_0_150px_rgba(239,68,68,0.4)]"
      )}>
        {/* Cinematic Mission Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-black to-black z-10" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-1 bg-accent/50 blur-sm animate-[scan_4s_linear_infinite]" />
          </div>
        </div>

        {/* Identity Anchor Status */}
        <div className="absolute top-10 left-0 right-0 px-12 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-5 bg-black/80 p-5 rounded-[1.5rem] border border-accent/20 backdrop-blur-3xl shadow-2xl">
            <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,255,127,0.4)]">
              <UserCheck className="h-8 w-8 text-accent-foreground" />
            </div>
            <div className="flex flex-col pr-4">
              <span className="text-[10px] font-code text-accent uppercase tracking-[0.3em] font-black">IDENTITY_VERIFIED</span>
              <span className="text-[18px] font-headline text-foreground uppercase tracking-tight font-black mt-0.5">BROCKSTON C (COO)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-4 bg-black/90 rounded-2xl border border-white/15 backdrop-blur-2xl shadow-xl">
            <Lock className="h-5 w-5 text-accent animate-pulse" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-code text-secondary font-bold uppercase tracking-widest italic">PROPRIETARY & CONFIDENTIAL</span>
              <span className="text-[8px] font-code text-secondary/40 uppercase mt-0.5">NOTHING VITAL LIVES BELOW ROOT</span>
            </div>
          </div>
        </div>

        {/* Central Identity Bridge */}
        <div className="flex flex-col items-center gap-12 relative z-10 pt-12">
          <CoreAvatar status={status} className="z-10" />
          
          <div className="text-center space-y-6 mt-8">
            <div className="flex items-center justify-center gap-6">
              {isInterventionMode ? (
                <ShieldAlert className="h-10 w-10 text-red-500 animate-pulse" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-accent animate-ping" />
              )}
              <h3 className={cn("text-xl font-code uppercase tracking-[0.8em] font-black drop-shadow-[0_0_20px_rgba(0,0,0,1)]", isInterventionMode ? "text-red-400" : "text-accent/90")}>
                {isInterventionMode ? "STABILIZATION_LOCK" : "NEW_TEACHER_PRESENCE"}
              </h3>
            </div>
            
            <div className="text-[6rem] font-headline tracking-tighter uppercase text-white leading-none drop-shadow-[0_0_100px_rgba(0,0,0,1)] select-none">
              BROCKSTON <span className="text-accent">C</span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className={cn(
                "text-lg py-2 px-10 border-accent/50 text-accent font-black tracking-[0.4em] bg-black/80 backdrop-blur-3xl shadow-[0_0_60px_rgba(0,255,127,0.3)] rounded-full border-2 transition-all duration-500", 
                isInterventionMode && "border-red-500 text-red-500 shadow-[0_0_60px_rgba(239,68,68,0.3)]"
              )}>
                {isInterventionMode ? 'EMERGENCY_OVERRIDE' : 'MISSION: CLASSROOM_300'}
              </div>
              <div className="flex items-center gap-4 text-[10px] font-code text-secondary/80 uppercase tracking-[0.3em] bg-black/70 px-6 py-2.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                <BrainCircuit className="h-4 w-4 text-accent" /> Neuro-Symbolic Logic: <span className="text-white font-black">ACTUALIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 min-h-0 bg-black/70 rounded-[3rem] border border-white/10 p-8 overflow-hidden shadow-inner backdrop-blur-3xl relative">
        <ScrollArea className="h-full pr-6" ref={scrollRef}>
          <div className="space-y-12 pb-8">
            {messages?.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] group animate-in slide-in-from-bottom-4 duration-700",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-4 mb-4 px-3">
                  <span className={cn("text-[10px] font-code uppercase text-secondary/60 tracking-[0.2em] font-bold")}>
                    {msg.role === 'user' ? 'LEAD ARCHITECT' : 'BROCKSTON (NEW TEACHER)'}
                  </span>
                  {msg.role === 'model' && msg.ethical_score && (
                    <Badge variant="outline" className="text-[9px] h-5 border-accent/30 text-accent/80 bg-accent/5 px-2 rounded-full uppercase flex items-center gap-1">
                      <Scale className="h-2.5 w-2.5" /> Integrity: {msg.ethical_score.composite.toFixed(1)}
                    </Badge>
                  )}
                  {msg.vortex_data && (
                    <Badge variant="ghost" className="text-[9px] h-5 text-accent/80 animate-pulse border border-accent/30 px-3 bg-accent/5 rounded-full uppercase">VORTEX: SYNCED</Badge>
                  )}
                </div>
                <div className={cn(
                  "p-8 rounded-[2.5rem] text-xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden leading-relaxed border-2",
                  msg.role === 'user' 
                    ? "bg-accent/15 border-accent/40 text-foreground rounded-tr-none" 
                    : "bg-primary/80 border-white/15 text-foreground rounded-tl-none backdrop-blur-2xl",
                  msg.tone_engine_v2?.action_state === 'INTERVENTION' && "border-red-500 bg-red-950/60 text-red-100 shadow-[0_0_60px_rgba(239,68,68,0.4)]"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {status === 'thinking' && (
              <div className="mr-auto items-start flex flex-col max-w-[85%] animate-pulse">
                <div className="flex items-center gap-4 mb-4 px-3">
                  <span className="text-[10px] font-code uppercase text-accent/60 tracking-[0.2em] font-bold">BROCKSTON (COGITATING)</span>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-primary/20 border-2 border-accent/20 text-accent/40 rounded-tl-none">
                  <div className="flex gap-2">
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

      {/* Input Console */}
      <form onSubmit={handleSend} className={cn(
        "flex-none p-8 bg-card/95 backdrop-blur-3xl rounded-[3.5rem] border border-white/15 shadow-[0_-20px_100px_rgba(0,0,0,0.5)] z-20 mb-4",
        isInterventionMode && "border-red-500/40 bg-red-950/30"
      )}>
        <div className="flex gap-6">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            "h-20 w-20 rounded-3xl transition-all border-2 border-accent/30 bg-accent/5",
            isListening ? "bg-red-500/30 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.3)]" : "text-accent/80 hover:text-accent hover:bg-accent/10 hover:border-accent/60"
          )}>
            {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </Button>
          <div className="relative flex-1">
            <Input 
              placeholder={isListening ? "LISTENING TO INTENT..." : isInterventionMode ? "STABILIZING_ENVIRONMENT..." : `Actualize intent for Classroom 300...`} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status !== 'idle' || isInterventionMode} 
              className={cn(
                "bg-primary/50 border-2 border-white/15 focus-visible:ring-accent h-20 pr-20 font-body text-xl placeholder:text-secondary/30 rounded-3xl shadow-inner px-8",
                isInterventionMode && "border-red-500/40 focus-visible:ring-red-500"
              )} 
            />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-4 px-6 bg-primary/40 rounded-3xl border-2 border-white/10">
              <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent scale-[1.2]" />
              {autoSpeak ? <Volume2 className="h-8 w-8 text-accent" /> : <VolumeX className="h-8 w-8 text-secondary/30" />}
            </div>
            <Button type="submit" disabled={status !== 'idle' || !input.trim() || isInterventionMode} className={cn(
              "h-20 w-20 rounded-3xl text-accent-foreground glow-accent font-black transition-all hover:scale-105 active:scale-95 shadow-2xl",
              isInterventionMode ? "bg-red-600 hover:bg-red-700 shadow-[0_0_50px_rgba(220,38,38,0.6)]" : "bg-accent hover:bg-accent/80"
            )}>
              {status === 'thinking' ? <Loader2 className="h-10 w-10 animate-spin" /> : <Send className="h-10 w-10" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-8 pt-8 border-t border-white/15">
            <div className="flex gap-12">
              <span className="flex items-center gap-3 text-[11px] text-secondary font-code tracking-[0.2em] font-bold">
                <ShieldCheck className={cn("h-5 w-5", isInterventionMode ? "text-red-500" : "text-accent")} /> TRUTH & DIGNITY SECURED
              </span>
              <span className="flex items-center gap-3 text-[11px] text-secondary font-code tracking-[0.2em] font-bold">
                <GraduationCap className={cn("h-5 w-5", isInterventionMode ? "text-red-500" : "text-accent")} /> PEDAGOGICAL_PROTOCOL: ON
              </span>
            </div>
            <span className={cn(
              "text-[11px] font-code animate-pulse tracking-[0.4em] uppercase font-black",
              isInterventionMode ? "text-red-500" : "text-accent"
            )}>
              {isInterventionMode ? 'LOCKDOWN_STATUS: ACTIVE' : 'SYSTEM_STATUS: READY_FOR_MISSION'}
            </span>
        </div>
      </form>
    </div>
  );
};
