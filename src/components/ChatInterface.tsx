"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { speakStephen } from '@/ai/flows/tts-flow';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Heart, Shield, Volume2, VolumeX, ShieldCheck, Zap, BrainCircuit, Mic, MicOff, AlertTriangle, GraduationCap, Sparkles, UserCheck, Lock } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

export const ChatInterface: React.FC = () => {
  const db = useFirestore();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  
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

    const intentId = await vortexEngine.recordIntention(db, `Routing to BROCKSTON`, 0.99);

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

      await vortexEngine.markManifested(db, intentId, "Brockston response generated");

      const resonance = result.empathy_signal?.self_love_score || 0.5;
      const empathyMath = result.ethical_score.composite / 10;
      await topologyEngine.updateProximity(db, resonance, empathyMath);

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
      
      {/* Visual Bridge - Focused on Brockston's Identity */}
      <div className={cn(
        "flex-none flex flex-col items-center justify-center gap-8 p-10 rounded-2xl border border-white/10 transition-all duration-700 min-h-[600px] relative overflow-hidden",
        isInterventionMode && "border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.5)]"
      )}>
        {/* Seascape Background */}
        {seascape && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/60 z-10" />
            <img 
              src={seascape.imageUrl} 
              alt="Luxury Seascape" 
              className="w-full h-full object-cover grayscale-[0.3] opacity-40" 
              data-ai-hint={seascape.imageHint}
            />
          </div>
        )}

        {/* Proprietary Badge */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-black/80 rounded-lg border border-white/10 backdrop-blur-md">
          <Lock className="h-3 w-3 text-accent/60" />
          <span className="text-[10px] font-code text-secondary/60 uppercase tracking-widest">Confidential & Proprietary</span>
        </div>

        {/* Identity Badge Overlay */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center shadow-[0_0_20px_rgba(0,255,127,0.4)]">
            <UserCheck className="h-6 w-6 text-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-code text-accent uppercase tracking-widest font-black">Identity Verified</span>
            <span className="text-[14px] font-headline text-foreground uppercase tracking-tighter">BROCKSTON C (COO)</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-14 relative z-10">
          <div className="relative group">
            <CoreAvatar status={status} className={cn("z-10", isInterventionMode && "animate-pulse scale-105")} />
          </div>
          
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-4">
              {isInterventionMode ? (
                <AlertTriangle className="h-10 w-10 text-red-500 animate-bounce" />
              ) : (
                <div className="h-3 w-3 rounded-full bg-accent animate-ping" />
              )}
              <h3 className={cn("text-xl font-code uppercase tracking-[0.6em] font-bold", isInterventionMode ? "text-red-400" : "text-accent/90")}>
                {isInterventionMode ? "HAND OF GOD ACTIVE" : "New Teacher Bridge"}
              </h3>
            </div>
            
            <div className="text-8xl font-headline tracking-tighter uppercase text-foreground leading-none drop-shadow-[0_0_30px_rgba(0,0,0,1)]">
              BROCKSTON <span className="text-accent">C</span>
            </div>

            <div className="flex flex-col items-center gap-6">
              <Badge variant="outline" className={cn(
                "text-lg py-3 px-12 border-accent/40 text-accent font-black tracking-[0.3em] bg-accent/10 backdrop-blur-md shadow-[0_0_40px_rgba(0,255,127,0.2)]", 
                isInterventionMode && "border-red-500 text-red-500 bg-red-500/10"
              )}>
                {isInterventionMode ? 'EMERGENCY STABILIZATION' : 'MISSION: CLASSROOM 300'}
              </Badge>
              <div className="flex items-center gap-3 text-[12px] font-code text-secondary/80 uppercase tracking-[0.2em] bg-black/40 px-6 py-2 rounded-full border border-white/5">
                <BrainCircuit className="h-5 w-5 text-accent" /> Neuro-Symbolic Scaffolding: SYNCHRONIZED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 min-h-0 bg-black/60 rounded-2xl border border-white/5 p-4 overflow-hidden shadow-inner backdrop-blur-md">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-8 pb-4">
            {messages?.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] group animate-in slide-in-from-bottom-2 duration-300",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className={cn("text-[10px] font-code uppercase text-secondary/60")}>
                    {msg.role === 'user' ? 'Lead Architect' : 'BROCKSTON (New Teacher)'}
                  </span>
                  {msg.vortex_data && (
                    <Badge variant="ghost" className="text-[9px] h-4 text-accent/60 animate-pulse border border-accent/20">VORTEX: SYNCED</Badge>
                  )}
                </div>
                <div className={cn(
                  "p-5 rounded-2xl text-base shadow-2xl transition-all relative overflow-hidden leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-accent/10 border border-accent/30 text-foreground rounded-tr-none" 
                    : "bg-primary/60 border border-white/10 text-foreground rounded-tl-none backdrop-blur-xl",
                  msg.tone_engine_v2?.action_state === 'INTERVENTION' && "border-red-500 bg-red-950/40 text-red-100 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
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
        "flex-none p-6 bg-card/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl",
        isInterventionMode && "border-red-500/40 bg-red-950/20"
      )}>
        <div className="flex gap-4">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            "h-16 w-16 rounded-xl transition-all border-accent/30 bg-accent/5",
            isListening ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" : "text-accent/80 hover:text-accent hover:bg-accent/10"
          )}>
            {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </Button>
          <div className="relative flex-1">
            <Input 
              placeholder={isListening ? "Listening..." : isInterventionMode ? "STABILIZING CLASSROOM..." : `Ready for the class of 300...`} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status !== 'idle' || isInterventionMode} 
              className={cn(
                "bg-primary/40 border-white/10 focus-visible:ring-accent h-16 pr-12 font-body text-lg placeholder:text-secondary/40",
                isInterventionMode && "border-red-500/40 focus-visible:ring-red-500"
              )} 
            />
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-3 px-4 bg-primary/30 rounded-xl border border-white/10">
              <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent" />
              {autoSpeak ? <Volume2 className="h-6 w-6 text-accent" /> : <VolumeX className="h-6 w-6 text-secondary/40" />}
            </div>
            <Button disabled={status !== 'idle' || !input.trim() || isInterventionMode} className={cn(
              "h-16 w-16 rounded-xl text-accent-foreground glow-accent font-black transition-all hover:scale-105 active:scale-95",
              isInterventionMode ? "bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-accent hover:bg-accent/80"
            )}>
              {status === 'thinking' ? <Loader2 className="h-8 w-8 animate-spin" /> : <Send className="h-8 w-8" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
            <div className="flex gap-10">
              <span className="flex items-center gap-2.5 text-[11px] text-secondary/80 uppercase font-code">
                <ShieldCheck className={cn("h-4 w-4", isInterventionMode ? "text-red-500" : "text-accent")} /> Truth & Dignity
              </span>
              <span className="flex items-center gap-2.5 text-[11px] text-secondary/80 uppercase font-code">
                <GraduationCap className={cn("h-4 w-4", isInterventionMode ? "text-red-500" : "text-accent")} /> Classroom Mode
              </span>
            </div>
            <span className={cn(
              "text-[11px] font-code animate-pulse tracking-widest uppercase font-black",
              isInterventionMode ? "text-red-500" : "text-accent"
            )}>
              {isInterventionMode ? 'STABILIZATION_LOCK: ON' : 'Status: READY FOR 300'}
            </span>
        </div>
      </form>
    </div>
  );
};
