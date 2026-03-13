
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { aiCoreKnowledgePoweredResponses } from '@/ai/flows/ai-core-knowledge-powered-responses';
import { quantumFuse } from '@/ai/flows/quantum-fusion-flow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Zap, BrainCircuit, Sparkles, Loader2, Atom, Heart, Shield, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

type Message = {
  role: 'user' | 'model';
  content: string;
  type?: 'standard' | 'knowledge' | 'quantum';
  timestamp?: any;
  trace?: any;
};

const SYMBOLS = [
  { id: 'heart', icon: Heart, label: 'Love' },
  { id: 'safe', icon: Shield, label: 'Safe' },
  { id: 'help', icon: HelpCircle, label: 'Help' },
  { id: 'overwhelmed', icon: AlertTriangle, label: 'Noisy' },
];

export const ChatInterface: React.FC = () => {
  const db = useFirestore();
  const chatId = "main-session-alpha";
  
  const messagesQuery = useMemo(() => {
    return query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
  }, [db]);

  const { data: storedMessages, loading } = useCollection<Message>(messagesQuery);
  const [input, setInput] = useState('');
  const [quantumMode, setQuantumMode] = useState(false);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [valence, setValence] = useState(0.5);
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [storedMessages]);

  const handleQuantumSymbolSelect = (symbolId: string) => {
    if (selectedSymbols.includes(symbolId)) {
      setSelectedSymbols(prev => prev.filter(s => s !== symbolId));
    } else if (selectedSymbols.length < 4) {
      setSelectedSymbols(prev => [...prev, symbolId]);
    }
  };

  const handleSend = async (e?: React.FormEvent, forceKnowledge = false) => {
    e?.preventDefault();
    if (status !== 'idle') return;

    if (quantumMode && selectedSymbols.length === 0) return;
    if (!quantumMode && !input.trim()) return;

    const userMessage = quantumMode ? `[Symbols: ${selectedSymbols.join(', ')}]` : input;
    const currentValence = valence;
    
    setInput('');
    setSelectedSymbols([]);
    setStatus('thinking');

    addDoc(collection(db, 'chats', chatId, 'messages'), {
      role: 'user',
      content: userMessage,
      timestamp: serverTimestamp()
    });

    try {
      let response = '';
      let trace = null;
      let type: 'standard' | 'knowledge' | 'quantum' = 'standard';

      if (quantumMode) {
        const result = await quantumFuse({
          symbols: selectedSymbols,
          valence: currentValence,
          userId: 'operator-alpha'
        });
        response = result.output;
        trace = result;
        type = 'quantum';
      } else if (forceKnowledge || userMessage.toLowerCase().includes('fact')) {
        const history = (storedMessages || []).map(m => m.content);
        const result = await aiCoreKnowledgePoweredResponses({
          query: userMessage,
          chatHistory: history
        });
        response = result.response;
        type = 'knowledge';
      } else {
        const history = (storedMessages || []).map(m => ({ role: m.role, content: m.content }));
        const result = await aiCoreConversationalInteraction({
          message: userMessage,
          chatHistory: history as any
        });
        response = result.response;
      }

      setStatus('speaking');
      
      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: response,
        type,
        trace,
        timestamp: serverTimestamp()
      });
      
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error: any) {
      console.error(error);
      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: `COGNITIVE FAULT: ${error.message || "Interference detected."}`,
        timestamp: serverTimestamp()
      });
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-none flex items-center justify-between px-4 py-2 bg-primary/10 rounded-xl border border-white/5">
        <CoreAvatar status={status} className="h-24 w-24" />
        <div className="flex flex-col items-end gap-2">
           <Badge variant={quantumMode ? "default" : "outline"} className={cn(quantumMode && "bg-accent text-accent-foreground")}>
             {quantumMode ? "Quantum Fusion Active" : "Neural Link Active"}
           </Badge>
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setQuantumMode(!quantumMode)}
            className="text-[10px] uppercase font-code tracking-widest text-secondary hover:text-accent"
           >
             Toggle {quantumMode ? "Conversation" : "AAC Quantum Mode"}
           </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-black/20 rounded-xl border border-white/5 p-4 relative">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {loading && !storedMessages && (
              <div className="flex items-center justify-center h-full opacity-40">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            )}
            
            {storedMessages?.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-code uppercase text-secondary/60">
                    {msg.role === 'user' ? 'Operator' : 'AI.Core'}
                  </span>
                  {msg.type === 'quantum' && <Atom className="h-3 w-3 text-accent" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm shadow-lg",
                  msg.role === 'user' 
                    ? "bg-accent text-accent-foreground font-medium rounded-tr-none" 
                    : "bg-primary/40 border border-white/10 text-foreground rounded-tl-none backdrop-blur-md"
                )}>
                  {msg.content}
                  {msg.trace && (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[9px] font-code text-secondary">
                      TRACE: {msg.trace.top_state} | PROB: {(msg.trace.fusion_prob * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSend} className="flex-none p-4 bg-card rounded-xl border border-white/5 shadow-2xl">
        {quantumMode ? (
          <div className="flex flex-col gap-4">
            <div className="flex justify-around items-center gap-4 py-2">
              {SYMBOLS.map((sym) => {
                const Icon = sym.icon;
                const active = selectedSymbols.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => handleQuantumSymbolSelect(sym.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                      active 
                        ? "bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(0,255,127,0.2)]" 
                        : "bg-black/20 border-white/5 text-secondary hover:border-white/20"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-[9px] uppercase font-code">{sym.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-code text-secondary whitespace-nowrap">Valence:</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={valence}
                onChange={(e) => setValence(parseFloat(e.target.value))}
                className="flex-1 accent-accent h-1"
              />
              <Button 
                onClick={handleSend}
                disabled={selectedSymbols.length === 0 || status !== 'idle'}
                className="bg-accent text-accent-foreground hover:bg-accent/80"
              >
                FUSE
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input 
                placeholder="Inject command or inquiry..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={status !== 'idle'}
                className="bg-primary/20 border-white/10 focus-visible:ring-accent h-12 pr-12 font-body"
              />
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                disabled={status !== 'idle' || !input}
                onClick={() => handleSend(undefined, true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-secondary hover:text-accent transition-colors"
                title="Knowledge-Powered Analysis"
              >
                <BrainCircuit className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              disabled={status !== 'idle' || !input}
              className="h-12 w-12 rounded-xl bg-accent hover:bg-accent/80 text-accent-foreground glow-accent transition-all hover:scale-105 active:scale-95"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex justify-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[10px] text-secondary/60 uppercase font-code">
              <Zap className="h-3 w-3 text-accent" /> NLU.Engaged
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-secondary/60 uppercase font-code">
              <Atom className="h-3 w-3 text-accent" /> Q-Fusion.Enabled
            </span>
        </div>
      </form>
    </div>
  );
};
