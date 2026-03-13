
"use client";

import React, { useMemo, useEffect, useState } from 'react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Zap, Search, ShieldAlert, Cpu, Sparkles, Activity, Heart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { BehavioralInterpreter, EmotionalState, BehaviorObservation } from '@/lib/behavioral-interpreter';

export const CortexMonitor: React.FC = () => {
  const db = useFirestore();
  const [behavioralState, setBehavioralState] = useState<EmotionalState>({
    valence: 0, arousal: 0.5, dominance: 0.5, frustration: 0, satisfaction: 0, uncertainty: 0.5, attention: 0.5
  });

  const insightsQuery = useMemo(() => query(
    collection(db, 'proactive_insights'),
    orderBy('timestamp', 'desc'),
    limit(5)
  ), [db]);

  const behaviorQuery = useMemo(() => query(
    collection(db, 'behavioral_history'),
    orderBy('timestamp', 'desc'),
    limit(20)
  ), [db]);

  const { data: insights } = useCollection<any>(insightsQuery);
  const { data: behaviorHistory } = useCollection<any>(behaviorQuery);

  useEffect(() => {
    if (behaviorHistory && behaviorHistory.length > 0) {
      // Process history to get current state (simplified cumulative logic)
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
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
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
                <ShieldAlert className="h-3 w-3" /> Behavioral Need Prediction
              </div>
              <div className="p-3 bg-accent/10 rounded border border-accent/20 text-center">
                <div className="text-[9px] uppercase font-code text-accent/60 mb-1">Predicted Current Need</div>
                <div className="text-sm font-headline text-accent uppercase tracking-tighter">
                  {BehavioralInterpreter.predictNeeds(behavioralState).replace('_', ' ')}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Behavioral Mesh & Patterns */}
        <section className="lg:col-span-8 flex flex-col gap-4 min-h-0">
          <Card className="bg-black/40 border-white/5 flex-1">
            <CardHeader className="py-4 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity className="h-3 w-3 text-accent" /> Social-Cognitive Mesh</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">Behavioral Diagnostics</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-code text-secondary/60 mb-2">Emotional Dimensions</h4>
                <MeshMetric label="Attention" value={behavioralState.attention} />
                <MeshMetric label="Satisfaction" value={behavioralState.satisfaction} />
                <MeshMetric label="Frustration" value={behavioralState.frustration} color="bg-red-500" />
                <MeshMetric label="Uncertainty" value={behavioralState.uncertainty} color="bg-yellow-500" />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase font-code text-secondary/60 mb-2">Detected Patterns</h4>
                <div className="space-y-2">
                  {detectedPatterns.map((p, i) => (
                    <div key={i} className="p-2 bg-primary/20 rounded border border-white/5 text-[10px] animate-in slide-in-from-right-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-accent uppercase">{p.id.replace('_', ' ')}</span>
                        <span className="text-secondary/40">{(p.confidence * 100).toFixed(0)}% Conf</span>
                      </div>
                      <div className="text-secondary/80 italic">"{p.interpretation}"</div>
                    </div>
                  ))}
                  {detectedPatterns.length === 0 && (
                    <div className="h-24 flex items-center justify-center opacity-20 text-[10px] uppercase tracking-widest">
                      No significant patterns detected
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/5 flex-none">
             <CardHeader className="py-2 px-4 border-b border-white/5">
                <div className="text-[9px] uppercase font-code text-secondary/40 flex items-center gap-2">
                  <User className="h-3 w-3" /> Recent Behavior Logs
                </div>
             </CardHeader>
             <CardContent className="p-2 h-32 overflow-y-auto system-log">
                {behaviorHistory?.map((obs, i) => (
                  <div key={i} className="text-[9px] font-code py-1 flex items-center justify-between border-b border-white/5 last:border-0">
                    <span className="text-secondary/60">[{new Date(obs.timestamp).toLocaleTimeString()}]</span>
                    <span className="text-accent/80 uppercase">{obs.type}</span>
                    <span className="text-secondary/40">Int: {obs.intensity.toFixed(2)}</span>
                  </div>
                ))}
             </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

function MeshMetric({ label, value, color = "bg-accent" }: { label: string, value: number, color?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-code uppercase">
        <span className="text-secondary/60">{label}</span>
        <span className="text-foreground">{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500", color)} 
          style={{ width: `${value * 100}%` }} 
        />
      </div>
    </div>
  );
}
