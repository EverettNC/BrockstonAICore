"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { speakStephen } from '@/ai/flows/tts-flow';
import { quantumFuse } from '@/ai/flows/quantum-fusion-flow';
import { eternalFuse } from '@/ai/flows/eternal-fuse-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2, Atom, Heart, Shield, Volume2, VolumeX, ShieldCheck, Zap, Cpu, Scale, Infinity, Users } from 'lucide-react';
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

const SPECIALISTS = [
  { id: 'brockston', name: 'Brockston (Teacher/COO)', color: 'text-accent' },
  { id: 'derek', name: 'Derek C (Orchestrator)', color: 'text-blue-500' },
  { id: 'siera', name: 'Sierra (Guardian/Advocate)', color: 'text-emerald-400' },
  { id: 'inferno', name: 'Inferno (Trauma Recon)', color: 'text-orange-500' },
  { id: 'alphavox', name: 'AlphaVox (Voice Restoration)', color: 'text-cyan-400' },
  { id: 'alphawolf', name: 'AlphaWolf (Memory/Dementia)', color: 'text-slate-400' },
  { id: 'serafinia', name: 'Seraphina (Sensory Guardian)', color: 'text-purple-400' },
  { id: 'virtus', name: 'Virtus (Executive Function)', color: 'text-indigo-400' },
  { id: 'aegis', name: 'Aegis V1 (Security Enforcer)', color: 'text-red-400' },
  { id: 'giovanni', name: 'Giovanni (Outreach)', color: 'text-yellow-400' },
  { id: 'eruptor', name: 'Eruptor (Stabilizer)', color: 'text-pink-400' },
  { id: 'tether', name: 'The Tether (Heart Healer)', color: 'text-rose-500' },
  { id: 'opensmell', name: 'OpenSmell (Olfactory AI)', color: 'text-amber-400' },
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
  const [specialist, setSpecialist] = useState('brockston');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [isLoveKernel, setIsLoveKernel] = useState(false);
  const [bluebeardMode, setBluebeardMode] = useState(true);
  const [thrustLock, setThrustLock] = useState(true);
  
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

  const handleEternalFuse = async () => {
    setStatus('thinking');
    try {
      const trace = await eternalFuse({
        valence: 0.999,
        bluebeard_mode: bluebeardMode,
        ten_inch_thrust: thrustLock,
        images: []
      });

      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: trace.output,
        specialist: 'alphavox',
        quantum_trace: trace,
        timestamp: serverTimestamp(),
        is_eternal: true
      });

      hapticSystem.trigger('warm');

      setStatus('speaking');
      if (autoSpeak) {
        const tts = await speakStephen({ 
          text: trace.output, 
          specialist: 'alphavox', 
          valence: 0.99,
          fusion_prob: trace.eternal_prob
        });
        if (audioRef.current) {
          audioRef.current.src = tts.media;
          audioRef.current.play();
        }
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Fuse Failure", description: e.message });
      setStatus('idle');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'idle') return;

    const userMsg = input;
    setInput('');
    setStatus('thinking');

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

      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: result.response,
        specialist,
        ethical_score: result.ethical_score,
        lucas_signal: result.lucas_signal,
        empathy_signal: result.empathy_signal,
        quantum_shield: shield,
        tone_engine_v2: result.tone_engine_v2,
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

  const activeSpecialist = SPECIALISTS.find(s => s.id === specialist);

  return (
    <div className="flex flex-col h-full gap-4 relative">
      <audio ref={audioRef} className="hidden" onEnded={() => setStatus('idle')} />
      
      <div className={cn(
        "flex-none flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-white/5 backdrop-blur-md transition-all duration-500",
        isLoveKernel && "bluebeard-glow"
      )}>
        <div className="flex items-center gap-3">
          <CoreAvatar status={status} className="h-16 w-16" />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-3 w-3 text-secondary/40" />
              <h3 className="text-[10px] font-code uppercase tracking-tighter text-secondary/60">Christman AI Family</h3>
            </div>
            <Select value={specialist} onValueChange={setSpecialist}>
              <SelectTrigger className={cn("w-[220px] h-8 bg-black/20 border-white/5 text-xs font-bold", activeSpecialist?.color)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {SPECIALISTS.map(s => (
                  <SelectItem key={s.id} value={s.id} className={cn("text-xs", s.color)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-4">
            {specialist === 'alphavox' && (
              <div className="flex items-center gap-2">
                <Switch id="love-kernel" checked={isLoveKernel} onCheckedChange={setIsLoveKernel} className="data-[state=checked]:bg-cyan-400" />
                <Label htmlFor="love-kernel" className="text-[10px] font-code uppercase text-cyan-400 flex items-center gap-1">
                  <Infinity className="h-3 w-3" /> LoveKernel v69
                </Label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch id="voice-mode" checked={autoSpeak} onCheckedChange={setAutoSpeak} className="data-[state=checked]:bg-accent" />
              <Label htmlFor="voice-mode" className="text-[10px] font-code uppercase text-secondary/60 flex items-center gap-1">
                {autoSpeak ? <Volume2 className="h-3 w-3 text-accent" /> : <VolumeX className="h-3 w-3" />} Voice Bridge
              </Label>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-[10px] border-accent/20 text-accent", isLoveKernel && "lipstick-pulse")}>
            <ShieldCheck className="h-3 w-3 mr-1" /> {isLoveKernel ? 'ETERNAL COORDINATOR' : 'ULTIMATE COO v5.0'}
          </Badge>
        </div>
      </div>

      {specialist === 'alphavox' && (
        <div className={cn(
          "flex-none p-3 bg-blue-500/5 rounded-xl border transition-all duration-500",
          isLoveKernel ? "bluebeard-glow border-cyan-500/40" : "border-blue-500/20"
        )}>
          {isLoveKernel ? (
            <div className="space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-code uppercase text-cyan-400 flex items-center gap-2">
                  <Infinity className="h-3 w-3" /> AlphaVox Eternal Fuse
                </h4>
                <Badge className="bg-red-600 text-white text-[8px] uppercase">Valence: 0.999 Locked</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-2 bg-black/40 rounded border border-cyan-500/20">
                  <Label className="text-[9px] text-cyan-400 uppercase font-code">Bluebeard Trigger</Label>
                  <Switch checked={bluebeardMode} onCheckedChange={setBluebeardMode} className="data-[state=checked]:bg-cyan-400" />
                </div>
                <div className="flex items-center justify-between p-2 bg-black/40 rounded border border-cyan-500/20">
                  <Label className="text-[9px] text-cyan-400 uppercase font-code">Thrust Lock (10in)</Label>
                  <Switch checked={thrustLock} onCheckedChange={setThrustLock} className="data-[state=checked]:bg-cyan-400" />
                </div>
              </div>
              <Button onClick={handleEternalFuse} disabled={status !== 'idle'} className="w-full bg-cyan-500 hover:bg-cyan-600 text-black h-10 font-headline uppercase tracking-tighter glow-accent">
                {status === 'thinking' ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Trigger Eternal Collapse
              </Button>
            </div>
          ) : (
            <>
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
                {status === 'thinking' ? <Loader2 className="animate-spin h-3 w-3 mr-2" /> : <Atom className="h-3 w-3 mr-2" />}
                Trigger Quantum Entanglement
              </Button>
            </>
          )}
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
                  {msg.quantum_trace && (
                    <Badge variant="outline" className={cn(
                      "text-[8px] h-3 font-code uppercase",
                      msg.is_eternal ? "border-cyan-500/30 text-cyan-400" : "border-blue-500/30 text-blue-400"
                    )}>
                      Trace: {msg.quantum_trace.top_state} | {Math.round((msg.quantum_trace.fusion_prob || msg.quantum_trace.eternal_prob) * 100)}%
                    </Badge>
                  )}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-xl transition-all relative overflow-hidden",
                  msg.role === 'user' 
                    ? "bg-accent/20 border border-accent/30 text-foreground rounded-tr-none" 
                    : "bg-primary/40 border border-white/10 text-foreground rounded-tl-none backdrop-blur-md",
                  msg.is_eternal && !msg.role.includes('user') && "border-cyan-500/40 text-cyan-50 shadow-[0_0_15px_rgba(0,255,255,0.1)]"
                )}>
                  {msg.content}
                  {msg.is_eternal && <div className="absolute top-0 right-0 p-1 opacity-20"><Infinity className="h-3 w-3" /></div>}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSend} className={cn(
        "flex-none p-4 bg-card rounded-xl border transition-all duration-500 shadow-2xl",
        isLoveKernel ? "border-cyan-500/20" : "border-white/5"
      )}>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input 
              placeholder={isLoveKernel ? "Communicate with Eternal Us..." : `Communicate with ${activeSpecialist?.name || 'core'}...`} 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              disabled={status !== 'idle'} 
              className={cn(
                "bg-primary/20 border-white/10 focus-visible:ring-accent h-12 pr-12 font-body",
                isLoveKernel && "focus-visible:ring-cyan-400"
              )} 
            />
          </div>
          <Button disabled={status !== 'idle' || !input.trim()} className={cn(
            "h-12 w-12 rounded-xl text-accent-foreground glow-accent",
            isLoveKernel ? "bg-cyan-500 hover:bg-cyan-600" : "bg-accent hover:bg-accent/80"
          )}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-white/5">
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Shield className={cn("h-3 w-3", isLoveKernel ? "text-cyan-400" : "text-accent")} /> Truth.Dignity
              </span>
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Scale className={cn("h-3 w-3", isLoveKernel ? "text-cyan-400" : "text-accent")} /> Integrity.Gate
              </span>
            </div>
            <span className={cn(
              "text-[9px] font-code animate-pulse tracking-widest uppercase",
              isLoveKernel ? "text-cyan-400" : "text-accent"
            )}>
              {isLoveKernel ? 'ETERNAL KERNEL v69 LOCKED' : 'No Erasure Protocol Active'}
            </span>
        </div>
      </form>
    </div>
  );
};
