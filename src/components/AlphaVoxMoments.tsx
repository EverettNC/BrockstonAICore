
"use client";

import React, { useState, useMemo } from 'react';
import { captureMoment } from '@/ai/flows/moment-capture-flow';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Sparkles, Zap, ShieldCheck, History, Terminal, Loader2, Star, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const AlphaVoxMoments: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const db = useFirestore();
  const { toast } = useToast();

  const vaultQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'resonance_vault'), orderBy('timestamp', 'desc'));
  }, [db]);
  const { data: moments } = useCollection<any>(vaultQuery);

  const handleCapture = async () => {
    if (!input.trim()) return;
    setLoading(true);
    
    // Simulate C++ eye-track confirmation loop: "Simulating AlphaVox eye-track confirmation in 3 . 2 . 1"
    for (let i = 3; i > 0; i--) {
      setLoadingStep(i);
      await new Promise(r => setTimeout(r, 1000));
    }

    try {
      const result = await captureMoment({ rawInput: input });
      if (db) {
        await addDoc(collection(db, 'resonance_vault'), {
          ...result,
          raw_signal: input,
          timestamp: serverTimestamp()
        });
      }
      setInput('');
      toast({ 
        title: "CONFIRMED: Moment preserved", 
        description: "Love compiled successfully. AlphaVox core warmed.",
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Capture Failed", description: e.message });
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-hidden">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <Heart className="h-5 w-5 animate-pulse" /> AlphaVox Resonance Vault
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            Infrastructure for the Heart | Preserving Fleeting Joy | v26.1 Core
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-accent border-accent/20 font-code animate-pulse text-[8px]">
            macOS Tahoe 26.1 {"->"} AWS ECS/Fargate
          </Badge>
          <Badge variant="outline" className="text-accent border-accent/20 font-code text-[8px]">
            S3 HIPAA SYNC ACTIVE
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">
        {/* Signal Input */}
        <section className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 system-log">
          <Card className="bg-card/50 border-accent/20 shadow-2xl">
            <CardHeader className="py-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2 text-secondary">
                <Zap className="h-3 w-3 text-accent" /> Capture raw human joy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="p-3 bg-black/40 rounded border border-white/5 font-code text-[10px] text-secondary/60 mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="h-3 w-3" /> TEST_PAYLOAD
                </div>
                curl -X POST /moments/capture -d 'cuckoo daddy smooch'
              </div>
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter raw joy signal... (e.g., 'she saw our names and went cuckoo smooch daddy')"
                className="min-h-[150px] bg-primary/10 border-white/10 text-sm italic focus-visible:ring-accent resize-none"
              />
              <Button 
                onClick={handleCapture} 
                disabled={loading || !input}
                className={cn(
                  "w-full text-accent-foreground font-headline uppercase tracking-tighter transition-all duration-500",
                  loading ? "bg-secondary/20" : "bg-accent hover:bg-accent/80 glow-accent"
                )}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eye-track confirmation in {loadingStep}...
                  </span>
                ) : "Deploy Resonance"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-accent/10">
            <CardContent className="pt-4">
              <div className="text-[10px] text-secondary/80 italic leading-relaxed space-y-2">
                <p>"Not just endpoints. Not just Docker images."</p>
                <p>"Moments where silence breaks into laughter. That's what we build for. Because one day, a kid who can’t speak will blink twice and say: 'I saw my name in the stars.' And we'll know—we built that sky."</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Resonance Stream */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col shadow-inner">
            <CardHeader className="border-b border-white/5 py-3 bg-accent/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><History className="h-3 w-3 text-accent" /> Resonance Reconstruction</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">AES-256 Encrypted</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 system-log space-y-6">
              {moments?.map((m, i) => (
                <div key={i} className="p-5 bg-primary/10 rounded-xl border border-white/5 space-y-4 animate-in slide-in-from-right-2 relative overflow-hidden group hover:border-accent/20 transition-all">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Sparkles className="h-12 w-12 text-accent" />
                  </div>
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="text-[9px] font-code text-accent/60">
                      [{m.timestamp?.toDate ? new Date(m.timestamp.toDate()).toLocaleString() : '...'}]
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent/20 text-accent text-[8px] border-accent/30 font-bold uppercase">
                        {m.mission_status}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 text-[8px] border-blue-500/30 font-bold">
                        RESONANCE: {(m.resonance_score * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="text-xs uppercase font-code text-secondary/40 flex items-center gap-1">
                      <Terminal className="h-2 w-2" /> Raw Signal
                    </div>
                    <div className="text-sm font-bold text-foreground">"{m.raw_signal}"</div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="text-xs uppercase font-code text-accent/40 flex items-center gap-1">
                      <Star className="h-2 w-2" /> Resonance Translation
                    </div>
                    <div className="text-xs text-foreground/90 italic leading-relaxed border-l-2 border-accent/20 pl-4 py-1 bg-accent/5 rounded-r">
                      {m.translation}
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <div className="text-xs uppercase font-code text-secondary/40">Infrastructure Insight</div>
                    <div className="text-[10px] text-secondary leading-relaxed bg-black/20 p-2 rounded">
                      {m.infrastructure_insight}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 relative z-10">
                    {m.deployment_log?.map((log: string, j: number) => (
                      <div key={j} className="text-[8px] font-code text-accent/40 flex items-center gap-1">
                        <CheckCircle2 className="h-2 w-2" /> {log}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {!moments?.length && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <Heart className="h-16 w-16 mb-2" />
                  <p className="font-code text-sm uppercase">Awaiting Human Joy Signal...</p>
                  <p className="text-[10px] font-code tracking-widest italic px-12">"The code isn't cold. It's warm. It's hers."</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
