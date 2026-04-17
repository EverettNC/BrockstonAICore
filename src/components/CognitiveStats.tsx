'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  HeartPulse, 
  Zap, 
  Dna, 
  Thermometer, 
  Droplets, 
  Waves, 
  ShieldCheck, 
  Activity, 
  BrainCircuit, 
  ShieldAlert, 
  Sparkles,
  Infinity,
  GitBranch,
  Target,
  Scale,
  Eye
} from 'lucide-react';


import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const CognitiveStats: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [forgeState, setForgeState] = useState<any>(null);
  const [topologyState, setTopologyState] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    try {
      const weights = localStorage.getItem('brockston:cognitive:weights');
      if (weights) setForgeState(JSON.parse(weights));
      const topo = localStorage.getItem('brockston:topology:stats');
      if (topo) setTopologyState(JSON.parse(topo));
      const msgs = localStorage.getItem('brockston:chat:messages');
      if (msgs) setRecentMessages(JSON.parse(msgs));
    } catch {}
  }, []);

  if (!isMounted) return null;

  const weights = forgeState || {
    emotional_state: 0,
    tonal_stability: 0,
    speech_cadence: 0,
    respiratory_pattern: 0,
    lived_truth_witness: 0,
    trauma_association: 0,
    lucas_tone: 0,
    narrative_clarity: 0
  };

  const topology = topologyState || {
    proximity_integral: 0,
    last_resonance: 0,
    last_empathy_math: 0,
    bond_status: "Pending Connection..."
  };

  const latestMsg = recentMessages?.[0];
  const intensity = latestMsg?.tone_engine_v2?.physical_intensity || 0;
  const vortexConfidence = latestMsg?.vortex_data?.confidence || 0;
  const ethicsScore = latestMsg?.ethical_score?.composite || 0;
  const eruptor = latestMsg?.nlu_understanding?.eruptor_metrics || { stress_level: 0, coherence_score: 0, grounding_score: 0 };

  return (
    <div className="flex flex-col gap-6">
      {/* Integrity & Ethics Panel */}
      <Card className="bg-card/50 backdrop-blur-sm border-accent/40 shadow-[0_0_30px_rgba(0,255,127,0.1)] transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-accent">
            <span className="flex items-center gap-2"><Scale className="h-4 w-4" /> Integrity Gate</span>
            <span className="text-[10px] font-code text-accent/60">CSS AXIOM v1.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">Composite Score</div>
              <div className="text-3xl font-headline text-accent">
                {ethicsScore.toFixed(1)} <span className="text-xs text-secondary/40">/ 10.0</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-code text-secondary/60">Status</div>
              <div className="text-xs font-bold text-accent uppercase tracking-widest animate-pulse">
                {ethicsScore >= 7 ? "PASSED" : "HOLDING"}
              </div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-accent/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${ethicsScore * 10}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8px] font-code uppercase text-secondary/40">
            <div className="flex justify-between border-r border-white/5 pr-2">
              <span>Morality</span>
              <span className="text-accent">{latestMsg?.ethical_score?.morality || 0}</span>
            </div>
            <div className="flex justify-between pl-2">
              <span>Integrity</span>
              <span className="text-accent">{latestMsg?.ethical_score?.integrity || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relational Topology Panel */}
      <Card className="bg-card/50 backdrop-blur-sm border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-blue-400">
            <span className="flex items-center gap-2"><Infinity className="h-4 w-4 animate-pulse" /> Relational Topology</span>
            <span className="text-[10px] font-code text-blue-400/60">{topology.bond_status}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">Proximity Integral</div>
              <div className="text-2xl font-headline text-blue-400">
                {topology.proximity_integral.toFixed(4)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-code text-secondary/60">Resonance &times; Empathy</div>
              <div className="text-xs font-bold text-accent uppercase tracking-widest">
                +{(topology.last_resonance * topology.last_empathy_math).toFixed(4)}
              </div>
            </div>
          </div>
          
          <div className="h-8 w-full bg-blue-500/5 rounded border border-blue-500/10 relative overflow-hidden">
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <svg viewBox="0 0 100 20" className="w-full h-full text-blue-400">
                   <path d="M0,10 Q10,0 20,10 T40,10 T60,10 T80,10 T100,10" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
                </svg>
             </div>
          </div>

          <div className="text-[9px] font-code text-secondary/40 flex justify-between uppercase italic">
            <span>Integral Domain: Carbon-Silicon</span>
            <span>dt: Interaction</span>
          </div>
        </CardContent>
      </Card>

      {/* Lucas Recovery Regulator Card */}
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)] transition-all hover:border-emerald-500/60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-emerald-400">
            <span className="flex items-center gap-2"><Thermometer className="h-4 w-4" /> Lucas Regulator</span>
            <span className="text-[10px] font-code">LTP KERNEL v1.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <div className="text-[10px] uppercase font-code text-secondary/60 group-hover:text-emerald-400 transition-colors">Noradrenergic Tone</div>
              <div className="text-xl font-headline text-emerald-400">{(weights.lucas_tone * 100).toFixed(1)}%</div>
              <Progress value={weights.lucas_tone * 50} className="h-1 bg-primary/20 mt-1 [&>div]:bg-emerald-500" />
            </div>
            <div className="text-right group">
              <div className="text-[10px] uppercase font-code text-secondary/60 group-hover:text-rose-400 transition-colors">Trauma Association</div>
              <div className="text-xl font-headline text-rose-400">{(weights.trauma_association * 100).toFixed(1)}%</div>
              <Progress value={weights.trauma_association * 100} className="h-1 bg-primary/20 mt-1 ml-auto w-full [&>div]:bg-rose-400" />
            </div>
          </div>
          <div className="text-[8px] font-code text-secondary/40 uppercase text-center border-t border-white/5 pt-2">
            Salience Regulation Active: {latestMsg?.lucas_signal?.mode || "STABLE"}
          </div>
        </CardContent>
      </Card>

      {/* Vortex Strength Panel */}
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 border-accent/20 shadow-[0_0_20px_rgba(0,255,127,0.15)] transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-accent">
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4 animate-spin-slow" /> Vortex Strength</span>
            <span className="text-[10px] font-code">REAL-TIME INTENTION</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[10px] uppercase font-code text-secondary/60">Manifestation Confidence</div>
              <div className="text-2xl font-headline text-accent">{(vortexConfidence * 100).toFixed(1)}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-code text-secondary/60">Status</div>
              <div className="text-xs font-bold text-accent uppercase tracking-widest">{latestMsg?.vortex_data?.intent_id ? "SYNCED" : "AWAITING"}</div>
            </div>
          </div>
          <Progress value={vortexConfidence * 100} className="h-2 bg-accent/10 [&>div]:bg-accent" />
        </CardContent>
      </Card>

      {/* SoulForge LTP Weight Panel */}
      <Card className="bg-card/50 backdrop-blur-sm border-white/5 transition-all">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-secondary">
            <span className="flex items-center gap-2"><Target className="h-4 w-4 text-accent" /> Biological Factors</span>
            <span className="text-[10px] font-code">LTP KERNEL v5.4</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <WeightIndicator label="Emotional State" value={weights.emotional_state} max={1.2} color="bg-accent" />
          <WeightIndicator label="Tonal Stability" value={weights.tonal_stability} max={1.2} color="bg-accent" />
          <WeightIndicator label="Speech Cadence" value={weights.speech_cadence} max={1.2} color="bg-accent" />
          <WeightIndicator label="Respiratory" value={weights.respiratory_pattern} max={1.2} color="bg-accent" />
        </CardContent>
      </Card>
    </div>
  );
};

function WeightIndicator({ label, value, max = 1.2, color = "bg-accent" }: { label: string, value: number, max?: number, color?: string }) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5 group">
      <div className="flex justify-between items-center text-[9px] font-code uppercase">
        <span className="text-secondary/70 group-hover:text-accent transition-colors">{label}</span>
        <span className={cn("font-bold", color.replace('bg-', 'text-'))}>{(value * 100).toFixed(0)}%</span>
      </div>
      <div className="h-1 w-full bg-primary/20 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out", color)} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}
