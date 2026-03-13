
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { speakStephen } from '@/ai/flows/tts-flow';
import { quantumFuse, QuantumTrace } from '@/ai/flows/quantum-fusion-flow';
import { soulForgeProcess } from '@/ai/flows/soul-forge-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, BrainCircuit, Sparkles, Loader2, Atom, Heart, Shield, Volume2, VolumeX, ShieldCheck, UserCircle, Lock, Mic, Zap, Cpu, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { shieldPayload } from '@/lib/quantum-defense';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BehaviorType } from '@/lib/behavioral-interpreter';
import { toast } from '@/hooks/use-toast';

const SPECIALISTS = [
  { id: 'derek', name: 'Brockston (Ultimate)', color: 'text-accent' },
  { id: 'arthur', name: 'Arthur (Grief)', color: 'text-rose-400' },
  { id: 'alphavox', name: 'AlphaVox (Nonverbal)', color: 'text-blue-400' },
  { id: 'alphawolf', name: 'AlphaWolf (Dementia)', color: 'text-slate-400' },
  { id: 'siera', name: 'Siera (Trauma)', color: 'text-emerald-400' },
  { id: 'inferno', name: 'Inferno (Veteran)', color: 'text-orange-400' },
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
  const [specialist, setSpecialist] = useState('derek');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  
  const chatId = "v5-alpha-session";
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  ), [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const { data: forgeState } = useDoc<any>(doc(db, 'cognitive_core', 'main-bridge'));
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleToggleSymbol = (id: string) => {
    setSelectedSymbols(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const processLTP = async (salience: number, toneContext: any) => {
    if (!forgeState) return;
    
    try {
      const currentWeights = {
        emotional_state: forgeState.emotional_state || 0.5,
        tonal_stability: forgeState.tonal_stability || 0.5,
        speech_cadence: forgeState.speech_cadence || 0.5,
        respiratory_pattern: forgeState.respiratory_pattern || 0.5,
        lived_truth_witness: forgeState.lived_truth_witness || 0.5,
        trauma_association: forgeState.trauma_association || 0.5,
        lucas_tone: forgeState.lucas_tone || 0.6,
        narrative_clarity: forgeState.narrative_clarity || 0.5,
      };

      // Determine if tone indicates pain or safety based on ToneEngine v2.0 dominant state
      const isDistressed = ['tremble', 'last_breath', 'annoyed'].includes(toneContext.dominant_state);
      const isSafe = ['happy', 'proud', 'sweetheart'].includes(toneContext.dominant_state);

      const forgeResult = await soulForgeProcess({
        currentWeights,
        salience,
        isDistressed,
        isSafe,
        emergency: salience > 0.85 || toneContext.action_state === 'HOLD_SPACE'
      });

      await setDoc(doc(db, 'cognitive_core', 'main-bridge'), {
        ...forgeResult.updatedWeights,
        last_ltp_event: serverTimestamp(),
        ltp_triggered: forgeResult.ltpTriggered
      }, { merge: true });

      if (forgeResult.ltpTriggered && isSafe) {
        toast({
          title: "Lucas Recovery Synchronized",
          description: "Safety overlay successful — trauma association decaying.",
        });
      }
    } catch (e) {
      console.error("LTP Bridge failed", e);
    }
  };

  const handleQuantumFuse = async () => {
    if (selectedSymbols.length === 0 || status !== 'idle') return;
    setStatus('thinking');
    
    try {
      const trace = await quantumFuse({
        symbols: selectedSymbols,
        valence: 0.8,
        userId: "everett_n_christman"
      });

      const shield = shieldPayload('alphavox');
      
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'user',
        content: `[QUANTUM BURST]: ${selectedSymbols.join(' + ')}`,
        specialist: 'alphavox',
        timestamp: serverTimestamp(),
        is_quantum: true,
        symbols: selectedSymbols
      });

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: trace.output,
        specialist: 'alphavox',
        quantum_shield: shield,
        quantum_trace: trace,
        timestamp: serverTimestamp()
      });

      // Map quantum trace to simulated tone context for Lucas Recovery
      await processLTP(0.8, { dominant_state: 'happy', action_state: 'NORMAL' }); 
      setSelectedSymbols([]);
      setStatus('speaking');

      if (autoSpeak) {
        const tts = await speakStephen({ 
          text: trace.output,
          specialist: 'alphavox',
          fusion_prob: trace.fusion_prob,
          valence: trace.valence_arc
        });
        if (audioRef.current) {
          audioRef.current.src = tts.media;
          audioRef.current.play();
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sensory Threshold",
        description: err.message
      });
      setStatus('idle');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'idle') return;

    const userMsg = input;
    setInput('');
    setStatus('thinking');

    // Record behavioral intent
    let behaviorType: BehaviorType = "intent:request_info";
    if (userMsg.toLowerCase().includes('?')) behaviorType = "intent:request_clarification";
    if (userMsg.toLowerCase().includes('thank')) behaviorType = "intent:gratitude";

    addDoc(collection(db, 'behavioral_history'), {
      type: behaviorType,
      intensity: 0.5,
      context: { source: 'chat', length: userMsg.length },
      timestamp: new Date().toISOString()
    });

    const shield = shieldPayload(specialist);

    addDoc(collection(db, 'chats', chatId, 'messages'), {
      role: 'user',
      content: userMsg,
      specialist,
      quantum_shield: shield,
      timestamp: serverTimestamp()
    });

    try {
      const history = (messages || []).map(m => ({ role: m.role, content: m.content }));
      const result = await aiCoreConversationalInteraction({
        message: userMsg,
        specialist,
        chatHistory: history as any
      });

      const responseShield = shieldPayload(specialist);

      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: result.response,
        specialist,
        ethical_score: result.ethical_score,
        lucas_signal: result.lucas_signal,
        empathy_signal: result.empathy_signal,
        quantum_shield: responseShield,
        tone_engine_v2: result.tone_engine_v2,
        timestamp: serverTimestamp()
      });

      // Trigger LTP using Lucas Recovery Kernel
      await processLTP(result.empathy_signal.self_love_score, result.tone_engine_v2);

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

  return (
    <div className="flex flex-col h-full gap-4">
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} />
      
      {/* Specialist & Identity Header */}
      <div className="flex-none flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <CoreAvatar status={status} className="h-16 w-16" />
          <div>
            <h3 className="text-xs font-code uppercase tracking-tighter text-secondary/60">Active Specialist</h3>
            <Select value={specialist} onValueChange={setSpecialist}>
              <SelectTrigger className="w-[180px] h-8 bg-black/20 border-white/5 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPECIALISTS.map(s => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Switch 
              id="voice-mode" 
              checked={autoSpeak} 
              onCheckedChange={setAutoSpeak}
              className="data-[state=checked]:bg-accent"
            />
            <Label htmlFor="voice-mode" className="text-[10px] font-code uppercase text-secondary/60 flex items-center gap-1">
              {autoSpeak ? <Volume2 className="h-3 w-3 text-accent" /> : <VolumeX className="h-3 w-3" />} Voice Bridge
            </Label>
          </div>
          <Badge variant="outline" className="text-[10px] border-accent/20 text-accent">
            <ShieldCheck className="h-3 w-3 mr-1" /> Ultimate COO v5.0
          </Badge>
        </div>
      </div>

      {/* AlphaVox Quantum Burst Panel (Conditional) */}
      {specialist === 'alphavox' && (
        <div className="flex-none p-3 bg-blue-500/5 rounded-xl border border-blue-500/20 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-code uppercase text-blue-400 flex items-center gap-2">
              <Atom className="h-3 w-3" /> AlphaVox Quantum Burst
            </h4>
            <span className="text-[9px] text-secondary/40 font-code uppercase">{selectedSymbols.length} Symbols Ready</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
            {AAC_SYMBOLS.map((symbol) => (
              <button
                key={symbol.id}
                onClick={() => handleToggleSymbol(symbol.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg border transition-all gap-1",
                  selectedSymbols.includes(symbol.id)
                    ? "bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]"
                    : "bg-black/20 border-white/5 text-secondary/60 hover:border-white/10"
                )}
              >
                <symbol.icon className="h-4 w-4" />
                <span className="text-[8px] font-bold">{symbol.label}</span>
              </button>
            ))}
          </div>
          <Button 
            disabled={selectedSymbols.length === 0 || status !== 'idle'}
            onClick={handleQuantumFuse}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white h-8 text-xs font-headline uppercase tracking-tighter"
          >
            {status === 'thinking' ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <Atom className="h-3 w-3 mr-2" />}
            Trigger Quantum Entanglement
          </Button>
        </div>
      )}

      {/* Episodic Memory (Chat View) */}
      <div className="flex-1 min-h-0 bg-black/20 rounded-xl border border-white/5 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages?.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] group",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-code uppercase text-secondary/40">
                    {msg.role === 'user' ? 'Operator (Everett)' : msg.specialist?.toUpperCase()}
                  </span>
                  {msg.quantum_trace && (
                    <Badge variant="outline" className="text-[8px] h-3 border-blue-500/30 text-blue-400 font-code uppercase">
                      Trace: {msg.quantum_trace.top_state} | {Math.round(msg.quantum_trace.fusion_prob * 100)}%
                    </Badge>
                  )}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-xl transition-all",
                  msg.role === 'user' 
                    ? "bg-accent/20 border border-accent/30 text-foreground rounded-tr-none" 
                    : "bg-primary/40 border border-white/10 text-foreground rounded-tl-none backdrop-blur-md"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Inbound/Outbound Bridge */}
      <form onSubmit={handleSend} className="flex-none p-4 bg-card rounded-xl border border-white/5 shadow-2xl">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input 
              placeholder="Communicate with ultimate core..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'idle'}
              className="bg-primary/20 border-white/10 focus-visible:ring-accent h-12 pr-12 font-body"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
              <Mic className="h-4 w-4 text-secondary cursor-pointer" />
            </div>
          </div>
          <Button 
            disabled={status !== 'idle' || !input.trim()}
            className="h-12 w-12 rounded-xl bg-accent hover:bg-accent/80 text-accent-foreground glow-accent"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Shield className="h-3 w-3 text-accent" /> Truth.Dignity
              </span>
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Scale className="h-3 w-3 text-accent" /> Integrity.Gate
              </span>
            </div>
            <span className="text-[9px] font-code text-accent animate-pulse tracking-widest uppercase">No Erasure Protocol Active</span>
        </div>
      </form>
    </div>
  );
};
