
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import { Activity } from 'lucide-react';

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
  const [isMounted, setIsMounted] = useState(false);

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

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
          <Activity className="h-4 w-4 text-accent" />
          Adaptive Engine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full">
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
              <Area 
                type="monotone" 
                dataKey="confidence" 
                stroke="hsl(var(--chart-1))" 
                fill="transparent" 
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-center">
            <div className="text-[10px] text-secondary uppercase font-code">Neuro-Learning</div>
            <div className="text-lg font-headline text-accent">98.2%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-secondary uppercase font-code">Latency</div>
            <div className="text-lg font-headline text-accent">14ms</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-secondary uppercase font-code">Knowledge Shards</div>
            <div className="text-lg font-headline text-accent">12.4k</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
