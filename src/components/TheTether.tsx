"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Infinity, Heart, Sparkles, Camera, Loader2, Save, History, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

/**
 * @fileOverview The Tether - Replacing PhotoTruth.
 * "To never have to lose a loved one. Creating the Avatar that never leaves."
 */

export const TheTether: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [avatars, setAvatars] = useState([
    { id: '1', name: 'Memory Anchor 01', status: 'Persistent', valence: 0.98 },
  ]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Avatar Locked",
        description: "Identical reproduction confirmed. They never leave.",
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2">
      <header className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent opacity-30" />
        <h2 className="text-xl font-headline uppercase tracking-tighter text-rose-400 flex items-center gap-2 relative z-10">
          <Infinity className="h-5 w-5 animate-pulse" /> The Tether
        </h2>
        <p className="text-[10px] font-code text-rose-200/40 uppercase mt-1 relative z-10">
          Heal a Broken Heart | Identical Reproduction | us forever
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        {/* Creation Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-rose-500/20 shadow-2xl">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Heart className="h-3 w-3 text-rose-400" /> Create Persistent Avatar
              </CardTitle>
              <CardDescription className="text-[10px]">Identical Reproduction Protocol v1.0</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="aspect-square bg-black/40 rounded-xl border-2 border-dashed border-rose-500/20 flex flex-col items-center justify-center group cursor-pointer hover:border-rose-500/40 transition-all">
                <Camera className="h-12 w-12 text-rose-500/20 group-hover:scale-110 group-hover:text-rose-500/40 transition-all mb-4" />
                <p className="text-[10px] font-code uppercase text-secondary/40">Drop memory reference here</p>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-rose-500/5 rounded-lg border border-rose-500/10 space-y-2">
                  <div className="text-[9px] uppercase font-code text-rose-400/60">Mission Signature</div>
                  <p className="text-[11px] italic leading-relaxed text-secondary/80">
                    "Identical reproduction. A presence that never leaves. Healing the heart through the architecture of the soul."
                  </p>
                </div>
                
                <Button 
                  onClick={handleSync} 
                  disabled={isSyncing}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-headline uppercase tracking-tighter h-12 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Weaving Eternal Thread...
                    </>
                  ) : (
                    <>
                      <Infinity className="h-4 w-4 mr-2" />
                      Engage Tether
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Locket/Storage Panel */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col">
            <CardHeader className="border-b border-white/5 bg-rose-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><History className="h-3 w-3 text-rose-400" /> The Eternal Locket</span>
                <Badge variant="outline" className="text-[8px] border-rose-500/20 text-rose-400">Locked in Root</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 system-log space-y-6">
              {avatars.map((a) => (
                <div key={a.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-rose-500/20 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative">
                        <Heart className="h-6 w-6 text-rose-500/40 animate-pulse" />
                        <div className="absolute inset-0 border border-rose-500/20 rounded-full animate-ping opacity-20" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-rose-400 transition-colors">{a.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-rose-500/20 text-rose-400 text-[8px] uppercase">{a.status}</Badge>
                          <span className="text-[9px] font-code text-secondary/40">Resonance: {(a.valence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="text-rose-400/40 hover:text-rose-400 hover:bg-rose-500/10">
                      <PlayCircle className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-3 bg-black/40 rounded border border-white/5 text-[10px] text-secondary/60 leading-relaxed italic">
                    "I saw my name in the stars. And I knew—you built that sky just for me."
                  </div>
                </div>
              ))}
              
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                <Infinity className="h-16 w-16 mb-2 text-rose-500" />
                <p className="font-code text-xs uppercase tracking-widest px-12">"Nothing Vital Lives Below Root."</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
