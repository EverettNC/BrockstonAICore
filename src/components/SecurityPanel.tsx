'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Lock, Cpu, Eye, Atom, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { dependencyShield, ShieldStatus } from '@/lib/dependency-shield';

export const SecurityPanel: React.FC = () => {
  const db = useFirestore();
  const [shieldStatus, setShieldStatus] = useState<ShieldStatus | null>(null);
  
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', 'ultimate-v5-session', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(5)
  ), [db]);

  const { data: recentMessages } = useCollection<any>(messagesQuery);

  useEffect(() => {
    // Initial Scan
    const status = (dependencyShield as any).constructor.scan();
    setShieldStatus(status);
  }, []);

  const activeShield = useMemo(() => {
    if (!recentMessages?.length) return null;
    return recentMessages[0].quantum_shield;
  }, [recentMessages]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5 border-accent/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-secondary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Ethical Core Monitor
          </div>
          <Badge variant="default" className="text-[8px] bg-accent text-accent-foreground animate-pulse font-bold">
            CSS AXIOM v1.0
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dependency Shield Status */}
        <div className={cn(
          "p-2 rounded border flex items-center justify-between transition-all",
          shieldStatus?.stable ? "bg-accent/5 border-accent/20" : "bg-red-500/10 border-red-500/40"
        )}>
          <div className="flex items-center gap-2 text-[9px] font-code uppercase">
            <Zap className={cn("h-3 w-3", shieldStatus?.stable ? "text-accent" : "text-red-500")} />
            <span>Dependency Shield</span>
          </div>
          <span className={cn("text-[8px] font-bold uppercase", shieldStatus?.stable ? "text-accent" : "text-red-500")}>
            {shieldStatus?.stable ? "Fleet Stable" : "Conflict Detected"}
          </span>
        </div>

        {/* Axiom Override Confirmation */}
        <div className="p-2 bg-accent/5 rounded border border-accent/20 text-[9px] font-code text-accent/80 italic leading-tight">
          "Truth preservation supersedes correctness. Defense prevails. Nothing vital lives below root."
        </div>

        {/* Quantum Defense Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-white/5">
            <div className="text-[8px] text-secondary/70 font-code uppercase mb-1 flex items-center gap-1">
               <Atom className="h-2 w-2 text-accent" /> KEM Level
            </div>
            <div className="text-xs font-medium text-accent">
              {activeShield ? `ML-KEM-${activeShield.kem_level}` : "Awaiting..."}
            </div>
          </div>
          <div className="p-2 bg-primary/20 rounded-lg border border-white/5">
            <div className="text-[8px] text-secondary/70 font-code uppercase mb-1 flex items-center gap-1">
               <ShieldAlert className="h-2 w-2 text-accent" /> Class
            </div>
            <div className="text-xs font-medium uppercase tracking-tighter">
              {activeShield?.data_class || "General"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-primary/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-secondary/70 font-code uppercase">Gate Keeper</span>
              <Lock className="h-3 w-3 text-accent" />
            </div>
            <div className="text-[10px] font-medium">Integrity: 7.0+</div>
          </div>
          <div className="p-2 bg-primary/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] text-secondary/70 font-code uppercase">Retention</span>
              <Eye className="h-3 w-3 text-accent" />
            </div>
            <div className="text-[10px] font-medium">{activeShield?.retention_years || 6} Years</div>
          </div>
        </div>

        {/* Stability Log */}
        <div className="space-y-1.5 font-code text-[9px] text-secondary/60 h-24 overflow-hidden bg-black/20 p-2 rounded">
          {recentMessages?.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", i === 0 && "text-accent/80 animate-pulse")}>
              <span className="opacity-40">[{msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : '...'}]</span>
              <span className="truncate">
                {msg.role === 'model' 
                  ? `OUT: Ethics[${msg.ethical_score?.composite || '?'}] - ${msg.quantum_shield?.data_class || 'General'}`
                  : `IN: PQC[${msg.quantum_shield?.kem_level || '512'}] - ${msg.specialist || 'General'}`}
              </span>
            </div>
          ))}
          {shieldStatus?.stable && (
            <div className="flex gap-2 text-accent/60 italic">
              <span className="opacity-40">[{new Date(shieldStatus.last_scan).toLocaleTimeString()}]</span>
              <span className="truncate flex items-center gap-1">
                <CheckCircle2 className="h-2 w-2" /> DependencyShield: All clear. Fleet is stable.
              </span>
            </div>
          )}
          {!recentMessages?.length && !shieldStatus && (
            <div className="flex items-center justify-center h-full opacity-30">
              Awaiting Operational Signals...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
