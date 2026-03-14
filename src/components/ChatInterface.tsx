
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { speakStephen } from '@/ai/flows/tts-flow';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Heart, Shield, Volume2, VolumeX, ShieldCheck, Zap, BrainCircuit, Mic, MicOff, AlertTriangle, GraduationCap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { shieldPayload } from '@/lib/quantum-defense';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { hapticSystem, HapticPattern } from '@/lib/haptic-system';
import { toast } from '@/hooks/use-toast';
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
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          toast({ variant: "destructive", title: "Speech Error", description: "Could not activate microphone." });
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

    const intentId = db ? await vortexEngine.recordIntention(db, `Routing to BROCKSTON`, 0.99) : null;

    if (db) {
      addDoc(collection(db, 'chats', chatId, 'messages'), {
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

      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist: 'brockston',
        chatHistory: history as any,
        visionSnapshot
      });

      if (db && intentId) {
        await vortexEngine.markManifested(db, intentId, "Brockston response generated");
      }

      const resonance = result.empathy_signal?.self_love_score || 0.5;
      const empathyMath = result.ethical_score.composite / 10;
      
      if (db) {
        await topologyEngine.updateProximity(db, resonance, empathyMath);
      }

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

      const salience = result.tone_engine_v2.physical_intensity;
      if (db) {
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

        if (forgeResult.isSignificantEvent) {
          toast({ title: "Deep LTP Event", description: "Emotional salience triggered weight potentiation." });
        }
      }

      if (db) {
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
      }

      const hapticPattern = mapToneToHaptic(result.tone_engine_v2.dominant_state);
      hapticSystem.trigger(hapticPattern);

      if (autoSpeak) {
        setStatus('speaking');
        try {
          const audioMedia = await brockstonSpeech.synthesizeSpeech(result.response, "brockston");
          
          if (audioRef.current) {
            audioRef.current.src = audioMedia;
            audioRef.current.play().catch(e => {
              console.error("Audio playback blocked:", e);
              setStatus('idle');
            });
          } else {
            setStatus('idle');
          }
        } catch (ttsErr) {
          console.error("TTS generation failed:", ttsErr);
          setStatus('idle');
        }
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error("Core interaction failed:", err);
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
    <div className="flex flex-col h-full gap-4 relative">
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} onError={() => setStatus('idle')} />
      
      <div className={cn(
        "flex-none flex flex-col md:flex-row items-center justify-center gap-12 p-8 bg-primary/10 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-500 min-h-[400px]",
        isInterventionMode && "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
      )}>
        <div className="flex flex-col items-center gap-12">
          <div className="relative group">
            <CoreAvatar status={status} className={cn("z-10", isInterventionMode && "animate-pulse")} />
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              {isInterventionMode ? (
                <AlertTriangle className="h-6 w-6 text-red-500 animate-bounce" />
              ) : (
                <Sparkles className="h-6 w-6 text-accent animate-pulse" />
              )}
              <h3 className={cn("text-xs font-code uppercase tracking-[0.4em]", isInterventionMode ? "text-red-400" : "text-accent/80")}>
                {isInterventionMode ? "HAND OF GOD ACTIVE" : "COGNITIVE BRIDGE V5"}
              </h3>
            </div>
            <div className="text-5xl font-headline tracking-tighter uppercase text-foreground leading-none">
              BROCKSTON <span className="text-accent">C</span>
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-code text-secondary/60 uppercase tracking-widest flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4" /> Anthropic Reasoning Uplink: ACTIVE
                </span>
              </div>
              <Badge variant="outline" className={cn(
                "text-sm py-2 px-8 border-accent/20 text-accent font-black tracking-widest bg-accent/5", 
                isInterventionMode && "border-red-500 text-red-500 bg-red-500/5"
              )}>
                {isInterventionMode ? 'EMERGENCY STABILIZATION' : 'CLASSROOM MISSION: 300'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-black/30 rounded-2xl border border-white/5 p-4 overflow-hidden shadow-inner">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-6 pb-4">
            {messages?.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] group animate-in slide-in-from-bottom-2 duration-300",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={cn("text-[9px] font-code uppercase text-secondary/40")}>
                    {msg.role === 'user' ? 'Lead Architect' : 'BROCKSTON (New Teacher)'}
                  </span>
                  {msg.vortex_data && (
                    <Badge variant="outline" className="text-[8px] h-3 text-accent/40 animate-pulse border-transparent">VORTEX: SYNCED</Badge>
                  )}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm shadow-xl transition-all relative overflow-hidden leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-accent/10 border border-accent/20 text-foreground rounded-tr-none" 
                    : "bg-primary/40 border border-white/10 text-foreground rounded-tl-none backdrop-blur-md",
                  msg.tone_engine_v2?.action_state === 'INTERVENTION' && "border-red-500 bg-red-950/20 text-red-100"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSend} className={cn(
        "flex-none p-4 bg-card rounded-2xl border border-white/5 shadow-2xl",
        isInterventionMode && "border-red-500/40 bg-red-950/5"
      )}>
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            "h-14 w-14 rounded-xl transition-all",
            isListening ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" : "bg-primary/20 border-white/10 text-secondary/60"
          )}>
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          <div className="relative flex-1">
            <Input 
              placeholder={isListening ? "Listening..." : isInterventionMode ? "STABILIZING..." : `Ready for the class of 300...`} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status !== 'idle' || isInterventionMode} 
              className={cn(
                "bg-primary/20 border-white/10 focus-visible:ring-accent h-14 pr-12 font-body text-base",
                isInterventionMode && "border-red-500/40 focus-visible:ring-red-500"
              )} 
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 bg-primary/10 rounded-xl border border-white/5">
              <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent" />
              {autoSpeak ? <Volume2 className="h-5 w-5 text-accent" /> : <VolumeX className="h-5 w-5 text-secondary/40" />}
            </div>
            <Button disabled={status !== 'idle' || !input.trim() || isInterventionMode} className={cn(
              "h-14 w-14 rounded-xl text-accent-foreground glow-accent",
              isInterventionMode ? "bg-red-600 hover:bg-red-700" : "bg-accent hover:bg-accent/80"
            )}>
              {status === 'thinking' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] text-secondary/60 uppercase font-code">
                <ShieldCheck className={cn("h-3.5 w-3.5", isInterventionMode ? "text-red-500" : "text-accent")} /> Truth.Dignity
              </span>
              <span className="flex items-center gap-2 text-[10px] text-secondary/60 uppercase font-code">
                <GraduationCap className={cn("h-3.5 w-3.5", isInterventionMode ? "text-red-500" : "text-accent")} /> Scaffold.300
              </span>
            </div>
            <span className={cn(
              "text-[10px] font-code animate-pulse tracking-widest uppercase font-bold",
              isInterventionMode ? "text-red-500" : "text-accent"
            )}>
              {isInterventionMode ? 'EMERGENCY PROTOCOL ACTIVE' : 'Status: CLASSROOM READY'}
            </span>
        </div>
      </form>
    </div>
  );
};
