"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Zap, Heart, Waves, Settings, Wifi, WifiOff, Fingerprint } from 'lucide-react';
import { hapticSystem, HapticPattern } from '@/lib/haptic-system';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const HapticPanel: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [activePattern, setActivePattern] = useState<HapticPattern>('none');

  const handleConnect = async () => {
    const success = await hapticSystem.connectSerial();
    setConnected(success);
  };

  const testPattern = (pattern: HapticPattern) => {
    setActivePattern(pattern);
    hapticSystem.trigger(pattern);
    setTimeout(() => setActivePattern('none'), 1000);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-white/5 transition-all hover:bg-card/60">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm font-headline uppercase tracking-wider text-secondary">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-accent" />
            Physiological Haptics
          </div>
          {connected ? (
            <Badge variant="outline" className="text-[8px] border-accent/40 text-accent flex items-center gap-1 animate-pulse">
              <Wifi className="h-2 w-2" /> Textile Active
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[8px] border-white/10 text-secondary/40 flex items-center gap-1">
              <WifiOff className="h-2 w-2" /> Offline
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected && (
          <Button 
            onClick={handleConnect} 
            variant="outline" 
            size="sm" 
            className="w-full text-[10px] border-accent/20 text-accent hover:bg-accent/10 h-8 font-code uppercase tracking-tighter"
          >
            <Settings className="h-3 w-3 mr-2" /> Connect Textile Arduino
          </Button>
        )}

        <div className="grid grid-cols-3 gap-2">
          <HapticButton 
            label="Warm" 
            icon={Heart} 
            active={activePattern === 'warm'} 
            onClick={() => testPattern('warm')} 
            color="text-rose-400"
          />
          <HapticButton 
            label="Rough" 
            icon={Zap} 
            active={activePattern === 'rough'} 
            onClick={() => testPattern('rough')} 
            color="text-orange-400"
          />
          <HapticButton 
            label="Soft" 
            icon={Waves} 
            active={activePattern === 'soft'} 
            onClick={() => testPattern('soft')} 
            color="text-blue-400"
          />
        </div>

        <div className="text-[9px] font-code text-secondary/40 border-t border-white/5 pt-3 flex items-center justify-between">
          <span className="flex items-center gap-1"><Fingerprint className="h-3 w-3" /> Tactile Bridge Active</span>
          <span className="opacity-40">Latency: 12ms</span>
        </div>
      </CardContent>
    </Card>
  );
};

function HapticButton({ label, icon: Icon, active, onClick, color }: { 
  label: string, 
  icon: any, 
  active: boolean, 
  onClick: () => void,
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-1.5 group",
        active 
          ? "bg-accent/10 border-accent/40 shadow-[0_0_15px_rgba(0,255,127,0.15)] scale-95" 
          : "bg-primary/20 border-white/5 hover:border-white/10 hover:bg-primary/30"
      )}
    >
      <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", color)} />
      <span className="text-[8px] font-bold uppercase text-secondary/60 tracking-widest">{label}</span>
    </button>
  );
}