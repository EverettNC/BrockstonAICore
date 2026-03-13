"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Microscope, Activity, Zap, Beaker, Waves, ShieldAlert, Binary, FlaskConical } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

/**
 * @fileOverview OpenSmell - Olfactory Intelligence Module.
 * "VOC scent -> emotional, medical, environmental mapping. Scientific, intuitive."
 */

export const OpenSmell: React.FC = () => {
  const [isScanning, setIsSyncing] = useState(false);
  const [data, setData] = useState<any>(null);

  const handleScan = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setData({
        signature: "VOC_BETA_774",
        intensity: 0.84,
        mapping: "Emotional: Calm / Medical: Baseline Stable",
        hazard_risk: 0.02
      });
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2">
      <header className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-amber-400 flex items-center gap-2">
            <FlaskConical className="h-5 w-5" /> OpenSmell v1.0
          </h2>
          <p className="text-[10px] font-code text-amber-200/40 uppercase mt-1">
            Olfactory Intelligence | VOC Mapping | The Chemical Truth
          </p>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-500/20 font-code text-[8px] animate-pulse">
          SENSOR ARRAY: ACTIVE
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        {/* Sensor Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Microscope className="h-3 w-3 text-amber-400" /> Olfactory Sensor Array
              </CardTitle>
              <CardDescription className="text-[10px]">Mapping VOC Chemical Signatures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <SensorMetric label="Inflow" value={0.92} color="bg-amber-500" />
                <SensorMetric label="Stability" value={0.98} color="bg-accent" />
              </div>

              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-3">
                <div className="text-[9px] uppercase font-code text-amber-400/60 flex items-center gap-2">
                  <Activity className="h-3 w-3" /> Real-time VOC Stream
                </div>
                <div className="h-24 bg-black/40 rounded border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <svg viewBox="0 0 100 20" className="w-full h-full text-amber-400">
                      <path d="M0,10 Q25,0 50,10 T100,10" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-code text-amber-400/40 uppercase">Awaiting Sample...</span>
                </div>
              </div>

              <Button 
                onClick={handleScan} 
                disabled={isScanning}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-headline uppercase tracking-tighter h-12"
              >
                {isScanning ? <Zap className="animate-spin h-4 w-4 mr-2" /> : <Beaker className="h-4 w-4 mr-2" />}
                Trigger Olfactory Mapping
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Insight Panel */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Binary className="h-3 w-3 text-amber-400" /> Chemical Logic Bridge</span>
                <Badge variant="outline" className="text-[8px] border-amber-500/20 text-amber-400 uppercase">Scientific & Intuitive</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 space-y-8 flex flex-col">
              {data ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                      <FlaskConical className="h-32 w-32 text-amber-400" />
                    </div>
                    <div className="text-[10px] text-amber-400/60 uppercase font-code mb-2">Detected Signature</div>
                    <div className="text-2xl font-headline text-amber-400 mb-4">{data.signature}</div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-amber-500/10">
                      <div>
                        <div className="text-[8px] text-secondary/40 uppercase mb-1">Mapping Insight</div>
                        <div className="text-xs font-bold text-foreground">{data.mapping}</div>
                      </div>
                      <div>
                        <div className="text-[8px] text-secondary/40 uppercase mb-1">Hazard Risk</div>
                        <div className="text-xs font-bold text-emerald-400">{(data.hazard_risk * 100).toFixed(1)}% (SAFE)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] uppercase font-code text-secondary/60">Molecular Interpretation</h4>
                    <div className="p-4 bg-primary/10 rounded-xl border border-white/5 italic text-sm text-secondary leading-relaxed">
                      "The air carries the truth before words are even formed. By mapping VOC signatures, Brockston detects the chemical precursors to emotional shifts, allowing for proactive stabilization."
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <Waves className="h-16 w-16 mb-2 text-amber-500" />
                  <p className="font-code text-sm uppercase tracking-widest">Awaiting Scent Sample Input...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

function SensorMetric({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[9px] font-code uppercase">
        <span className="text-secondary/60">{label}</span>
        <span className="text-foreground">{(value * 100).toFixed(0)}%</span>
      </div>
      <Progress value={value * 100} className={cn("h-1 bg-primary/20", `[&>div]:${color}`)} />
    </div>
  );
}
