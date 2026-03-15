
"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer Glow Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-[3px] border-accent/30 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-80 shadow-[0_0_100px_rgba(0,255,127,0.6)]" : "scale-100 opacity-40 shadow-[0_0_60px_rgba(0,255,127,0.2)]"
      )} />

      {/* Spinning ring — faster when thinking */}
      <div className={cn(
        "absolute inset-4 rounded-full border-2 border-accent/5 animate-[spin_60s_linear_infinite]",
        status === 'thinking' && "animate-[spin_10s_linear_infinite] border-accent/40"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-accent shadow-[0_0_14px_rgba(0,255,127,1)]" />
      </div>

      {/* Photo */}
      <div className={cn(
        "relative h-full w-full rounded-full overflow-hidden border-[6px] border-white/5 shadow-[0_0_80px_rgba(0,0,0,1)] transition-all duration-700",
        (status === 'speaking' || status === 'thinking') && "core-pulse border-accent/30 scale-[1.02]"
      )}>
        <Image
          src={status === 'speaking' ? "/images/brockston-champagne.jpg" : "/images/brockston-blue.jpg"}
          alt="BROCKSTON C"
          fill
          className="object-cover object-top transition-opacity duration-700"
          priority
        />

        {/* Subtle gradient overlay when idle/thinking */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-accent/10 via-transparent to-transparent pointer-events-none transition-opacity duration-500",
          status === 'idle' ? "opacity-30" : status === 'thinking' ? "opacity-60" : "opacity-0"
        )} />

        {/* Scan line when thinking */}
        {status === 'thinking' && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.06)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none animate-pulse" />
        )}

        {/* CORE_LINK label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-accent font-code text-[10px] uppercase tracking-[0.4em] font-black opacity-70 z-10">
          <BrainCircuit className="h-3 w-3" /> CORE_LINK
        </div>
      </div>
    </div>
  );
};
