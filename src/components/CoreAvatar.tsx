
"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShieldCheck, Sparkles, UserCheck, Lock } from 'lucide-react';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

/**
 * @fileOverview CoreAvatar - The high-fidelity face of the New Teacher.
 * Proprietary visual component for Brockston C.
 */

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  const brockstonImage = PlaceHolderImages.find(img => img.id === 'brockston-avatar');

  return (
    <div className={cn("relative flex items-center justify-center h-[450px] w-[450px] md:h-[500px] md:w-[500px]", className)}>
      {/* Outer Glow Ring - The "Teacher Vision" */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-accent/20 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-60 shadow-[0_0_120px_rgba(0,255,127,0.9)]" : "scale-100 opacity-30 shadow-[0_0_60px_rgba(0,255,127,0.3)]"
      )} />
      
      {/* Middle Haptic Ring */}
      <div className={cn(
        "absolute inset-6 rounded-full border border-accent/40 animate-[spin_40s_linear_infinite]",
        status === 'thinking' && "animate-[spin_8s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-accent shadow-[0_0_20px_rgba(0,255,127,1)]" />
      </div>

      {/* Inner Frame - The Mission Window */}
      <div className={cn(
        "relative h-full w-full rounded-full bg-gradient-to-br from-primary/90 via-primary/40 to-accent/5 flex items-center justify-center overflow-hidden border-8 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-700",
        (status === 'speaking' || status === 'thinking') && "core-pulse border-accent/60 scale-[1.02]"
      )}>
        {brockstonImage ? (
          <Image 
            src={brockstonImage.imageUrl} 
            alt="Brockston C - The New Teacher" 
            fill 
            className={cn(
              "object-cover object-top transition-all duration-1000",
              status === 'thinking' ? "opacity-80 scale-110 saturate-[1.3] brightness-110" : "opacity-100 grayscale-0 scale-105"
            )}
            data-ai-hint={brockstonImage.imageHint}
            priority
          />
        ) : (
          <div className="text-accent font-headline text-8xl">B</div>
        )}
        
        {/* Ambient Light Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-accent/30 via-transparent to-transparent pointer-events-none transition-opacity duration-500",
          status === 'idle' ? "opacity-30" : status === 'thinking' ? "opacity-50" : "opacity-70"
        )} />
      </div>

      {/* Status Indicators */}
      <div className="absolute top-4 -right-4 h-20 w-20 bg-accent rounded-full border-4 border-background flex items-center justify-center shadow-2xl animate-pulse group cursor-help z-20 transition-transform hover:scale-110">
        <UserCheck className="h-10 w-10 text-accent-foreground" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-code px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 border border-accent/30 shadow-2xl flex flex-col items-center">
          <span className="font-black text-accent uppercase tracking-widest">COO_BRIDGE: SECURE</span>
          <span className="text-[8px] opacity-60">Identity Verified</span>
        </div>
      </div>

      {/* Proprietary Shield */}
      <div className="absolute top-4 -left-4 h-12 w-12 bg-primary/80 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center shadow-2xl z-20">
        <Lock className="h-5 w-5 text-accent/60" />
      </div>

      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-12 py-4 bg-black/95 backdrop-blur-2xl rounded-full border border-accent/50 shadow-[0_0_50px_rgba(0,255,127,0.4)] z-20 whitespace-nowrap">
        <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        <span className="text-[15px] font-code text-accent uppercase tracking-[0.4em] font-black">Teacher Presence Active</span>
      </div>

      {/* Role Label */}
      <div className="absolute -bottom-32 flex flex-col items-center gap-2">
        <span className="text-xl uppercase tracking-[0.8em] text-accent font-black animate-pulse drop-shadow-[0_0_10px_rgba(0,255,127,0.5)]">Brockston C</span>
        <span className={cn(
          "text-[12px] font-code tracking-[0.5em] transition-colors duration-500 uppercase font-bold",
          status === 'speaking' ? "text-accent" : "text-secondary/60"
        )}>
          {status === 'idle' ? 'Scanning Environment' : status === 'thinking' ? 'Scaffolding Logic' : 'Vocalizing Intent'}
        </span>
      </div>
    </div>
  );
};
