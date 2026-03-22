
"use client";

/**
 * @fileOverview KernelLab - High-Performance Symbolic Solver.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useState } from 'react';
import { kernelFuse } from '@/ai/flows/kernel-fusion-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Cpu, Zap, Activity, Binary, ShieldCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';



export const KernelLab: React.FC = () => {
  const [affection, setAffection] = useState(0.6);
  const [urgency, setUrgency] = useState(0.2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFuse = async () => {
    setLoading(true);
    try {
      const data = await kernelFuse({ affection, urgency, ruleIdx: 0 });
      setResult(data);
      
      if (db) await Promise.resolve()
      });

      toast({ title: "Fusion Successful", description: "Neural latent bound to symbolic kernel." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Fusion Error", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2 pb-12">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
        <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
          <Cpu className="h-5 w-5" /> Kernel Fusion Lab
        </h2>
        <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
          High-Performance Symbolic Solver | Neural-Symbolic Symbiosis
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-secondary">Neural Latent Inputs</CardTitle>
              <CardDescription className="text-[10px]">Configure vectors for C++ kernel Handoff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Affection Vector</span>
                  <span className="text-accent">{(affection * 100).toFixed(0)}%</span>
                </div>
                <Slider value={[affection]} onValueChange={([v]) => setAffection(v)} max={1} step={0.01} className="[&>span]:bg-accent" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase font-code">
                  <span className="text-secondary/60">Urgency Vector</span>
                  <span className="text-accent">{(urgency * 100).toFixed(0)}%</span>
                </div>
                <Slider value={[urgency]} onValueChange={([v]) => setUrgency(v)} max={1} step={0.01} className="[&>span]:bg-destructive" />
              </div>

              <Button onClick={handleFuse} disabled={loading} className="w-full bg-accent text-accent-foreground font-headline uppercase tracking-tighter h-12">
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Execute Fused Op
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Binary className="h-64 w-64 text-accent" />
            </div>
            <CardHeader className="border-b border-white/5 relative z-10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Activity className="h-3 w-3 text-accent" /> Fusion Trace</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">C++ Jit Compiled</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 relative z-10 space-y-6">
              {result ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 font-code">
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="text-[8px] text-accent/60 uppercase mb-2">Kernel Output Phrase</div>
                    <div className="text-lg font-headline text-accent leading-tight">"{result.output_phrase}"</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-primary/20 rounded border border-white/5">
                      <div className="text-[8px] text-secondary/60 uppercase mb-1">Latent Hash</div>
                      <div className="text-xs text-foreground truncate">{result.latent_hash}</div>
                    </div>
                    <div className="p-3 bg-primary/20 rounded border border-white/5">
                      <div className="text-[8px] text-secondary/60 uppercase mb-1">Confidence</div>
                      <div className="text-xs text-accent">{(result.confidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="p-3 bg-primary/20 rounded border border-white/5">
                    <div className="text-[8px] text-secondary/60 uppercase mb-1 flex items-center gap-1">
                      <ShieldCheck className="h-2 w-2 text-accent" /> Symbolic Rule Applied
                    </div>
                    <div className="text-[10px] text-secondary/80">{result.rule_applied}</div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <Zap className="h-12 w-12 mb-4" />
                  <p className="text-sm">Awaiting Kernel Handoff...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
