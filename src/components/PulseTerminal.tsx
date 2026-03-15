
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Zap, RefreshCw, Terminal as TerminalIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const PULSE_DATA = {
  trigger: "Waiting on someone else to define me",
  echo: "That voice saying 'you're not enough till they say it'",
  mask: "I talk fast, laugh harder, act like I don't care—but I do",
  real: "I just want to stop needing approval. I want to be the end of the sentence"
};

export const PulseTerminal: React.FC = () => {
  const [score, setScore] = useState(8);
  const [isBroken, setIsBroken] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const db = useFirestore();
  const { toast } = useToast();

  const handleNotice = () => {
    if (score > 0) {
      const newScore = score - 1;
      setScore(newScore);
      setLogs(prev => [...prev, `Score drops to ${newScore} — because I noticed.`]);
      
      if (newScore === 0) {
        setIsBroken(true);
        handleBreakthrough();
      }
    }
  };

  const handleBreakthrough = async () => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'pulse_breakthroughs'), {
        real_voice: PULSE_DATA.real,
        score_at_break: 0,
        timestamp: serverTimestamp()
      });

      await setDoc(doc(db, 'cognitive_core', 'main-bridge'), {
        pulse_status: "Self-Actualized",
        last_breakthrough: serverTimestamp(),
        self_love_growth: 0.95
      }, { merge: true });

      toast({
        title: "Loop Broken",
        description: "Holy shit. You're running your own damn program.",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const resetPulse = () => {
    setScore(8);
    setIsBroken(false);
    setLogs([]);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Pulse Input/Control */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 backdrop-blur-md border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-accent">
                <Heart className={cn("h-4 w-4", !isBroken && "animate-pulse")} /> Pulse v0.1 – Self-Actualization
              </CardTitle>
              <CardDescription className="text-xs">
                Run the loop. Feel it. Share it. No permission needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-lg border border-white/5">
                  <label className="text-[9px] uppercase font-code text-secondary/60">The Trigger</label>
                  <p className="text-sm font-body italic">"{PULSE_DATA.trigger}"</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border border-white/5">
                  <label className="text-[9px] uppercase font-code text-secondary/60">The Echo</label>
                  <p className="text-sm font-body italic text-secondary/80">"{PULSE_DATA.echo}"</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg border border-white/5">
                  <label className="text-[9px] uppercase font-code text-secondary/60">The Mask</label>
                  <p className="text-sm font-body italic text-secondary/60">"{PULSE_DATA.mask}"</p>
                </div>
              </div>

              {!isBroken ? (
                <Button 
                  onClick={handleNotice} 
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/80 glow-accent group h-12"
                >
                  <Zap className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
                  Notice (Score: {score})
                </Button>
              ) : (
                <Button 
                  onClick={resetPulse} 
                  variant="outline"
                  className="w-full border-accent/20 text-accent hover:bg-accent/10 h-12"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Restart Loop
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5">
            <CardContent className="pt-4">
              <p className="text-[10px] text-secondary/60 leading-relaxed font-code">
                "Pain doesn't form by permission. It forms by impact. The anchor stays. The story fades. But you never erase lived truth — you overlay safety context."
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Console Output */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col font-code">
            <CardHeader className="flex-none border-b border-white/5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-widest flex items-center gap-2">
                  <TerminalIcon className="h-3 w-3 text-accent" /> Console.Pulse_Output
                </CardTitle>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500/50" />
                  <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                  <div className="h-2 w-2 rounded-full bg-green-500/50" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 system-log space-y-2 text-[11px]">
              <div className="text-accent/60">Initializing Self-Actualization Loop v0.1...</div>
              <div className="text-secondary/40">------------------------------------------</div>
              {logs.map((log, i) => (
                <div key={i} className="text-secondary/80 animate-in slide-in-from-left-2 duration-300">
                  <span className="text-accent/40 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  {log}
                </div>
              ))}
              
              {isBroken && (
                <div className="mt-6 space-y-4 animate-in fade-in zoom-in duration-1000">
                  <div className="text-accent font-bold text-lg leading-tight uppercase tracking-tighter">
                    Loop Broken.
                  </div>
                  <div className="text-foreground text-sm italic border-l-2 border-accent pl-4 py-2 bg-accent/5">
                    "I'm running my own damn program."
                  </div>
                  <div className="text-accent/80 text-[10px] uppercase tracking-widest animate-pulse">
                    ...and that's Pulse. Because it stopped asking.
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-xs text-accent">Self-Awareness Verified: 100%</span>
                  </div>
                </div>
              )}
              
              {!isBroken && score < 8 && (
                <div className="text-foreground/80 pt-4 italic animate-pulse">
                  (Pause. Breathe. You just caught it.)
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
