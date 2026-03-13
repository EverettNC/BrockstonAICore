"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { aiCoreConversationalInteraction } from '@/ai/flows/ai-core-conversational-interaction';
import { aiCoreKnowledgePoweredResponses } from '@/ai/flows/ai-core-knowledge-powered-responses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Zap, BrainCircuit, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoreAvatar } from './CoreAvatar';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';

type Message = {
  role: 'user' | 'model';
  content: string;
  type?: 'standard' | 'knowledge';
  timestamp?: any;
};

export const ChatInterface: React.FC = () => {
  const db = useFirestore();
  const chatId = "main-session-alpha"; // Using a constant ID for MVP
  
  const messagesQuery = useMemo(() => {
    return query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
  }, [db]);

  const { data: storedMessages, loading } = useCollection<Message>(messagesQuery);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'thinking' | 'speaking'>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [storedMessages]);

  const handleSend = async (e?: React.FormEvent, forceKnowledge = false) => {
    e?.preventDefault();
    if (!input.trim() || status !== 'idle') return;

    const userMessage = input;
    setInput('');
    setStatus('thinking');

    // Optimistically add to Firestore
    addDoc(collection(db, 'chats', chatId, 'messages'), {
      role: 'user',
      content: userMessage,
      timestamp: serverTimestamp()
    });

    try {
      let response = '';
      const history = (storedMessages || []).map(m => ({ role: m.role, content: m.content }));

      if (forceKnowledge || userMessage.toLowerCase().includes('fact') || userMessage.toLowerCase().includes('knowledge')) {
        const result = await aiCoreKnowledgePoweredResponses({
          query: userMessage,
          chatHistory: history.map(m => m.content)
        });
        response = result.response;
      } else {
        const result = await aiCoreConversationalInteraction({
          message: userMessage,
          chatHistory: history as any
        });
        response = result.response;
      }

      setStatus('speaking');
      
      // Save model response to Firestore
      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: response,
        type: forceKnowledge ? 'knowledge' : 'standard',
        timestamp: serverTimestamp()
      });
      
      setTimeout(() => setStatus('idle'), 2000);
    } catch (error) {
      console.error(error);
      addDoc(collection(db, 'chats', chatId, 'messages'), {
        role: 'model',
        content: "SYSTEM ERROR: Cognitive link interrupted. Please retry sequence.",
        timestamp: serverTimestamp()
      });
      setStatus('idle');
    }
  };

  const displayMessages = storedMessages || [];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-none flex justify-center py-4 bg-primary/10 rounded-xl border border-white/5">
        <CoreAvatar status={status} />
      </div>

      <div className="flex-1 min-h-0 bg-black/20 rounded-xl border border-white/5 p-4 relative">
        <ScrollArea className="h-full pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {loading && displayMessages.length === 0 && (
              <div className="flex items-center justify-center h-full opacity-40">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            )}
            
            {displayMessages.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-code uppercase text-secondary/60">
                    {msg.role === 'user' ? 'Operator' : 'AI.Core'}
                  </span>
                  {msg.type === 'knowledge' && <Sparkles className="h-3 w-3 text-accent" />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm",
                  msg.role === 'user' 
                    ? "bg-accent text-accent-foreground font-medium rounded-tr-none" 
                    : "bg-primary/40 border border-white/10 text-foreground rounded-tl-none backdrop-blur-md shadow-lg"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <form onSubmit={handleSend} className="flex-none p-4 bg-card rounded-xl border border-white/5 shadow-2xl">
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
        <div className="flex justify-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-[10px] text-secondary/60 uppercase font-code">
              <Zap className="h-3 w-3 text-accent" /> NLU.Engaged
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-secondary/60 uppercase font-code">
              <Sparkles className="h-3 w-3 text-accent" /> RAG.Enabled
            </span>
        </div>
      </form>
    </div>
  );
};
