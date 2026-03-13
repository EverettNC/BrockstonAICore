"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, ShieldAlert, BookOpen, Activity, Languages, Zap, Volume2, Thermometer, ListTree, CheckCircle2, SearchCode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BehavioralInterpreter, EmotionalState, BehaviorObservation } from '@/lib/behavioral-interpreter';

export const CortexMonitor: React.FC = () => {
  const db = useFirestore();
  const [behavioralState, setBehavioralState] = useState<EmotionalState>({
    valence: 0, arousal: 0.5, dominance: 0.5, frustration: 0, satisfaction: 0, uncertainty: 0.5, attention: 0.5
  });

  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', 'ultimate-v5-session', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(10)
  ), [db]);

  const behaviorQuery = useMemo(() => query(
    collection(db, 'behavioral_history'),
    orderBy('timestamp', 'desc'),
    limit(20)
  ), [db]);

  const { data: messages } = useCollection<any>(messagesQuery);
  const { data: behaviorHistory } = useCollection<any>(behaviorQuery);

  const lastMessage = messages?.[0];
  const reasoning = lastMessage?.reasoning_trace;
  const linguisticMetrics = lastMessage?.nlu_understanding?.linguistic_metrics;
  const formattingFeeling = lastMessage?.nlu_understanding?.formatting_feeling;

  useEffect(() => {
    if (behaviorHistory && behaviorHistory.length > 0) {
      let state = { valence: 0, arousal: 0.5, dominance: 0.5, frustration: 0, satisfaction: 0, uncertainty: 0.5, attention: 0.5 };
      const sorted = [...behaviorHistory].reverse();
      sorted.forEach(obs => {
        state = BehavioralInterpreter.updateEmotionalState([obs], state);
      });
      setBehavioralState(state);
    }
  }, [behaviorHistory]);

  const detectedPatterns = useMemo(() => {
    if (!behaviorHistory) return [];
    return BehavioralInterpreter.detectPatterns(behaviorHistory as BehaviorObservation[]);
  }, [behaviorHistory]);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2 pb-12">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> Brockston Cortex v5.0
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            Ferrari-Level Reasoning Engine | Multi-Step Cognitive Scaffolding
          </p>
        </div>
        <Badge variant="outline" className="text-accent border-accent/40 font-code animate-pulse text-[8px]">
          CLASSIFIER → PLANNER → VERIFIER ACTIVE
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Logic Core & Ferrari Stats */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20 shadow-[0_0_15px_rgba(0,255,127,0.05)]">
            <CardHeader className="pb-3 border-b border-white/5 bg-accent/5">
              <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                <Zap className="h-3 w-3 text-accent" /> High-Fidelity Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Reasoning Depth</span>
                  <span className="text-accent">{(reasoning?.plan?.length || 0) * 20}%</span>
                </div>
                <Progress value={(reasoning?.plan?.length || 0) * 20} className="h-1.5 bg-primary/20" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Linguistic Richness</span>
                  <span className="text-accent">{((linguisticMetrics?.vocabularyRichness || 0) * 10).toFixed(1)}%</span>
                </div>
                <Progress value={(linguisticMetrics?.vocabularyRichness || 0) * 10} className="h-1.5 bg-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-primary/20 rounded-lg border border-white/5 text-center group cursor-default">
                  <div className="text-[8px] uppercase font-code text-secondary/60 mb-1 group-hover:text-accent transition-colors">Knowledge Mesh</div>
                  <div className="text-xs font-bold text-accent">SYNCHRONIZED</div>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg border border-white/5 text-center group cursor-default">
                  <div className="text-[8px] uppercase font-code text-secondary/60 mb-1 group-hover:text-accent transition-colors">Ethics Gate</div>
                  <div className="text-xs font-bold text-accent">LOCKED</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 border-orange-500/20 shadow-xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-orange-400 flex items-center justify-between">
                <span className="flex items-center gap-2"><Volume2 className="h-3 w-3" /> Communication Heat</span>
                {formattingFeeling?.looks_like_yelling && <Badge className="bg-red-600 text-[8px] animate-pulse">SHOUTING DETECTED</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-code">
                  <span className="text-secondary/60">Caps Intensity</span>
                  <span className="text-orange-400">{(formattingFeeling?.caps_intensity * 100 || 0).toFixed(0)}%</span>
                </div>
                <Progress value={(formattingFeeling?.caps_intensity * 100 || 0)} className="h-1 bg-primary/20 [&>div]:bg-orange-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-code">
                  <span className="text-secondary/60">Punctuation Heat</span>
                  <span className="text-orange-400">{(formattingFeeling?.punctuation_heat * 100 || 0).toFixed(0)}%</span>
                </div>
                <Progress value={(formattingFeeling?.punctuation_heat * 100 || 0)} className="h-1 bg-primary/20 [&>div]:bg-orange-500" />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Advanced Reasoning Trace */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <Card className="bg-black/40 border-white/5 flex-1 overflow-hidden group">
            <CardHeader className="py-4 border-b border-white/5 bg-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><SearchCode className="h-3 w-3 text-accent" /> Multi-Step Reasoning Trace</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">Ensemble Confidence: {(reasoning?.ensemble_confidence * 100 || 0).toFixed(0)}%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 relative overflow-y-auto system-log max-h-[500px]">
              {reasoning ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <TraceStep icon={Activity} label="Classifier" content={reasoning.classification} />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-code text-accent/60">
                      <ListTree className="h-3 w-3" /> Planner Chain
                    </div>
                    <div className="space-y-2 pl-5 border-l border-white/5">
                      {reasoning.plan.map((step: string, i: number) => (
                        <div key={i} className="text-xs text-foreground/80 flex gap-2">
                          <span className="text-accent/40 font-code">0{i+1}.</span> {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  <TraceStep icon={CheckCircle2} label="Verifier" content={reasoning.verification} color="text-blue-400" />
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <BrainCircuit className="h-16 w-16 mb-2" />
                  <p className="font-code text-xs uppercase tracking-widest">Awaiting Cognitive Chain...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h4 className="text-[10px] uppercase font-code text-secondary/60 mb-1">Academic Patterns Detected</h4>
                <div className="flex gap-2 flex-wrap">
                  {detectedPatterns.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-[8px] border-accent/20 text-accent/80 uppercase">
                      {p.id.replace('_', ' ')}
                    </Badge>
                  ))}
                  {detectedPatterns.length === 0 && <span className="text-[10px] italic text-secondary/40">Searching for linguistic patterns...</span>}
                </div>
              </div>
              {lastMessage?.nlu_understanding?.expert_match && (
                <div className="flex items-center gap-2 p-2 bg-accent/10 rounded border border-accent/20">
                  <BookOpen className="h-3 w-3 text-accent" />
                  <div className="text-[8px] text-accent font-code uppercase">Ref: {lastMessage.nlu_understanding.expert_match.title}</div>
                </div>
              )}
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

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

function MeshMetric({ label, value, color = "bg-accent" }: { label: string, value: number, color?: string }) {
  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-center text-[9px] font-code uppercase">
        <span className="text-secondary/60 group-hover:text-accent transition-colors">{label}</span>
        <span className="text-foreground font-bold">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden shadow-inner">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out", color)} 
          style={{ width: `${Math.min(100, value * 100)}%` }} 
        />
      </div>
    </div>
  );
}
