"use client";

/**
 * @fileOverview CortexMonitor - Operational Intelligence Dashboard.
 * Rule 13 Compliant: Absolute Honesty.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Activity, Database, Cpu, SearchCode, Waves, ListTree, CheckCircle2, Rocket, Target, Heart, Infinity as InfinityIcon, Send, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { aiCoreConversationalInteraction, type AICoreConversationalInteractionOutput } from '@/ai/flows/ai-core-conversational-interaction';
import { useToast } from '@/hooks/use-toast';

export const CortexMonitor: React.FC = () => {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [deepResponse, setDeepResponse] = useState<AICoreConversationalInteractionOutput | null>(null);
  const [intentions, setIntentions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedIntentions = localStorage.getItem('brockston:vortex:intentions');
    if (storedIntentions) {
      setIntentions(JSON.parse(storedIntentions));
    }
    const storedMessages = localStorage.getItem('brockston:chat:messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  const manifests = intentions?.filter((i: any) => i.manifested).length || 0;
  const totalIntents = intentions?.length || 0;
  const manifestRatio = totalIntents > 0 ? (manifests / totalIntents) : 0;

  const handleAsk = useCallback(async () => {
    if (!question.trim() || isThinking) return;
    setIsThinking(true);
    setDeepResponse(null);
    try {
      const result = await aiCoreConversationalInteraction({ message: question, specialist: 'brockston', chatHistory: [] });
      setDeepResponse(result);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Cortex Failure', description: err?.message || 'Deep query failed.' });
    } finally {
      setIsThinking(false);
    }
  }, [question, isThinking]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAsk();
    }
  };

  const reasoning = deepResponse?.reasoning_trace;

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2 pb-12">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> Brockston Cortex v5.0
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            Authentic Neural Cortex | Actualized Reasoning
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-accent border-accent/40 font-code text-[8px]">
            ACTIVE INTENTIONS: {totalIntents}
          </Badge>
          <Badge variant="outline" className="text-accent border-accent/40 font-code text-[8px]">
            MANIFESTED: {manifests}
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deep Query */}
        <Card className="bg-card/50 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
              <SearchCode className="h-3 w-3" /> Deep Query
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Brockston anything..."
              className="min-h-[100px] bg-black/40 border-white/10 text-sm"
            />
            <Button
              onClick={handleAsk}
              disabled={isThinking || !question.trim()}
              className="w-full bg-accent hover:bg-accent/80 text-black"
            >
              {isThinking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Ask
            </Button>

            {deepResponse && (
              <div className="p-4 bg-black/40 rounded-lg border border-accent/20 space-y-2">
                <div className="text-xs text-accent font-code">RESPONSE:</div>
                <div className="text-sm text-foreground">{deepResponse.response}</div>
                {reasoning && (
                  <div className="text-[10px] text-secondary/60 font-code mt-2">
                    Reasoning: {JSON.stringify(reasoning)}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Stats */}
        <Card className="bg-card/50 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
              <Activity className="h-3 w-3" /> System Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-secondary/60">Messages</span>
                <span className="text-accent font-code">{messages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary/60">Intentions</span>
                <span className="text-accent font-code">{totalIntents}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-secondary/60">Manifest Ratio</span>
                <span className="text-accent font-code">{(manifestRatio * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <div className="text-[10px] uppercase text-secondary/40 font-code mb-2">Manifestation Progress</div>
              <Progress value={manifestRatio * 100} className="h-1 bg-primary/20 [&>div]:bg-accent" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
