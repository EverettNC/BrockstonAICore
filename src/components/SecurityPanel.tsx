
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SecurityPanel: React.FC = () => {
  const [logs, setLogs] = React.useState<string[]>([
    "SEC-INIT: Neural Security Enforcer Active",
    "CORE-LOCK: Post-Quantum Protocol v4.2 engaged",
    "NET-SCAN: Port integrity verified 0.003ms",
    "MEM-ENCRYPT: Episodic data shards rotated"
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        "ENFORCE: Entropy validation successful",
        "BLOCK: Suspicious pattern neutralized",
        "SYNC: Key exchange refreshed",
        "MONITOR: Latency stable <1ms"
      ];
      const newLog = events[Math.floor(Math.random() * events.length)];
      setLogs(prev => [newLog, ...prev.slice(0, 5)]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Operational Core
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-primary/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-secondary/70 font-code uppercase">Security</span>
              <Lock className="h-3 w-3 text-accent" />
            </div>
            <div className="text-sm font-medium">Q-Secure Active</div>
          </div>
          <div className="p-3 bg-primary/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-secondary/70 font-code uppercase">Encryption</span>
              <Cpu className="h-3 w-3 text-accent" />
            </div>
            <div className="text-sm font-medium">Crystal-Kyber</div>
          </div>
        </div>

        <div className="space-y-1.5 font-code text-[10px] text-secondary/60 system-log h-32 overflow-hidden bg-black/20 p-2 rounded">
          {logs.map((log, i) => (
            <div key={i} className={cn("flex gap-2", i === 0 && "text-accent/80 animate-pulse")}>
              <span className="opacity-40">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
