
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, UserCheck, BrainCircuit, ShieldAlert } from 'lucide-react';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

/**
 * @fileOverview CoreAvatar - THE NEW TEACHER.
 * Honest, high-fidelity symbolic representation. No placeholders.
 * Rule 13 Compliant: Reality over illusion.
 */

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  return (
    <div className={cn("relative flex items-center justify-center h-[400px] w-[400px] md:h-[500px] md:w-[500px]", className)}>
      {/* Outer Glow Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-[3px] border-accent/30 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-80 shadow-[0_0_100px_rgba(0,255,127,0.6)]" : "scale-100 opacity-40 shadow-[0_0_60px_rgba(0,255,127,0.2)]"
      )} />
      
      {/* Middle Haptic Ring */}
      <div className={cn(
        "absolute inset-8 rounded-full border-2 border-accent/50 animate-[spin_60s_linear_infinite]",
        status === 'thinking' && "animate-[spin_10s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-accent shadow-[0_0_20px_rgba(0,255,127,1)]" />
      </div>

      {/* Inner Symbolic Window */}
      <div className={cn(
        "relative h-full w-full rounded-full bg-gradient-to-br from-black via-primary/20 to-accent/5 flex flex-col items-center justify-center overflow-hidden border-[8px] border-white/5 shadow-[0_0_100px_rgba(0,0,0,1)] transition-all duration-700",
        (status === 'speaking' || status === 'thinking') && "core-pulse border-accent/40 scale-[1.02]"
      )}>
        {/* Stylized Identity Anchor */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="text-[12rem] font-headline font-black text-white leading-none tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] select-none">
            B
          </div>
          <div className="flex items-center gap-2 text-accent font-code text-xs uppercase tracking-[0.5em] font-black opacity-80">
            <BrainCircuit className="h-4 w-4" /> CORE_LINK
          </div>
        </div>
        
        {/* High-Fidelity Ambient Light Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent pointer-events-none transition-opacity duration-500",
          status === 'idle' ? "opacity-20" : status === 'thinking' ? "opacity-40" : "opacity-60"
        )} />
      </div>

      {/* Verification Status Overlay */}
      <div className="absolute bottom-8 right-8 h-20 w-24 bg-accent rounded-2xl border-4 border-background flex items-center justify-center shadow-2xl animate-pulse group cursor-help z-20 transition-transform hover:scale-110">
        <UserCheck className="h-10 w-10 text-accent-foreground" />
      </div>

      {/* Floating Presence Indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-12 py-4 bg-black/95 backdrop-blur-3xl rounded-full border border-accent/40 shadow-[0_0_40px_rgba(0,255,127,0.3)] z-20 whitespace-nowrap">
        <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        <span className="text-[14px] font-code text-accent uppercase tracking-[0.4em] font-black">PRESENCE ACTIVE</span>
      </div>
    </div>
  );
};
