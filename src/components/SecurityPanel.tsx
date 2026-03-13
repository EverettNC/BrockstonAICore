
'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Lock, Cpu, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

export const SecurityPanel: React.FC = () => {
  const db = useFirestore();
  const messagesQuery = useMemo(() => query(
    collection(db, 'chats', 'v5-alpha-session', 'messages'),
    orderBy('timestamp', 'desc'),
    limit(5)
  ), [db]);

  const { data: recentMessages } = useCollection<any>(messagesQuery);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-headline uppercase tracking-wider text-secondary">
          <ShieldCheck className="h-4 w-4 text-accent" />
          Ethical Core Monitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-primary/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-secondary/70 font-code uppercase">Gate Keeper</span>
              <Lock className="h-3 w-3 text-accent" />
            </div>
            <div className="text-xs font-medium">Integrity: 7.0+ Required</div>
          </div>
          <div className="p-3 bg-primary/20 rounded-lg border border-white/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-secondary/70 font-code uppercase">Privacy</span>
              <Eye className="h-3 w-3 text-accent" />
            </div>
            <div className="text-xs font-medium">HIPAA Enforced</div>
          </div>
        </div>

        <div className="space-y-1.5 font-code text-[9px] text-secondary/60 h-32 overflow-hidden bg-black/20 p-2 rounded">
          {recentMessages?.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", i === 0 && "text-accent/80 animate-pulse")}>
              <span className="opacity-40">[{new Date(msg.timestamp?.toDate()).toLocaleTimeString()}]</span>
              <span>
                {msg.role === 'model' 
                  ? `OUT: Ethics[${msg.ethical_score?.composite}] - Specialist:${msg.specialist}`
                  : `IN: Arousal[${msg.tone_profile?.arousal || '??'}] - Salience[${msg.lucas_signal?.salience || '??'}]`}
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
