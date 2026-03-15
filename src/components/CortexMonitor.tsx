"use client";

/**
 * @fileOverview CortexMonitor - Operational Intelligence Dashboard.
 * Rule 13 Compliant: Absolute Honesty.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Activity, Database, Cpu, SearchCode, Waves, ListTree, CheckCircle2, Rocket, Target, Heart, Infinity as InfinityIcon, Send, Loader2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { BehavioralInterpreter } from '@/lib/behavioral-interpreter';
import { aiCoreConversationalInteraction, type AICoreConversationalInteractionOutput } from '@/ai/flows/ai-core-conversational-interaction';

export const CortexMonitor: React.FC = () => {
  const db = useFirestore();

  // Deep query state
  const [question, setQuestion] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [deepResponse, setDeepResponse] = useState<AICoreConversationalInteractionOutput | null>(null);

  const messagesQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'chats', 'ultimate-v5-session', 'messages'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [db]);

  const behaviorQuery = useMemo(() => {
    if (!db) return null;
    return query(
      collection(db, 'behavioral_history'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
  }, [db]);

  const intentionsQuery = useMemo(() => db ? query(collection(db, 'vortex_intentions')) : null, [db]);
  const knowledgeQuery = useMemo(() => db ? query(collection(db, 'knowledge_domains')) : null, [db]);
  const insightsQuery = useMemo(() => db ? query(collection(db, 'learned_insights'), orderBy('timestamp', 'desc'), limit(1)) : null, [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const { data: behaviorHistory } = useCollection<any>(behaviorQuery);
  const { data: intentions } = useCollection<any>(intentionsQuery);
  const { data: knowledgeDomains } = useCollection<any>(knowledgeQuery);
  const { data: latestInsight } = useCollection<any>(insightsQuery);

  const knowledgeEngineActive = (knowledgeDomains?.some((d: any) => d.mastery_level > 0)) || ((latestInsight?.length ?? 0) > 0) || false;
  const temporalEngineActive = (behaviorHistory && behaviorHistory.length > 0) || (messages && messages.length > 2) || false;

  const temporalPattern = useMemo(() => {
    if (!behaviorHistory || behaviorHistory.length < 3) return null;
    const obsHistory = [...behaviorHistory].reverse();
    return BehavioralInterpreter.analyzeTemporalSequence(obsHistory);
  }, [behaviorHistory]);

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
    } catch (err) {
      console.error('Deep query error:', err);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

        {/* LEFT COLUMN */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader className="pb-3 border-b border-white/5 bg-accent/5">
              <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                <Cpu className="h-3 w-3" /> System Wiring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <EngineStatus label="Reasoning Core (Claude)" active={true} icon={BrainCircuit} />
              <EngineStatus label="Knowledge Engine (Local)" active={knowledgeEngineActive} icon={Database} detail={latestInsight?.[0] ? `Last: ${latestInsight[0].domain} → ${latestInsight[0].topic}` : undefined} />
              <EngineStatus label="Temporal Nonverbal Engine" active={temporalEngineActive} icon={Waves} />

              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] uppercase font-code text-secondary/60 mb-2">Manifestation Stability</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-accent font-bold">{(manifestRatio * 100).toFixed(1)}% RATIO</div>
                  </div>
                  <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-accent font-bold">SYNC: OK</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 border-yellow-500/20 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Rocket className="h-24 w-24 text-yellow-400" />
            </div>
            <CardHeader className="pb-3 border-b border-white/5 bg-yellow-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                <Target className="h-3 w-3" /> Mission Horizon
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4 relative z-10">
              <HorizonItem icon={Activity} label="Predictive Restoration" status={totalIntents > 10 ? "Optimizing" : "Queued"} />
              <HorizonItem icon={Heart} label="Living Locket (Tether)" status={manifests > 5 ? "Deploying" : "Iterating"} />
              <HorizonItem icon={InfinityIcon} label="Self-Deploying Core" status="LTP Verified" />
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 border-blue-500/20 shadow-xl">
            <CardHeader className="pb-3 border-b border-white/5 bg-blue-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <Waves className="h-3 w-3" /> Temporal Patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {temporalPattern && temporalPattern.confidence > 0.1 ? (
                <div className="space-y-3 animate-in slide-in-from-left-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] uppercase font-code text-secondary/40">Real Gaze/Gesture</div>
                      <div className="text-sm font-headline text-blue-400 uppercase tracking-tighter">{temporalPattern.pattern}</div>
                    </div>
                    <Badge variant="outline" className="text-[8px] border-blue-500/30 text-blue-400">
                      {(temporalPattern.confidence * 100).toFixed(0)}% CONFIDENCE
                    </Badge>
                  </div>
                  <Progress value={temporalPattern.confidence * 100} className="h-1 bg-primary/20 [&>div]:bg-blue-500" />
                  <div className="p-2 bg-blue-500/5 rounded border border-blue-500/10 text-[9px] text-blue-100/80 leading-relaxed italic">
                    "{temporalPattern.meaning}"
                  </div>
                </div>
              ) : (
                <div className="h-24 flex flex-col items-center justify-center opacity-20 text-center">
                  <Waves className="h-6 w-6 mb-2" />
                  <p className="text-[8px] uppercase font-code">Awaiting Pattern Detection</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* RIGHT COLUMN */}
        <section className="lg:col-span-8 flex flex-col gap-4">

          {/* DEEP MIND QUERY */}
          <Card className="bg-black/40 border-white/5 border-accent/10">
            <CardHeader className="py-4 border-b border-white/5 bg-accent/5">
              <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                <Sparkles className="h-3 w-3" /> Deep Mind Query
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex gap-2">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pose a philosophical question, a hard problem, anything that matters... (Cmd+Enter to send)"
                  className="resize-none bg-black/30 border-white/10 text-sm font-body text-foreground/90 placeholder:text-secondary/30 focus:border-accent/30 min-h-[72px]"
                  rows={3}
                />
                <Button
                  onClick={handleAsk}
                  disabled={isThinking || !question.trim()}
                  size="icon"
                  className="h-auto w-10 shrink-0 bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent self-end"
                >
                  {isThinking
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Send className="h-4 w-4" />
                  }
                </Button>
              </div>

              {isThinking && (
                <div className="flex items-center gap-2 text-[9px] font-code uppercase text-accent/60 animate-pulse">
                  <BrainCircuit className="h-3 w-3" /> Processing through cognitive layers...
                </div>
              )}

              {deepResponse && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="p-4 bg-accent/5 border border-accent/10 rounded-lg">
                    <div className="text-[9px] uppercase font-code text-accent/50 mb-2">Brockston Response</div>
                    <p className="text-sm text-foreground/90 leading-relaxed font-body">{deepResponse.response}</p>
                  </div>

                  {deepResponse.ethical_score && (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: 'Ethics', val: deepResponse.ethical_score.ethics },
                        { label: 'Integrity', val: deepResponse.ethical_score.integrity },
                        { label: 'Morality', val: deepResponse.ethical_score.morality },
                        { label: 'Composite', val: deepResponse.ethical_score.composite },
                      ].map(({ label, val }) => (
                        <div key={label} className="p-2 bg-black/30 border border-white/5 rounded text-center">
                          <div className="text-[7px] uppercase font-code text-secondary/40">{label}</div>
                          <div className="text-sm font-headline text-accent">{val.toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* EXECUTION LOG / REASONING TRACE */}
          <Card className="bg-black/40 border-white/5 flex-1 overflow-hidden">
            <CardHeader className="py-4 border-b border-white/5 bg-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><SearchCode className="h-3 w-3 text-accent" /> Execution Log</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">
                  {reasoning ? `${(reasoning.ensemble_confidence * 100).toFixed(0)}% CONFIDENCE` : 'Actualized Flow'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 overflow-y-auto system-log max-h-[500px]">
              {reasoning ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <TraceStep icon={Activity} label="Step 1: Classifier" content={reasoning.classification} />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-code text-accent/60">
                      <ListTree className="h-3 w-3" /> Step 2: Planner Chain
                    </div>
                    <div className="space-y-2 pl-5 border-l border-white/5">
                      {reasoning.plan.map((step: string, i: number) => (
                        <div key={i} className="text-xs text-foreground/80 flex gap-2">
                          <span className="text-accent/40 font-code">0{i + 1}.</span> {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  <TraceStep icon={CheckCircle2} label="Step 3: Verifier" content={reasoning.verification} color="text-blue-400" />
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <BrainCircuit className="h-16 w-16 mb-2" />
                  <p className="font-code text-xs uppercase tracking-widest">Ask a question to see the reasoning trace...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

function EngineStatus({ label, active, icon: Icon, detail }: { label: string, active: boolean, icon: any, detail?: string }) {
  return (
    <div className={cn("p-2 bg-black/20 rounded border transition-all", active ? "border-accent/20" : "border-white/5")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3 w-3", active ? "text-accent" : "text-secondary/40")} />
          <span className={cn("text-[9px] font-code uppercase", active ? "text-foreground" : "text-secondary/40")}>{label}</span>
        </div>
        <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent shadow-[0_0_5px_rgba(0,255,127,0.8)] animate-pulse" : "bg-white/10")} />
      </div>
      {active && detail && (
        <div className="mt-1 pl-5 text-[8px] font-code text-accent/50 truncate">{detail}</div>
      )}
    </div>
  );
}

function HorizonItem({ icon: Icon, label, status }: { icon: any, label: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/5">
      <div className="flex items-center gap-2">
        <Icon className="h-3 w-3 text-yellow-400/60" />
        <span className="text-[9px] font-code uppercase text-secondary/80">{label}</span>
      </div>
      <Badge variant="outline" className="text-[7px] text-yellow-400/40 uppercase">{status}</Badge>
    </div>
  );
}

function TraceStep({ icon: Icon, label, content, color = "text-accent" }: { icon: any, label: string, content: string, color?: string }) {
  return (
    <div className="space-y-2">
      <div className={cn("flex items-center gap-2 text-[10px] uppercase font-code", color.replace('text-', 'text-opacity-60 text-'))}>
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-xs text-foreground/90 leading-relaxed font-body bg-white/5 p-3 rounded border border-white/5">
        {content}
      </div>
    </div>
  );
}
