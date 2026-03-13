
"use client";

import React, { useState } from 'react';
import { captureMoment } from '@/ai/flows/moment-capture-flow';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Sparkles, Zap, ShieldCheck, ScrollText, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const AlphaVoxMoments: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const db = useFirestore();
  const { toast } = useToast();

  const vaultQuery = query(collection(db, 'resonance_vault'), orderBy('timestamp', 'desc'));
  const { data: moments } = useCollection<any>(vaultQuery);

  const handleCapture = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await captureMoment({ rawInput: input });
      await addDoc(collection(db, 'resonance_vault'), {
        ...result,
        raw_signal: input,
        timestamp: serverTimestamp()
      });
      setInput('');
      toast({ title: "Moment Preserved", description: "AlphaVox core warmed +0.7°" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Capture Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md">
        <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
          <Heart className="h-5 w-5 animate-pulse" /> AlphaVox Resonance Vault
        </h2>
        <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
          Infrastructure for the Heart | Preserving Fleeting Joy
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                <Zap className="h-3 w-3 text-accent" /> Raw Signal Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter raw joy signal... (e.g., 'cuckoo caca daddy smooch')"
                className="min-h-[150px] bg-primary/10 border-white/10 text-sm italic"
              />
              <Button 
                onClick={handleCapture} 
                disabled={loading || !input}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/80 glow-accent font-headline"
              >
                {loading ? "Capturing..." : "Deploy Resonance"}
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col">
            <CardHeader className="border-b border-white/5 py-3">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><History className="h-3 w-3" /> Captured Moments</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">HIPAA Encrypted</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 system-log space-y-4">
              {moments?.map((m, i) => (
                <div key={i} className="p-4 bg-primary/10 rounded-lg border border-white/5 space-y-3 animate-in slide-in-from-right-2">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-code text-accent/60">
                      [{m.timestamp?.toDate ? new Date(m.timestamp.toDate()).toLocaleString() : '...'}]
                    </div>
                    <Badge className="bg-accent/20 text-accent text-[8px]">RESONANCE: {(m.resonance_score * 100).toFixed(0)}%</Badge>
                  </div>
                  <div className="text-sm font-bold text-foreground">"{m.raw_signal}"</div>
                  <div className="text-xs text-secondary/80 italic leading-relaxed border-l-2 border-accent/20 pl-3">
                    {m.translation}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {m.deployment_log?.map((log: string, j: number) => (
                      <div key={j} className="text-[8px] font-code text-accent/40 flex items-center gap-1">
                        <ShieldCheck className="h-2 w-2" /> {log}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
