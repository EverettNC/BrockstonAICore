
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { Activity, Zap, Dna } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

const data = [
  { time: '0s', value: 45, confidence: 70 },
  { time: '2s', value: 52, confidence: 75 },
  { time: '4s', value: 48, confidence: 82 },
  { time: '6s', value: 61, confidence: 80 },
  { time: '8s', value: 55, confidence: 88 },
  { time: '10s', value: 67, confidence: 91 },
  { time: '12s', value: 72, confidence: 94 },
];

export const CognitiveStats: React.FC = () => {
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);
  
  const coreRef = useMemo(() => doc(db, 'cognitive_core', 'main-bridge'), [db]);
  const { data: forgeState } = useDoc<any>(coreRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 h-[320px] flex items-center justify-center">
        <span className="text-xs font-code text-secondary animate-pulse">Initializing Adaptive Engine...</span>
      </Card>
    );
  }

  const weights = forgeState || {
    emotional_state: 0.5,
    tonal_stability: 0.5,
    speech_cadence: 0.5,
    respiratory_pattern: 0.5
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
            <Activity className="h-4 w-4 text-accent" />
            Adaptive Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[140px] w-full">
            <ChartContainer config={{
              value: { label: "Reasoning Intensity", color: "hsl(var(--accent))" },
              confidence: { label: "Model Confidence", color: "hsl(var(--chart-1))" }
            }}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--accent))" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
          <div className="flex justify-between mt-4">
            <div className="text-center">
              <div className="text-[9px] text-secondary uppercase font-code">Neuro-Learning</div>
              <div className="text-base font-headline text-accent">98.2%</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] text-secondary uppercase font-code">Latency</div>
              <div className="text-base font-headline text-accent">14ms</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
            <Dna className="h-4 w-4 text-accent" />
            SoulForge™ Bridge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WeightIndicator label="Emotional State" value={weights.emotional_state} />
          <WeightIndicator label="Tonal Stability" value={weights.tonal_stability} />
          <WeightIndicator label="Speech Cadence" value={weights.speech_cadence} />
          
          <div className="pt-2 flex items-center justify-between border-t border-white/5">
            <span className="text-[10px] uppercase font-code text-secondary flex items-center gap-1">
              <Zap className="h-3 w-3 text-accent" /> LTP Threshold
            </span>
            <span className="text-[10px] font-code text-accent">Active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function WeightIndicator({ label, value }: { label: string, value: number }) {
  const percentage = (value / 1.2) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-code">
        <span className="text-secondary/70">{label}</span>
        <span className="text-accent">{(value * 100).toFixed(0)}u</span>
      </div>
      <Progress value={percentage} className="h-1 bg-primary/20" />
    </div>
  );
}
