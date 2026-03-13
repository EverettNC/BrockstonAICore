"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, ShieldAlert, BookOpen, Activity, Languages, Zap, Volume2, Thermometer, ListTree, CheckCircle2, SearchCode, Cpu, Database, Eye, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { visionContext } from '@/lib/vision-context';

export const CortexMonitor: React.FC = () => {
  const db = useFirestore();
  
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', 'ultimate-v5-session', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(10)
  ), [db]);

  const { data: messages } = useCollection<any>(messagesQuery);

  const lastMessage = messages?.[0];
  const reasoning = lastMessage?.reasoning_trace;
  const engines = reasoning?.engines_active || ["CoreEngine"];
  
  const visionSnap = visionContext.snapshot();

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2 pb-12">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> Brockston Cortex v5.0
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            Wired Reasoning Engines | Multi-generational Orchestration
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-accent border-accent/40 font-code text-[8px]">
            KNOWLEDGE ENGINE: CONNECTED
          </Badge>
          <Badge variant="outline" className="text-accent border-accent/40 font-code text-[8px]">
            LOCAL REASONER: ACTIVE
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Wired Engines Status */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader className="pb-3 border-b border-white/5 bg-accent/5">
              <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center gap-2">
                <Cpu className="h-3 w-3" /> System Wiring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <EngineStatus label="Local Reasoning Engine" active={engines.includes('LocalReasoningEngine') || engines.includes('CoreEngine')} icon={BrainCircuit} />
              <EngineStatus label="Knowledge Engine" active={engines.includes('KnowledgeEngine')} icon={Database} />
              <EngineStatus label="Intervention Protocol" active={engines.includes('InterventionProtocol')} icon={ShieldAlert} />
              
              <div className="pt-4 border-t border-white/5">
                <div className="text-[10px] uppercase font-code text-secondary/60 mb-2">Cognitive Scaffolding</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-accent font-bold">CLASSIFIER</div>
                  </div>
                  <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-accent font-bold">PLANNER</div>
                  </div>
                  <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-accent font-bold">VERIFIER</div>
                  </div>
                  <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
                    <div className="text-[8px] text-accent font-bold">ENSEMBLE</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-white/5 border-blue-500/20 shadow-xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <Activity className="h-3 w-3" /> Higher Reasoning Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-code">
                  <span className="text-secondary/60">Reasoning Depth</span>
                  <span className="text-blue-400">{(reasoning?.plan?.length || 0) * 20}%</span>
                </div>
                <Progress value={(reasoning?.plan?.length || 0) * 20} className="h-1 bg-primary/20 [&>div]:bg-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] uppercase font-code">
                  <span className="text-secondary/60">Knowledge Mesh Sync</span>
                  <span className="text-blue-400">{engines.includes('KnowledgeEngine') ? '100%' : 'Baseline'}</span>
                </div>
                <Progress value={engines.includes('KnowledgeEngine') ? 100 : 20} className="h-1 bg-primary/20 [&>div]:bg-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* VISION CONTEXT MONITOR */}
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader className="pb-2 border-b border-white/5 bg-primary/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Eye className="h-3 w-3 text-accent" /> Recent Visual Events
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {visionSnap.events.map((ev, i) => (
                <div key={i} className="space-y-1 group animate-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex justify-between items-center text-[8px] font-code">
                    <span className="text-accent/60 uppercase">{ev.intent.split(':')[1] || 'PERCEPTION'}</span>
                    <span className="text-secondary/40">[{new Date(ev.timestamp).toLocaleTimeString()}]</span>
                  </div>
                  <div className="text-[10px] text-foreground/80 bg-black/20 p-2 rounded border border-white/5 truncate">
                    {ev.description}
                  </div>
                </div>
              ))}
              {visionSnap.count === 0 && (
                <div className="h-24 flex flex-col items-center justify-center opacity-20 text-center">
                  <History className="h-6 w-6 mb-2" />
                  <p className="text-[8px] uppercase font-code">Awaiting Perception</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Reasoning Documentation */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <Card className="bg-black/40 border-white/5 flex-1 overflow-hidden">
            <CardHeader className="py-4 border-b border-white/5 bg-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><SearchCode className="h-3 w-3 text-accent" /> Cognitive Execution Log</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">Wired: {engines.join(' + ')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 overflow-y-auto system-log max-h-[700px]">
              {reasoning ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <TraceStep icon={Activity} label="Step 1: Classifier" content={reasoning.classification} />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase font-code text-accent/60">
                      <ListTree className="h-3 w-3" /> Step 2: Wired Planner Chain
                    </div>
                    <div className="space-y-2 pl-5 border-l border-white/5">
                      {reasoning.plan.map((step: string, i: number) => (
                        <div key={i} className="text-xs text-foreground/80 flex gap-2">
                          <span className="text-accent/40 font-code">0{i+1}.</span> {step}
                        </div>
                      ))}
                    </div>
                  </div>
                  <TraceStep icon={CheckCircle2} label="Step 3: Verifier" content={reasoning.verification} color="text-blue-400" />
                  <div className="p-3 bg-accent/5 rounded border border-accent/20 text-[10px] font-code text-accent/80 italic text-center">
                    "Step 4: Ensemble Synthesis Result - Confidence {(reasoning.ensemble_confidence * 100).toFixed(0)}%"
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <BrainCircuit className="h-16 w-16 mb-2" />
                  <p className="font-code text-xs uppercase tracking-widest">Awaiting Engine Signal...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

function EngineStatus({ label, active, icon: Icon }: { label: string, active: boolean, icon: any }) {
  return (
    <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-3 w-3", active ? "text-accent" : "text-secondary/40")} />
        <span className={cn("text-[9px] font-code uppercase", active ? "text-foreground" : "text-secondary/40")}>{label}</span>
      </div>
      <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent shadow-[0_0_5px_rgba(0,255,127,0.8)]" : "bg-red-500/20")} />
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
