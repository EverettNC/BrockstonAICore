
"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, BrainCircuit, Sparkles, Loader2, Atom, Heart, Shield, HelpCircle, AlertTriangle, ShieldCheck, UserCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { shieldPayload } from '@/lib/quantum-defense';

const SPECIALISTS = [
  { id: 'derek', name: 'Derek (General)', color: 'text-accent' },
  { id: 'arthur', name: 'Arthur (Grief)', color: 'text-rose-400' },
  { id: 'alphavox', name: 'AlphaVox (Nonverbal)', color: 'text-blue-400' },
  { id: 'alphawolf', name: 'AlphaWolf (Dementia)', color: 'text-slate-400' },
  { id: 'siera', name: 'Siera (Trauma)', color: 'text-emerald-400' },
  { id: 'inferno', name: 'Inferno (Veteran)', color: 'text-orange-400' },
];

export const ChatInterface: React.FC = () => {
  const db = useFirestore();
  const [specialist, setSpecialist] = useState('derek');
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  
  const chatId = "v5-alpha-session";
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(50)
  ), [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'idle') return;

    const userMsg = input;
    setInput('');
    setStatus('thinking');

    // Apply Quantum Shield before logging
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

      // Response also gets shielded
      const responseShield = shieldPayload(specialist);

      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: result.response,
        specialist,
        ethical_score: result.ethical_score,
        lucas_signal: result.lucas_signal,
        empathy_signal: result.empathy_signal,
        quantum_shield: responseShield,
        timestamp: serverTimestamp()
      });

      setStatus('speaking');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
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
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-[10px] border-accent/20 text-accent">
            <ShieldCheck className="h-3 w-3 mr-1" /> v5.0 Verified
          </Badge>
          <div className="flex items-center gap-1 text-[9px] font-code text-accent animate-pulse">
            <Lock className="h-2 w-2" /> Quantum Shield Active
          </div>
        </div>
      </div>

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
                    {msg.role === 'user' ? 'Operator' : msg.specialist?.toUpperCase()}
                  </span>
                  {msg.quantum_shield && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="outline" className="text-[8px] py-0 h-3 border-accent/30 text-accent/60 font-code uppercase">
                        {msg.quantum_shield.data_class}
                      </Badge>
                    </div>
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
              placeholder="Communicate with core conscience..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'idle'}
              className="bg-primary/20 border-white/10 focus-visible:ring-accent h-12 pr-12 font-body"
            />
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
                <Shield className="h-3 w-3 text-accent" /> Integrity.Filter
              </span>
              <span className="flex items-center gap-1 text-[9px] text-secondary/60 uppercase font-code">
                <Atom className="h-3 w-3 text-accent" /> PQC.Shield
              </span>
            </div>
            <span className="text-[9px] font-code text-accent animate-pulse tracking-widest uppercase">Harvest-Safe</span>
        </div>
      </form>
    </div>
  );
};
