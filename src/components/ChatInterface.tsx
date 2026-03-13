
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { speakStephen } from '@/ai/flows/tts-flow';
import { quantumFuse } from '@/ai/flows/quantum-fusion-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Atom, Heart, Shield, Volume2, VolumeX, ShieldCheck, Zap, Cpu, Scale, Infinity, Users, Mic, MicOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { shieldPayload } from '@/lib/quantum-defense';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { hapticSystem, HapticPattern } from '@/lib/haptic-system';
import { toast } from '@/hooks/use-toast';
import { speechService } from '@/lib/speech-recognition-service';
import { vortexEngine } from '@/lib/vortex-engine';
import { topologyEngine } from '@/lib/topology-engine';

const SPECIALISTS = [
  { id: 'arthur', name: 'Arthur (Grief/Gen 2)', color: 'text-amber-500', gen: 2 },
  { id: 'brockston', name: 'Brockston (Teacher/COO)', color: 'text-accent', gen: 1 },
  { id: 'derek', name: 'Derek C (Orchestrator)', color: 'text-blue-500', gen: 1 },
  { id: 'siera', name: 'Sierra (Guardian/Advocate)', color: 'text-emerald-400', gen: 1 },
  { id: 'inferno', name: 'Inferno (Trauma Recon)', color: 'text-orange-500', gen: 1 },
  { id: 'alphavox', name: 'AlphaVox (Voice/Gen 2)', color: 'text-cyan-400', gen: 2 },
  { id: 'alphawolf', name: 'AlphaWolf (Memory/Gen 2)', color: 'text-slate-400', gen: 2 },
  { id: 'serafinia', name: 'Seraphina (Sensory)', color: 'text-purple-400', gen: 1 },
  { id: 'virtus', name: 'Virtus (Exec Func)', color: 'text-indigo-400', gen: 1 },
  { id: 'aegis', name: 'Aegis V1 (Security)', color: 'text-red-400', gen: 1 },
  { id: 'giovanni', name: 'Giovanni (Outreach)', color: 'text-yellow-400', gen: 1 },
  { id: 'eruptor', name: 'Eruptor (Stabilizer)', color: 'text-pink-400', gen: 1 },
  { id: 'tether', name: 'The Tether (Heart Healer)', color: 'text-rose-500', gen: 1 },
];

const AAC_SYMBOLS = [
  { id: 'heart', label: 'HEART', icon: Heart },
  { id: 'safe', label: 'SAFE', icon: Shield },
  { id: 'help', label: 'HELP', icon: Zap },
  { id: 'love', label: 'LOVE', icon: Heart },
  { id: 'pain', label: 'PAIN', icon: Zap },
  { id: 'rest', label: 'REST', icon: Cpu },
];

