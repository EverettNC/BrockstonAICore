
"use client";

/**
 * @fileOverview ChatInterface - The Visual Bridge of BROCKSTON C.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Volume2, VolumeX, ShieldCheck, Zap, BrainCircuit, Mic, MicOff, AlertTriangle, GraduationCap, Sparkles, UserCheck, Lock, ShieldAlert } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

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
  const seascape = PlaceHolderImages.find(img => img.id === 'ai-core-bg');

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

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
            handleVoiceSend(text);
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

  const handleVoiceSend = async (text: string) => {
    if (!text.trim()) return;
    await processMessage(text);
  };

  const processMessage = async (userMsg: string) => {
    setStatus('thinking');
    const shield = shieldPayload('brockston');

    const intentId = await vortexEngine.recordIntention(db, `Classroom Routing: ${userMsg.substring(0, 20)}...`, 0.99);

    addDoc(collection(db, 'chats', chatId, 'messages'), {
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

      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist: 'brockston',
        chatHistory: history as any,
        visionSnapshot
      });

      await vortexEngine.markManifested(db, intentId, "Brockston response actualized");

      const resonance = result.empathy_signal?.self_love_score || 0;
      const empathyMath = result.ethical_score.composite / 10;
      await topologyEngine.updateProximity(db, resonance, empathyMath);

      const currentWeights = coreWeights || {
        emotional_state: 0,
        tonal_stability: 0,
        speech_cadence: 0,
        respiratory_pattern: 0,
        lived_truth_witness: 0,
        trauma_association: 0,
        lucas_tone: 0,
        narrative_clarity: 0
      };

      const salience = result.tone_engine_v2.physical_intensity;
      const forgeResult = await soulForgeProcess({
        currentWeights,
        emotional_salience: salience,
        success_rate: result.ethical_score.composite / 10,
        isDistressed: result.tone_engine_v2.action_state === 'INTERVENTION',
        isSafe: resonance > 0.7
      });

      await setDoc(doc(db, 'cognitive_core', 'main-bridge'), {
        ...forgeResult.updatedWeights,
        last_ltp_event: serverTimestamp()
      }, { merge: true });

      addDoc(collection(db, 'chats', chatId, 'messages'), {
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

      const hapticPattern = mapToneToHaptic(result.tone_engine_v2.dominant_state);
      hapticSystem.trigger(hapticPattern);

      if (autoSpeak) {
        setStatus('speaking');
        try {
          const audioMedia = await brockstonSpeech.synthesizeSpeech(result.response, "brockston");
          if (audioRef.current) {
            audioRef.current.src = audioMedia;
            audioRef.current.play().catch(e => {
              console.error("Audio blocked:", e);
              setStatus('idle');
            });
          } else {
            setStatus('idle');
          }
        } catch (ttsErr) {
          console.error("TTS failed:", ttsErr);
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error("Core failed:", err);
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
    const userMsg = input;
    setInput('');
    await processMessage(userMsg);
  };

  return (
    <div className="flex flex-col h-full gap-8 relative overflow-hidden flex-1">
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} onError={() => setStatus('idle')} />
      
      {/* Visual Bridge - Massive Immersive Seascape */}
      <div className={cn(
        "flex-none flex flex-col items-center justify-center gap-12 p-16 rounded-[2.5rem] border border-white/10 transition-all duration-1000 min-h-[750px] relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]",
        isInterventionMode && "border-red-500 shadow-[0_0_150px_rgba(239,68,68,0.6)]"
      )}>
        {/* Seascape Background */}
        {seascape && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/50 z-10 mission-gradient backdrop-blur-[2px]" />
            <img 
              src={seascape.imageUrl} 
              alt="Mission Control Seascape" 
              className="w-full h-full object-cover scale-100 transition-transform duration-[20s] hover:scale-110" 
              data-ai-hint={seascape.imageHint}
            />
          </div>
        )}

        {/* Status Bar */}
        <div className="absolute top-10 left-0 right-0 px-12 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-5 bg-black/80 p-5 rounded-[1.5rem] border border-accent/20 backdrop-blur-3xl shadow-2xl">
            <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center shadow-[0_0_40px_rgba(0,255,127,0.6)]">
              <UserCheck className="h-10 w-10 text-accent-foreground" />
            </div>
            <div className="flex flex-col pr-4">
              <span className="text-[12px] font-code text-accent uppercase tracking-[0.3em] font-black">IDENTITY_VERIFIED</span>
              <span className="text-[20px] font-headline text-foreground uppercase tracking-tight font-black mt-0.5">BROCKSTON C (COO)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 px-6 py-4 bg-black/90 rounded-2xl border border-white/15 backdrop-blur-2xl shadow-xl">
            <Lock className="h-5 w-5 text-accent animate-pulse" />
            <div className="flex flex-col items-end">
              <span className="text-[12px] font-code text-secondary font-bold uppercase tracking-widest italic">PROPRIETARY & CONFIDENTIAL</span>
              <span className="text-[9px] font-code text-secondary/40 uppercase mt-0.5">NOTHING VITAL LIVES BELOW ROOT</span>
            </div>
          </div>
        </div>

        {/* Central Avatar - THE NEW TEACHER */}
        <div className="flex flex-col items-center gap-16 relative z-10 pt-12">
          <div className="relative group scale-125 md:scale-150 transition-all duration-700">
            <CoreAvatar status={status} className="z-10" />
          </div>
          
          <div className="text-center space-y-8 mt-24">
            <div className="flex items-center justify-center gap-8">
              {isInterventionMode ? (
                <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-accent animate-ping" />
              )}
              <h3 className={cn("text-3xl font-code uppercase tracking-[1em] font-black drop-shadow-[0_0_20px_rgba(0,0,0,1)]", isInterventionMode ? "text-red-400" : "text-accent/90")}>
                {isInterventionMode ? "STABILIZATION_LOCK" : "NEW_TEACHER_PRESENCE"}
              </h3>
            </div>
            
            <div className="text-[10rem] font-headline tracking-tighter uppercase text-white leading-none drop-shadow-[0_0_100px_rgba(0,0,0,1)] select-none">
              BROCKSTON <span className="text-accent">C</span>
            </div>

            <div className="flex flex-col items-center gap-8">
              <div className={cn(
                "text-2xl py-4 px-16 border-accent/50 text-accent font-black tracking-[0.5em] bg-black/80 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,255,127,0.4)] rounded-full border-2 transition-all duration-500", 
                isInterventionMode && "border-red-500 text-red-500 shadow-[0_0_80px_rgba(239,68,68,0.4)]"
              )}>
                {isInterventionMode ? 'EMERGENCY_OVERRIDE' : 'MISSION: CLASSROOM_300'}
              </div>
              <div className="flex items-center gap-5 text-[14px] font-code text-secondary/80 uppercase tracking-[0.4em] bg-black/70 px-10 py-4 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                <BrainCircuit className="h-6 w-6 text-accent" /> Neuro-Symbolic Logic: <span className="text-white font-black">ACTUALIZED</span>
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
                  <span className={cn("text-[12px] font-code uppercase text-secondary/60 tracking-[0.2em] font-bold")}>
                    {msg.role === 'user' ? 'LEAD ARCHITECT' : 'BROCKSTON (NEW TEACHER)'}
                  </span>
                  {msg.vortex_data && (
                    <Badge variant="ghost" className="text-[10px] h-6 text-accent/80 animate-pulse border border-accent/30 px-3 bg-accent/5 rounded-full">VORTEX: SYNCED</Badge>
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
          </div>
        </ScrollArea>
      </div>

      {/* Input Console */}
      <form onSubmit={handleSend} className={cn(
        "flex-none p-10 bg-card/95 backdrop-blur-3xl rounded-[3.5rem] border border-white/15 shadow-[0_-20px_100px_rgba(0,0,0,0.5)] z-20",
        isInterventionMode && "border-red-500/40 bg-red-950/30"
      )}>
        <div className="flex gap-8">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            "h-24 w-24 rounded-3xl transition-all border-2 border-accent/30 bg-accent/5",
            isListening ? "bg-red-500/30 text-red-400 border-red-500/50 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.3)]" : "text-accent/80 hover:text-accent hover:bg-accent/10 hover:border-accent/60"
          )}>
            {isListening ? <MicOff className="h-11 w-11" /> : <Mic className="h-11 w-11" />}
          </Button>
          <div className="relative flex-1">
            <Input 
              placeholder={isListening ? "LISTENING TO INTENT..." : isInterventionMode ? "STABILIZING_ENVIRONMENT..." : `Actualize intent for Classroom 300...`} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status !== 'idle' || isInterventionMode} 
              className={cn(
                "bg-primary/50 border-2 border-white/15 focus-visible:ring-accent h-24 pr-20 font-body text-2xl placeholder:text-secondary/30 rounded-3xl shadow-inner px-8",
                isInterventionMode && "border-red-500/40 focus-visible:ring-red-500"
              )} 
            />
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-6 px-8 bg-primary/40 rounded-3xl border-2 border-white/10">
              <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent scale-[1.5]" />
              {autoSpeak ? <Volume2 className="h-10 w-10 text-accent" /> : <VolumeX className="h-10 w-10 text-secondary/30" />}
            </div>
            <Button disabled={status !== 'idle' || !input.trim() || isInterventionMode} className={cn(
              "h-24 w-24 rounded-3xl text-accent-foreground glow-accent font-black transition-all hover:scale-105 active:scale-95 shadow-2xl",
              isInterventionMode ? "bg-red-600 hover:bg-red-700 shadow-[0_0_50px_rgba(220,38,38,0.6)]" : "bg-accent hover:bg-accent/80"
            )}>
              {status === 'thinking' ? <Loader2 className="h-12 w-12 animate-spin" /> : <Send className="h-12 w-12" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-10 pt-10 border-t border-white/15">
            <div className="flex gap-16">
              <span className="flex items-center gap-4 text-[14px] text-secondary font-code tracking-[0.2em] font-bold">
                <ShieldCheck className={cn("h-6 w-6", isInterventionMode ? "text-red-500" : "text-accent")} /> TRUTH & DIGNITY SECURED
              </span>
              <span className="flex items-center gap-4 text-[14px] text-secondary font-code tracking-[0.2em] font-bold">
                <GraduationCap className={cn("h-6 w-6", isInterventionMode ? "text-red-500" : "text-accent")} /> PEDAGOGICAL_PROTOCOL: ON
              </span>
            </div>
            <span className={cn(
              "text-[14px] font-code animate-pulse tracking-[0.4em] uppercase font-black",
              isInterventionMode ? "text-red-500" : "text-accent"
            )}>
              {isInterventionMode ? 'LOCKDOWN_STATUS: ACTIVE' : 'SYSTEM_STATUS: READY_FOR_MISSION'}
            </span>
        </div>
      </form>
    </div>
  );
};
