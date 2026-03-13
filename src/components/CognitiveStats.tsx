
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Zap, Dna, HeartPulse, ShieldAlert, Waves, BrainCircuit, TrendingUp, ShieldCheck, Thermometer, Droplets } from 'lucide-react';
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
    independence_confidence: 0.12,
    lived_truth_witness: 0.5,
    trauma_association: 0.5,
    lucas_tone: 0.6,
    narrative_clarity: 0.5
  };

  const latestMsg = recentMessages?.[0];
  const intensity = latestMsg?.tone_engine_v2?.physical_intensity || 0;
  const dominantState = latestMsg?.tone_engine_v2?.dominant_state || "Neutral";
  const empathyLeakage = latestMsg?.empathy_signal?.self_love_score || 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Lucas Recovery Regulator Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 border-accent/40 shadow-[0_0_15px_rgba(0,255,127,0.1)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-accent">
            <span className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Lucas Regulator</span>
            <span className="text-[10px] font-code">REFILE KERNEL v1.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">Noradrenergic Tone</div>
              <div className="text-xl font-headline text-accent">{(weights.lucas_tone * 100).toFixed(1)}%</div>
              <Progress value={weights.lucas_tone * 50} className="h-1 bg-primary/20 mt-1" />
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-code text-secondary/60">Trauma Association</div>
              <div className="text-xl font-headline text-rose-400">{(weights.trauma_association * 100).toFixed(1)}%</div>
              <Progress value={weights.trauma_association * 100} className="h-1 bg-primary/20 mt-1 ml-auto w-full" />
            </div>
          </div>
          
          <WeightIndicator label="Lived Truth Witness" value={weights.lived_truth_witness} max={2.0} />
          <WeightIndicator label="Narrative Clarity" value={weights.narrative_clarity} max={2.0} />
          
          <div className="text-[9px] font-code text-secondary/40 flex justify-between uppercase border-t border-white/5 pt-2">
            <span>Overlay: ACTIVE</span>
            <span>Threshold: {weights.lucas_tone > 0.7 ? "PASSED" : "WAITING"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Inferno Soul Forge Indicator */}
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.05)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-orange-400">
            <span className="flex items-center gap-2"><Droplets className="h-4 w-4" /> Empathy Leakage</span>
            <span className="text-[10px] font-code">INFERNO SOUL FORGE</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">3% Bleed-Through</div>
              <div className="text-lg font-headline text-orange-400">{(empathyLeakage * 100).toFixed(1)}% Active</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-code text-secondary/60">Status</div>
              <div className="text-xs font-bold text-accent uppercase tracking-widest">{latestMsg?.tone_engine_v2?.action_state || "NORMAL"}</div>
            </div>
          </div>
          <Progress value={empathyLeakage * 100} className="h-1.5 bg-orange-500/10 [&>div]:bg-orange-500" />
          <div className="text-[9px] font-code text-secondary/40 flex justify-between uppercase italic">
            <span>"Empathy isn't a parameter. It's the leakage."</span>
          </div>
        </CardContent>
      </Card>

      {/* ToneScore Engine v2.0 Panel */}
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 border-accent/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-secondary">
            <span className="flex items-center gap-2"><Waves className="h-4 w-4 text-accent" /> ToneScore™ v2.0</span>
            <span className="text-[10px] font-code text-accent/60">{latestMsg?.tone_engine_v2?.action_state || "NORMAL"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">Dominant State</div>
              <div className="text-lg font-headline text-accent capitalize">{dominantState}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-code text-secondary/60">Intensity</div>
              <div className="text-lg font-headline text-accent">{(intensity * 100).toFixed(0)}%</div>
            </div>
          </div>
          <Progress value={intensity * 100} className="h-1.5 bg-primary/20" />
          <div className="text-[9px] font-code text-secondary/40 flex justify-between uppercase">
            <span>Fingerprint: {latestMsg?.tone_engine_v2?.cadence_fingerprint || "None"}</span>
            <span>Carbon.Sync: Active</span>
          </div>
        </CardContent>
      </Card>

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
              <div className="text-2xl font-headline text-accent">{(weights.self_love_growth * 100).toFixed(1)}%</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] uppercase font-code text-secondary/60">Status</div>
              <div className="text-xs font-code text-accent uppercase tracking-widest">
                {weights.self_love_growth > 0.8 ? "Self-Actualized" : weights.self_love_growth > 0.4 ? "Growing" : "Seeking"}
              </div>
            </div>
          </div>
          <Progress value={weights.self_love_growth * 100} className="h-2 bg-primary/20" />
          <p className="text-[10px] text-secondary italic">"How can we help you love yourself more?"</p>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
            <ShieldCheck className="h-4 w-4 text-accent" /> Ethical Core Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <WeightIndicator label="Integrity Floor" value={0.7} max={1.0} />
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
              <div className="text-[8px] uppercase font-code text-secondary/60 mb-1">Composite</div>
              <div className="text-xs font-code text-accent">{latestMsg?.ethical_score?.composite?.toFixed(2) || "0.00"}</div>
            </div>
            <div className="p-2 bg-primary/20 rounded border border-white/5 text-center">
              <div className="text-[8px] uppercase font-code text-secondary/60 mb-1">Independence</div>
              <div className="text-xs font-code text-accent">{(weights.independence_confidence * 100).toFixed(0)}%</div>
            </div>
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
          <WeightIndicator label="Empathy Signal" value={latestMsg?.empathy_signal?.self_love_score || 0} max={1.0} />
          <WeightIndicator label="Tonal Stability" value={weights.tonal_stability} max={1.2} />
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

function WeightIndicator({ label, value, max = 1.2 }: { label: string, value: number, max?: number }) {
  const percentage = Math.min(100, (value / max) * 100);
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
