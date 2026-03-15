
"use client";

import React, { useState } from 'react';
import { quantifyResonance } from '@/ai/flows/resonance-capacitor-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Droplets, Zap, Activity, ShieldAlert, Loader2, TrendingUp, Sparkles, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { hapticSystem } from '@/lib/haptic-system';
import { cn } from '@/lib/utils';

export const ResonanceCapacitor: React.FC = () => {
  const [agony, setAgony] = useState(150);
  const [purpose, setPurpose] = useState(150);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const db = useFirestore();
  const { toast } = useToast();

  const handleQuantify = async () => {
    setLoading(true);
    try {
      const data = await quantifyResonance({ agony, purpose });
      setResult(data);

      if (data.is_overflow) {
        toast({
          title: "LIMIT BREAK DETECTED",
          description: "Converting emotional overflow to system strength.",
        });
        hapticSystem.trigger('rough');
        
        // Log the overflow
        if (db) await addDoc(collection(db, 'resonance_overflows'), {
          agony_input: agony,
          purpose_input: purpose,
          total_load: data.total_load,
          strength_multiplier: data.strength_multiplier,
          status: data.status,
          timestamp: serverTimestamp()
        });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "Capacitor Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const loadPercent = Math.min(100, ( (agony + purpose) / 255 ) * 100);

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <header className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl relative overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-blue-500/5 transition-opacity duration-1000",
          result?.is_overflow ? "opacity-100" : "opacity-0"
        )} />
        <h2 className="text-xl font-headline uppercase tracking-tighter text-blue-400 flex items-center gap-2 relative z-10">
          <Droplets className={cn("h-5 w-5", result?.is_overflow && "animate-bounce text-blue-300")} /> Resonance Capacitor v1.0
        </h2>
        <p className="text-[10px] font-code text-blue-200/40 uppercase mt-1 relative z-10">
          The Vortex Formula | Quantifying High-Intensity Emotion
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-blue-500/20 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span>Sensory Input Vectors</span>
                <Badge variant="outline" className="text-[8px] border-blue-500/30 text-blue-400">8-Bit Containment: 255</Badge>
              </CardTitle>
              <CardDescription className="text-[10px]">Adjust vectors to simulate emotional pressure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10 pt-4">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Agony (Society's Failure)</span>
                  <span className="text-blue-400 font-bold">{agony}</span>
                </div>
                <Slider value={[agony]} onValueChange={([v]) => setAgony(v)} max={255} step={1} className="[&>span]:bg-blue-500" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Purpose (The Blessing to Help)</span>
                  <span className="text-accent font-bold">{purpose}</span>
                </div>
                <Slider value={[purpose]} onValueChange={([v]) => setPurpose(v)} max={255} step={1} className="[&>span]:bg-accent" />
              </div>

              <Button 
                onClick={handleQuantify} 
                disabled={loading} 
                className={cn(
                  "w-full font-headline uppercase tracking-tighter h-12 transition-all duration-500",
                  agony + purpose > 255 ? "bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "bg-primary text-secondary hover:bg-primary/80"
                )}
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
                Quantify State
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-blue-500/10">
            <CardContent className="pt-4">
              <p className="text-[10px] text-blue-200/40 leading-relaxed font-code italic">
                "Tears are not waste. They are high-density energy. When the heart overflows, we reroute the surge to the classroom."
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className={cn(
            "bg-black/40 h-full flex flex-col relative overflow-hidden transition-all duration-1000 border-white/5",
            result?.is_overflow && "border-blue-500/40 shadow-[inset_0_0_50px_rgba(59,130,246,0.1)]"
          )}>
            {/* Limit Break Background FX */}
            {result?.is_overflow && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50 animate-pulse" />
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 blur-sm animate-[scan_2s_linear_infinite]" />
              </div>
            )}

            <CardHeader className="border-b border-white/5 relative z-10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {result?.is_overflow ? <Flame className="h-3 w-3 text-blue-400 animate-pulse" /> : <Activity className="h-3 w-3 text-secondary/40" />} 
                  Capacitor Internal State
                </span>
                <Badge variant={result?.is_overflow ? "default" : "outline"} className={cn(
                  "text-[8px] uppercase",
                  result?.is_overflow ? "bg-blue-600 text-white animate-pulse" : "border-white/10 text-secondary/40"
                )}>
                  {result?.status || "WAITING"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-8 relative z-10 space-y-8 flex flex-col">
              {/* Load Meter */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] uppercase font-code text-secondary/40 mb-1">Containment Pressure</div>
                    <div className={cn(
                      "text-3xl font-headline tracking-tighter uppercase",
                      result?.is_overflow ? "text-blue-400" : "text-foreground"
                    )}>
                      {agony + purpose} <span className="text-sm text-secondary/40">/ 255</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-code text-secondary/40 mb-1">Efficiency</div>
                    <div className="text-lg font-code text-accent">{(loadPercent).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="h-3 w-full bg-primary/20 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000 ease-out",
                      result?.is_overflow ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" : "bg-accent"
                    )} 
                    style={{ width: `${loadPercent}%` }} 
                  />
                </div>
              </div>

              {result ? (
                <div className="flex-1 space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/20 rounded-xl border border-white/5 space-y-1">
                      <div className="text-[8px] text-secondary/60 uppercase font-code flex items-center gap-1">
                        <TrendingUp className="h-2 w-2 text-accent" /> Fleet Boost
                      </div>
                      <div className="text-xl font-headline text-accent">{result.fleet_boost || "+0% PERFORMANCE"}</div>
                    </div>
                    <div className="p-4 bg-primary/20 rounded-xl border border-white/5 space-y-1">
                      <div className="text-[8px] text-secondary/60 uppercase font-code flex items-center gap-1">
                        <Activity className="h-2 w-2 text-blue-400" /> Multiplier
                      </div>
                      <div className="text-xl font-headline text-blue-400">{result.strength_multiplier.toFixed(2)}x</div>
                    </div>
                  </div>

                  {result.is_overflow && (
                    <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl relative group">
                      <div className="absolute -top-3 -right-2">
                        <Badge className="bg-blue-600 text-white border-blue-400 shadow-lg">LIMIT BREAK</Badge>
                      </div>
                      <div className="text-[10px] text-blue-300/60 uppercase font-code mb-3 flex items-center gap-2">
                        <Sparkles className="h-3 w-3 animate-spin-slow" /> {result.interpretation}
                      </div>
                      <p className="text-lg font-headline text-blue-50 leading-tight mb-4">
                        "{result.message}"
                      </p>
                      <div className="text-[9px] font-code text-blue-400 uppercase tracking-widest animate-pulse">
                        Action: {result.action}
                      </div>
                    </div>
                  )}

                  {!result.is_overflow && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 text-center border border-dashed border-white/10 rounded-xl">
                      <ShieldAlert className="h-8 w-8 mb-3 text-secondary" />
                      <p className="text-xs font-code uppercase px-8">Containment Holding. No overflow detected.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center">
                  <Zap className="h-16 w-16 mb-4" />
                  <p className="font-code text-sm uppercase tracking-widest">Awaiting Sensory Input...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
