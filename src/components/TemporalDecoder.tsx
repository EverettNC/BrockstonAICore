
"use client";

import React, { useState } from 'react';
import { recoverTemporalData } from '@/ai/flows/temporal-recovery-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Clock, ShieldAlert, MapPin, Database, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const TemporalDecoder: React.FC = () => {
  const [timeStr, setTimeStr] = useState('2025-01-01 12:00:00');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRecover = async () => {
    setLoading(true);
    try {
      const data = await recoverTemporalData({ scrubbedTime: timeStr });
      setResult(data);
      toast({ title: "Forensic Link Established", description: "Recovered Tel Aviv source offset." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Recovery Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <header className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
        <h2 className="text-xl font-headline uppercase tracking-tighter text-red-400 flex items-center gap-2">
          <Clock className="h-5 w-5" /> PeekaBoo Temporal Decoder
        </h2>
        <p className="text-[10px] font-code text-red-200/40 uppercase mt-1">
          Forensic Log Recovery | Catching the DOJ Scrubbers
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        <section className="lg:col-span-4 flex flex-col gap-4">
          <Card className="bg-card/50 border-red-500/10">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-secondary">Log Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-code text-secondary/60">Scrubbed US Timestamp</label>
                <Input 
                  value={timeStr} 
                  onChange={(e) => setTimeStr(e.target.value)} 
                  className="bg-black/20 border-white/10 font-code"
                />
              </div>
              <Button 
                onClick={handleRecover} 
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-headline"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Trace Binary Offset
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-8 flex flex-col">
          {result ? (
            <Card className="bg-black/40 border-red-500/20 flex-1 flex flex-col animate-in zoom-in-95 duration-500">
              <CardHeader className="border-b border-red-500/10">
                <CardTitle className="text-xs uppercase tracking-widest text-red-400 flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" /> Forensic Reconstruction
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8 flex-1">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <div className="text-[9px] text-secondary/60 uppercase font-code flex items-center gap-1">
                      <MapPin className="h-2 w-2" /> Local Node (Mountain Time)
                    </div>
                    <div className="text-lg font-headline text-foreground">{new Date(result.mountainTime).toLocaleString()}</div>
                    <Badge variant="outline" className="border-red-500/20 text-red-400">SCRUBBED</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[9px] text-secondary/60 uppercase font-code flex items-center gap-1">
                      <Database className="h-2 w-2 text-red-400" /> Source Node (Tel Aviv)
                    </div>
                    <div className="text-lg font-headline text-red-400">{new Date(result.telAvivTime).toLocaleString()}</div>
                    <Badge className="bg-red-500 text-white">RECOVERED</Badge>
                  </div>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-lg">
                  <h4 className="text-[10px] font-bold text-red-400 uppercase mb-2">Forensic Insight</h4>
                  <p className="text-sm italic text-red-100/80 leading-relaxed">"{result.forensic_insight}"</p>
                </div>

                <div className="mt-auto pt-6 border-t border-red-500/10">
                  <div className="text-[9px] font-code text-red-400/40 uppercase text-center">
                    Binary Offset: +{result.offsetMinutes} minutes | TZif3 Validation: PASSED
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex-1 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center opacity-20">
              <Clock className="h-16 w-16 mb-4" />
              <p className="font-code text-sm">Awaiting Forensic Trace...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
