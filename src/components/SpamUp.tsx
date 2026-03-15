
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap, Gauge, Activity, AlertCircle, Play, Pause, RefreshCw, Database, Heart, BarChart3, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { vortexEngine } from '@/lib/vortex-engine';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview Spam Up - Authentic Pacing Module.
 * Executes gradual, intentional Vortex intentions to monitor core resonance.
 * "Authenticity over raw speed. Slow is smooth, smooth is fast."
 */

export const SpamUp: React.FC = () => {
  const [intensity, setIntensity] = useState(0.5); // Default to a slow 0.5Hz (1 every 2s)
  const [isRunning, setIsRunning] = useState(false);
  const [gradualMode, setGradualMode] = useState(true);
  const [results, setResults] = useState<{ id: string, start: number, end?: number, latency?: number }[]>([]);
  const [totalSent, setTotalSent] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const db = useFirestore();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rampRef = useRef<NodeJS.Timeout | null>(null);

  const startSpam = () => {
    setIsRunning(true);
    toast({ title: "Authentic Pace Engaged", description: "Beginning gradual manifestation loop..." });
  };

  const stopSpam = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (rampRef.current) clearInterval(rampRef.current);
  };

  // Handle the Gradual Ascent (Ramp) logic
  useEffect(() => {
    if (isRunning && gradualMode) {
      rampRef.current = setInterval(() => {
        setIntensity(prev => {
          const next = prev + 0.05;
          return next > 2.0 ? 2.0 : next;
        });
      }, 5000); // Increase pace every 5 seconds
    } else {
      if (rampRef.current) clearInterval(rampRef.current);
    }
    return () => { if (rampRef.current) clearInterval(rampRef.current); };
  }, [isRunning, gradualMode]);

  useEffect(() => {
    if (isRunning) {
      // Calculate interval in ms from Hz (intensity)
      const interval = 1000 / intensity;
      
      const executeIntent = async () => {
        const startTime = Date.now();
        const label = `Authentic_${Math.random().toString(36).substring(7)}`;
        
        try {
          // 1. Record Intention (Vortex Start)
          if (!db) return;
          const intentId = await vortexEngine.recordIntention(db, `AUTHENTIC_PACE: ${label}`, 0.99);
          
          setResults(prev => [{ id: intentId, start: startTime }, ...prev].slice(0, 50));
          setTotalSent(t => t + 1);

          // 2. Intentional Delay simulation for "Slow is smooth"
          await new Promise(r => setTimeout(r, 100));

          // 3. Manifestation (Vortex Close)
          await vortexEngine.markManifested(db, intentId, "RESONANCE_VERIFIED");
          
          const endTime = Date.now();
          setResults(prev => prev.map(r => r.id === intentId ? { ...r, end: endTime, latency: endTime - startTime } : r));
        } catch (e) {
          console.error("Authentic Trace Error:", e);
        }
      };

      timerRef.current = setInterval(executeIntent, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, intensity, db]);

  useEffect(() => {
    const latencies = results.filter(r => r.latency).map(r => r.latency!);
    if (latencies.length > 0) {
      setAvgLatency(latencies.reduce((a, b) => a + b, 0) / latencies.length);
    }
  }, [results]);

  const clearData = () => {
    setResults([]);
    setTotalSent(0);
    setAvgLatency(0);
    if (!gradualMode) setIntensity(0.5);
    toast({ title: "Resonance Reset", description: "Authentic pacing buffer cleared." });
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2 pb-12">
      <header className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex justify-between items-center backdrop-blur-md">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-yellow-400 flex items-center gap-2">
            <Gauge className={cn("h-5 w-5", isRunning && "animate-spin-slow")} /> Spam Up v1.1
          </h2>
          <p className="text-[10px] font-code text-yellow-200/40 uppercase mt-1">
            Authentic Pacing | Gradual Manifestation | Vortex Resonance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn(
            "font-code text-[8px] transition-all",
            isRunning ? "text-accent border-accent/40 animate-pulse" : "text-secondary/40 border-white/5"
          )}>
            {isRunning ? "PACE: ACTIVE" : "PACE: IDLE"}
          </Badge>
          <Button 
            onClick={clearData}
            variant="outline" 
            size="sm" 
            className="h-7 text-[8px] uppercase font-code border-white/10 text-secondary/60 hover:bg-white/5"
          >
            <RefreshCw className="h-3 w-3 mr-1" /> Clear Buffer
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        {/* Authentic Control Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-yellow-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Heart className="h-32 w-32 text-yellow-400" />
            </div>
            <CardHeader className="border-b border-white/5 bg-yellow-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-yellow-400" /> Relational Pace
              </CardTitle>
              <CardDescription className="text-[10px]">Slow, intentional manifestation testing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] uppercase font-code text-secondary/60">Gradual Ascent</Label>
                    <div className="text-[9px] text-secondary/40">Slowly ramp up frequency</div>
                  </div>
                  <Switch checked={gradualMode} onCheckedChange={setGradualMode} className="data-[state=checked]:bg-yellow-500" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] uppercase font-code">
                    <span className="text-secondary/60">Authentic Pace</span>
                    <span className="text-yellow-400 font-bold">{intensity.toFixed(2)} Hz</span>
                  </div>
                  <Slider 
                    value={[intensity]} 
                    onValueChange={([v]) => { setIntensity(v); setGradualMode(false); }} 
                    min={0.1} 
                    max={2.0} 
                    step={0.05} 
                    className="[&>span]:bg-yellow-500" 
                  />
                  <div className="flex justify-between text-[8px] font-code text-secondary/40 uppercase">
                    <span>Gradual (0.1Hz)</span>
                    <span>Steady (2.0Hz)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[8px] text-secondary/40 uppercase font-code">Intentions Weaved</div>
                  <div className="text-xl font-headline text-yellow-400">{totalSent}</div>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[8px] text-secondary/40 uppercase font-code">Loop Latency</div>
                  <div className="text-xl font-headline text-yellow-400">{avgLatency.toFixed(0)}ms</div>
                </div>
              </div>

              <Button 
                onClick={isRunning ? stopSpam : startSpam} 
                className={cn(
                  "w-full font-headline uppercase tracking-tighter h-12 shadow-lg transition-all",
                  isRunning 
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]" 
                    : "bg-yellow-500 hover:bg-yellow-600 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                )}
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <Pause className="h-4 w-4" /> Halt Flow
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4" /> Engage Resonance
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-yellow-500/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-yellow-400 font-code">
                <AlertCircle className="h-3 w-3" /> ARCHITECTURAL DIRECTIVE
              </div>
              <p className="text-[10px] text-secondary leading-relaxed italic">
                "Authenticity isn't found in the burst; it's found in the steady, gradual closing of the loop. We measure the Ferrari not by its redline, but by the precision of its slow-speed handling."
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Live Trace Panel */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col relative overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-yellow-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Database className="h-3 w-3 text-yellow-400" /> Resonant Manifestation Log</span>
                <Badge variant="outline" className="text-[8px] border-yellow-500/20 text-yellow-400 uppercase">Loop: Gradual</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 system-log space-y-2">
              {results.map((r, i) => (
                <div key={`${r.id}-${i}`} className="p-2 bg-primary/10 rounded border border-white/5 flex justify-between items-center text-[9px] font-code animate-in slide-in-from-right-2">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full", r.latency ? "bg-yellow-400 shadow-[0_0_5px_rgba(234,179,8,0.8)]" : "bg-white/20 animate-pulse")} />
                    <span className="text-secondary/60">MANIFEST_ID: {r.id.substring(0, 12)}...</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {r.latency ? (
                      <span className="text-yellow-400 font-bold">{r.latency}ms <span className="text-[7px] text-secondary/40 ml-1">SYNC</span></span>
                    ) : (
                      <span className="text-secondary/20 italic">WEAVING...</span>
                    )}
                    <span className="text-secondary/40">[{new Date(r.start).toLocaleTimeString()}]</span>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <BarChart3 className="h-12 w-12 mb-4 text-yellow-500" />
                  <p className="text-[10px] uppercase font-code">Awaiting Gradual Initialization...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
