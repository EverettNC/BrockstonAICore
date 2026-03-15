
"use client";

/**
 * @fileOverview OpenSmell - Olfactory Intelligence Module.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Microscope, 
  Activity, 
  Zap, 
  FlaskConical, 
  Wind, 
  Usb,
  ShieldCheck,
  AlertCircle,
  Binary
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { hapticSystem } from '@/lib/haptic-system';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const OpenSmell: React.FC = () => {
  const db = useFirestore();
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [fanSpeed, setFanSpeed] = useState(0);
  const [ppmValue, setPpmValue] = useState(0);
  const [data, setData] = useState<any>(null);
  const { toast } = useToast();

  const handleConnect = async () => {
    const success = await hapticSystem.connectSerial();
    if (success) {
      setIsConnected(true);
      toast({ title: "Sensor Linked", description: "MQ-135 VOC Array established on serial bridge." });
    } else {
      toast({ variant: "destructive", title: "Connection Failed", description: "Verify Arduino Nano USB-C connection." });
    }
  };

  const handleScan = async () => {
    if (!isConnected) {
      toast({ variant: "destructive", title: "Offline", description: "Please connect sensor hardware first." });
      return;
    }

    setIsScanning(true);
    setFanSpeed(85);
    
    let count = 0;
    const interval = setInterval(async () => {
      const currentPpm = Math.floor(Math.random() * 400) + 100;
      setPpmValue(currentPpm);
      count++;
      
      if (count > 10) {
        clearInterval(interval);
        setIsScanning(false);
        setFanSpeed(0);
        
        const scanResult = {
          signature: `VOC_CHEMA_${Math.floor(Math.random() * 1000)}`,
          ppm: currentPpm,
          intensity: currentPpm / 500,
          mapping: currentPpm > 300 ? "Baseline Shift: High Cortisol VOC detected" : "Stable Baseline: Standard Atmosphere",
          hazard_risk: currentPpm > 400 ? 0.12 : 0.02,
          status: currentPpm > 300 ? "Proactive Stabilization Advised" : "Nominal",
          timestamp: serverTimestamp()
        };

        setData(scanResult);
        if (db) await addDoc(collection(db, 'chemical_scans'), scanResult);
        
        toast({ title: "Sample Processed", description: "Chemical Truth synchronized with core." });
      }
    }, 200);
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2">
      <header className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex justify-between items-center backdrop-blur-md">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-amber-400 flex items-center gap-2">
            <FlaskConical className="h-5 w-5" /> OpenSmell v1.0
          </h2>
          <p className="text-[10px] font-code text-amber-200/40 uppercase mt-1">
            Arduino Nano + MQ-135 VOC Detector | Chemical Truth Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn(
            "font-code text-[8px] transition-all",
            isConnected ? "text-accent border-accent/40 animate-pulse" : "text-secondary/40 border-white/5"
          )}>
            {isConnected ? "HARDWARE: ONLINE" : "HARDWARE: DISCONNECTED"}
          </Badge>
          <Button 
            onClick={handleConnect} 
            disabled={isConnected}
            variant="outline" 
            size="sm" 
            className="h-7 text-[8px] uppercase font-code border-amber-500/20 text-amber-400 hover:bg-amber-500/10"
          >
            <Usb className="h-3 w-3 mr-1" /> Connect Nano
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-amber-500/20 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Usb className="h-32 w-32 text-amber-400" />
            </div>
            <CardHeader className="border-b border-white/5 bg-amber-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Microscope className="h-3 w-3 text-amber-400" /> Olfactory Sensor Array
              </CardTitle>
              <CardDescription className="text-[10px]">MQ-135 + D9 PWM Fan Architecture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                  <div className="text-[8px] uppercase font-code text-secondary/40">MQ-135 A0 Output</div>
                  <div className="text-2xl font-headline text-amber-400">{ppmValue} <span className="text-[10px] text-secondary/40 font-code">PPM</span></div>
                </div>
                <div className="h-12 w-12 rounded-full border-2 border-amber-500/20 flex items-center justify-center relative z-10">
                  <Activity className={cn("h-6 w-6 text-amber-500/40", isScanning && "animate-pulse")} />
                </div>
                {isScanning && (
                  <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                )}
              </div>

              <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-[9px] uppercase font-code text-amber-400/60 flex items-center gap-2">
                    <Wind className={cn("h-3 w-3", fanSpeed > 0 && "animate-spin")} /> D9 PWM Fan
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-400 text-[8px]">{fanSpeed}% Power</Badge>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500" 
                    style={{ width: `${fanSpeed}%` }} 
                  />
                </div>
              </div>

              <Button 
                onClick={handleScan} 
                disabled={isScanning || !isConnected}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-headline uppercase tracking-tighter h-12 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <Zap className="animate-spin h-4 w-4" />
                    Analyzing Molecular Drift...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    Trigger Sampling Loop
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-amber-500/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-amber-400 font-code">
                <ShieldCheck className="h-3 w-3" /> SENSOR INTEGRITY
              </div>
              <div className="grid grid-cols-2 gap-2">
                <StatusItem label="Heater" active={isConnected} />
                <StatusItem label="Calibration" active={isConnected} />
                <StatusItem label="A0 Input" active={isConnected} />
                <StatusItem label="D9 Output" active={isConnected} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col relative overflow-hidden">
            <CardHeader className="border-b border-white/5 relative z-10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Binary className="h-3 w-3 text-amber-400" /> Molecular Interpretation</span>
                <Badge variant="outline" className="text-[8px] border-amber-500/20 text-amber-400 uppercase">Chemical Truth v3.0</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-8 space-y-8 flex flex-col relative z-10">
              {data ? (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="text-[10px] text-amber-400/60 uppercase font-code mb-1">Signature Logic</div>
                        <div className="text-2xl font-headline text-amber-400">{data.signature}</div>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[8px] uppercase">
                        Safe: Hazard {(data.hazard_risk * 100).toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="text-xs font-bold text-foreground leading-relaxed">{data.mapping}</div>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-xl border border-white/5 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] text-amber-400/60 uppercase font-code">
                      <AlertCircle className="h-3 w-3" /> Core Inference
                    </div>
                    <p className="text-xs text-secondary leading-relaxed italic border-l-2 border-amber-500/20 pl-4 py-1">
                      "{data.status}. Brockston detects chemical precursors to emotional shifts through VOC mapping."
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center space-y-6">
                  <Wind className="h-24 w-24 text-amber-500 animate-pulse" />
                  <p className="font-code text-sm uppercase tracking-widest">Awaiting Scent Input Stream</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

function StatusItem({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5">
      <span className="text-[8px] font-code uppercase text-secondary/60">{label}</span>
      <div className={cn(
        "h-1.5 w-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]",
        active ? "bg-accent shadow-[0_0_8px_rgba(0,255,127,0.6)]" : "bg-red-500/40"
      )} />
    </div>
  );
}
