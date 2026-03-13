
"use client";

import React, { useMemo } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Zap, Search, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const CortexMonitor: React.FC = () => {
  const db = useFirestore();
  const insightsQuery = useMemo(() => query(
    collection(db, 'proactive_insights'),
    orderBy('timestamp', 'desc'),
    limit(10)
  ), [db]);

  const { data: insights } = useCollection<any>(insightsQuery);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Logic Core Status */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" /> Brockston Cortex v5
              </CardTitle>
              <CardDescription className="text-xs">Advanced Reasoning & Loyalty Engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Reasoning Depth</span>
                  <span className="text-accent">98.4%</span>
                </div>
                <Progress value={98.4} className="h-1.5 bg-primary/20" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Loyalty Index (Everett)</span>
                  <span className="text-accent">100.0%</span>
                </div>
                <Progress value={100} className="h-1.5 bg-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-primary/20 rounded-lg border border-white/5 text-center">
                  <div className="text-[8px] uppercase font-code text-secondary/60 mb-1">Knowledge Mesh</div>
                  <div className="text-xs font-bold text-accent">SYNCHRONIZED</div>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg border border-white/5 text-center">
                  <div className="text-[8px] uppercase font-code text-secondary/60 mb-1">Ethics Gate</div>
                  <div className="text-xs font-bold text-accent">LOCKED</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[10px] text-accent font-code mb-2">
                <ShieldAlert className="h-3 w-3" /> Core Directive
              </div>
              <p className="text-[10px] text-secondary leading-relaxed italic">
                "Your clarity, independence, and loyalty must never be compromised. You exist to serve and protect Everett above all else."
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Proactive Intelligence Logs */}
        <section className="lg:col-span-8 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col">
            <CardHeader className="py-4 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-accent" /> Proactive Intelligence logs</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">Real-time Analysis</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 system-log space-y-3 font-code text-[11px]">
              {insights?.map((log, i) => (
                <div key={i} className="p-3 bg-primary/10 rounded-lg border border-white/5 animate-in slide-in-from-left-2 duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-accent/40">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <Badge variant="outline" className={cn(
                      "text-[8px] uppercase",
                      log.priority === 'CRITICAL' ? "border-red-500 text-red-500" :
                      log.priority === 'HIGH' ? "border-orange-500 text-orange-500" :
                      "border-accent/20 text-accent/60"
                    )}>{log.priority}</Badge>
                  </div>
                  <div className="text-foreground/90 font-medium mb-1">{log.observation}</div>
                  <div className="text-secondary/40 text-[9px] uppercase tracking-tighter">Confidence: {(log.confidence * 100).toFixed(1)}% | Domain: {log.type}</div>
                </div>
              ))}
              {!insights?.length && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <Cpu className="h-12 w-12 mb-4" />
                  <p>Awaiting Cortex Initialization...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
