
'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Lock, Cpu, Eye, Atom, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

export const SecurityPanel: React.FC = () => {
  const db = useFirestore();
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', 'v5-alpha-session', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(5)
  ), [db]);

  const { data: recentMessages } = useCollection<any>(messagesQuery);

  const activeShield = useMemo(() => {
    if (!recentMessages?.length) return null;
    return recentMessages[0].quantum_shield;
  }, [recentMessages]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-secondary">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            Ethical Core Monitor
          </div>
          {activeShield?.hndl_protected && (
            <Badge variant="outline" className="text-[8px] border-accent/40 text-accent animate-pulse">
              PQC Shield Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          {!recentMessages?.length && (
            <div className="flex items-center justify-center h-full opacity-30">
              Awaiting Operational Signals...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