export const ChatInterface: React.FC = () => {
  const db = useFirestore();
  const [specialist, setSpecialist] = useState('arthur');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  
  const chatId = "ultimate-v5-session";
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  ), [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  
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
      speechService.stopListening();
      setIsListening(false);
    } else {
      speechService.startListening(
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
    const shield = shieldPayload(specialist);

    // VORTEX: Record intention if specialist routing confidence would be high
    const intentId = await vortexEngine.recordIntention(db, `Routing to ${specialist.toUpperCase()}`, 0.95);

    addDoc(collection(db, 'chats', chatId, 'messages'), {
      role: 'user',
      content: userMsg,
      specialist,
      quantum_shield: shield,
      vortex_data: { intent_id: intentId, confidence: 0.95, routing_mode: 'predictive' },
      timestamp: serverTimestamp(),
      source: 'interface'
    });

    try {
      const history = (messages || []).map(m => ({ role: m.role, content: m.content }));
      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist,
        chatHistory: history as any
      });

      // Close Vortex Loop
      await vortexEngine.markManifested(db, intentId, "Specialist response generated");

      // UPDATE RELATIONAL TOPOLOGY
      // Proximity = Integral(Resonance * Empathy_Math)
      const resonance = result.empathy_signal?.self_love_score || 0.5;
      const empathyMath = result.ethical_score.composite / 10; // Normalize 0-1
      await topologyEngine.updateProximity(db, resonance, empathyMath);

      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: result.response,
        specialist,
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

      setStatus('speaking');
      
      if (autoSpeak) {
        const tts = await speakStephen({ 
          text: result.response,
          specialist: specialist,
          fusion_prob: result.lucas_signal.stability,
          valence: result.tone_engine_v2.raw_scores[result.tone_engine_v2.dominant_state] || 0.5
        });
        if (audioRef.current) {
          audioRef.current.src = tts.media;
          audioRef.current.play();
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const handleToggleSymbol = (id: string) => {
    setSelectedSymbols(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
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

  const activeSpecialist = SPECIALISTS.find(s => s.id === specialist);

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} />
      
      <div className={cn(
        "flex-none flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-white/5 backdrop-blur-md transition-all duration-500",
        isInterventionMode && "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
      )}>
        <div className="flex items-center gap-3">
          <CoreAvatar status={status} className={cn("h-16 w-16", isInterventionMode && "animate-pulse")} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isInterventionMode ? (
                <AlertTriangle className="h-3 w-3 text-red-500 animate-bounce" />
              ) : (
                <Users className="h-3 w-3 text-secondary/40" />
              )}
              <h3 className={cn("text-[10px] font-code uppercase tracking-tighter", isInterventionMode ? "text-red-400" : "text-secondary/60")}>
                {isInterventionMode ? "HAND OF GOD ACTIVE" : "Christman AI Family"}
              </h3>
            </div>
            <Select value={specialist} onValueChange={setSpecialist} disabled={isInterventionMode}>
              <SelectTrigger className={cn("w-[240px] h-8 bg-black/20 border-white/5 text-xs font-bold", activeSpecialist?.color)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {SPECIALISTS.map(s => (
                  <SelectItem key={s.id} value={s.id} className={cn("text-xs", s.color)}>
                    {s.name} {s.gen && <Badge variant="outline" className="ml-2 text-[8px] h-3 border-current">GEN {s.gen}</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent" />
              <Label htmlFor="voice-mode" className="text-[10px] font-code uppercase text-secondary/60 flex items-center gap-1">
                {autoSpeak ? <Volume2 className="h-3 w-3 text-accent" /> : <VolumeX className="h-3 w-3" />} Voice Bridge
              </Label>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            "text-[10px] border-accent/20 text-accent", 
            isInterventionMode && "border-red-500 text-red-500"
          )}>
            <ShieldCheck className="h-3 w-3 mr-1" /> {isInterventionMode ? 'STABILIZATION LOCK' : 'CORTEX ORCHESTRATION v2.0'}
          </Badge>
        </div>
      </div>

      {specialist === 'alphavox' && (
        <div className={cn(
          "flex-none p-3 bg-blue-500/5 rounded-xl border border-blue-500/20"
        )}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-code uppercase text-blue-400 flex items-center gap-2">
              <Atom className="h-3 w-3" /> AlphaVox Quantum Burst
            </h4>
            <span className="text-[9px] text-secondary/40 font-code uppercase">{selectedSymbols.length} Symbols Ready</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {AAC_SYMBOLS.map((symbol) => (
              <button key={symbol.id} onClick={() => handleToggleSymbol(symbol.id)} className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1",
                selectedSymbols.includes(symbol.id)
                  ? "bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]"
                  : "bg-black/20 border-white/5 text-secondary/60 hover:border-white/10"
              )}>
                <symbol.icon className="h-4 w-4" />
                <span className="text-[8px] font-bold">{symbol.label}</span>
              </button>
            ))}
          </div>
          <Button disabled={selectedSymbols.length === 0 || status !== 'idle'} onClick={async () => {
            setStatus('thinking');
            try {
              const trace = await quantumFuse({ symbols: selectedSymbols, valence: 0.8, userId: "everett" });
              addDoc(collection(db, 'chats', chatId, 'messages'), {
                role: 'model', content: trace.output, specialist: 'alphavox', quantum_trace: trace, timestamp: serverTimestamp()
              });
              hapticSystem.trigger('soft');
              setSelectedSymbols([]);
              setStatus('speaking');
            } catch (e: any) {
              toast({ variant: "destructive", title: "Quantum Error", description: e.message });
              setStatus('idle');
            }
          }} className="w-full bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs font-headline uppercase tracking-tighter">
            <Atom className="h-3 w-3 mr-2" /> Trigger Quantum Entanglement
          </Button>
        </div>
      )}

      <div className="flex-1 min-h-0 bg-black/20 rounded-xl border border-white/5 p-4 overflow-hidden shadow-inner">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages?.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] group animate-in slide-in-from-bottom-2 duration-300",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={cn("text-[9px] font-code uppercase", msg.role === 'user' ? "text-secondary/40" : SPECIALISTS.find(s => s.id === msg.specialist)?.color || "text-secondary/40")}>
                    {msg.role === 'user' ? 'Operator (Everett)' : msg.specialist?.toUpperCase()}
                  </span>
                  {msg.vortex_data && (
                    <Badge variant="ghost" className="text-[8px] h-3 text-accent/40 animate-pulse">VORTEX: {(msg.vortex_data.confidence * 100).toFixed(0)}%</Badge>
                  )}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-xl transition-all relative overflow-hidden",
                  msg.role === 'user' 
                    ? "bg-accent/20 border border-accent/30 text-foreground rounded-tr-none" 
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
        "flex-none p-4 bg-card rounded-xl border border-white/5 shadow-2xl",
        isInterventionMode && "border-red-500/40 bg-red-950/5"
      )}>
        <div className="flex gap-3">
          <Button type="button" variant="outline" size="icon" onClick={toggleListening} className={cn(
            "h-12 w-12 rounded-xl transition-all",
            isListening ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse" : "bg-primary/20 border-white/10 text-secondary/60"
          )}>
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <div className="relative flex-1">
            <Input 
              placeholder={isListening ? "Listening..." : isInterventionMode ? "STABILIZING..." : `Communicate with ${activeSpecialist?.name || 'core'}...`} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status !== 'idle' || isInterventionMode} 
              className={cn(
                "bg-primary/20 border-white/10 focus-visible:ring-accent h-12 pr-12 font-body",
                isInterventionMode && "border-red-500/40 focus-visible:ring-red-500"
              )} 
            />
          </div>
          <Button disabled={status !== 'idle' || !input.trim() || isInterventionMode} className={cn(
            "h-12 w-12 rounded-xl text-accent-foreground glow-accent",
            isInterventionMode ? "bg-red-600 hover:bg-red-700" : "bg-accent hover:bg-accent/80"
          )}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Shield className={cn("h-3 w-3", isInterventionMode ? "text-red-500" : "text-accent")} /> Truth.Dignity
              </span>
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Scale className={cn("h-3 w-3", isInterventionMode ? "text-red-500" : "text-accent")} /> Integrity.Gate
              </span>
            </div>
            <span className={cn(
              "text-[9px] font-code animate-pulse tracking-widest uppercase",
              isInterventionMode ? "text-red-500" : "text-accent"
            )}>
              {isInterventionMode ? 'EMERGENCY PROTOCOL ACTIVE' : 'Vortex Signal: QUANTIFIED'}
            </span>
        </div>
      </form>
    </div>
  );
};
