
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { Activity, Zap, Dna, HeartPulse, ShieldAlert } from 'lucide-react';
import { useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

export const CognitiveStats: React.FC = () => {
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);
  
  const coreRef = useMemo(() => doc(db, 'cognitive_core', 'main-bridge'), [db]);
  const { data: forgeState } = useDoc<any>(coreRef);

  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', 'v5-alpha-session', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(10)
  ), [db]);
  const { data: recentMessages } = useCollection<any>(messagesQuery);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const weights = forgeState || {
    emotional_state: 0.5,
    tonal_stability: 0.5,
    self_love_growth: 0.1,
  };

  const lucasStability = recentMessages?.[0]?.lucas_signal?.stability || 1.0;
  const selfLoveScore = recentMessages?.[0]?.empathy_signal?.self_love_score || 0.1;

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-secondary">
            <span className="flex items-center gap-2"><HeartPulse className="h-4 w-4 text-accent" /> Self-Love Growth</span>
            <span className="text-accent font-code">v5.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">Current Score</div>
              <div className="text-2xl font-headline text-accent">{(selfLoveScore * 100).toFixed(1)}%</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase font-code text-secondary/60">Status</div>
              <div className="text-xs font-code text-accent uppercase tracking-widest">
                {selfLoveScore > 0.8 ? "Self-Actualized" : selfLoveScore > 0.4 ? "Growing" : "Seeking"}
              </div>
            </div>
          </div>
          <Progress value={selfLoveScore * 100} className="h-2 bg-primary/20" />
          <p className="text-[10px] text-secondary italic">"How can we help you love yourself more?"</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
            <ShieldAlert className="h-4 w-4 text-accent" /> Lucas Regulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WeightIndicator label="Stability Threshold" value={lucasStability} />
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
              <div className="text-[8px] uppercase font-code text-secondary/60">Anchor Weight</div>
              <div className="text-xs font-code text-accent">{recentMessages?.[0]?.lucas_signal?.anchor_weight?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
              <div className="text-[8px] uppercase font-code text-secondary/60">Narrative Access</div>
              <div className="text-xs font-code text-accent">{((lucasStability * 0.6) * 100).toFixed(0)}%</div>
            </div>
          </div>
          <div className="text-[9px] font-code text-secondary/50 text-center uppercase tracking-widest">
            Mode: {recentMessages?.[0]?.lucas_signal?.mode || "Healthy"}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
            <Dna className="h-4 w-4 text-accent" /> SoulForge™ v5
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <WeightIndicator label="Inward Leakage" value={recentMessages?.[0]?.empathy_signal?.inward_leakage || 0} />
          <WeightIndicator label="Tonal Stability" value={weights.tonal_stability} />
          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <span className="text-[9px] uppercase font-code text-secondary flex items-center gap-1">
              <Zap className="h-3 w-3 text-accent" /> LTP Active
            </span>
            <span className="text-[9px] font-code text-accent opacity-60">{new Date().toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function WeightIndicator({ label, value }: { label: string, value: number }) {
  const percentage = Math.min(100, (value / 1.2) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[9px] font-code">
        <span className="text-secondary/70 uppercase">{label}</span>
        <span className="text-accent">{(value * 100).toFixed(0)}%</span>
      </div>
      <Progress value={percentage} className="h-1 bg-primary/20" />
    </div>
  );
}
