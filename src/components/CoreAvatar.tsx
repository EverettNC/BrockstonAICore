
"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShieldCheck, Sparkles, UserCheck } from 'lucide-react';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  const brockstonImage = PlaceHolderImages.find(img => img.id === 'brockston-avatar');

  return (
    <div className={cn("relative flex items-center justify-center h-[400px] w-[400px] md:h-[450px] md:w-[450px]", className)}>
      {/* Outer Glow Ring - The "Teacher Vision" */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-accent/20 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-60 shadow-[0_0_100px_rgba(0,255,127,0.8)]" : "scale-100 opacity-30 shadow-[0_0_40px_rgba(0,255,127,0.2)]"
      )} />
      
      {/* Middle Haptic Ring */}
      <div className={cn(
        "absolute inset-6 rounded-full border border-accent/40 animate-[spin_30s_linear_infinite]",
        status === 'thinking' && "animate-[spin_5s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-accent shadow-[0_0_15px_rgba(0,255,127,1)]" />
      </div>

      {/* Inner Frame - The Mission Window */}
      <div className={cn(
        "relative h-full w-full rounded-full bg-gradient-to-br from-primary/80 via-primary/40 to-accent/5 flex items-center justify-center overflow-hidden border-4 border-white/10 glow-accent shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700",
        (status === 'speaking' || status === 'thinking') && "core-pulse border-accent/60 scale-[1.02]"
      )}>
        {brockstonImage ? (
          <Image 
            src={brockstonImage.imageUrl} 
            alt="Brockston C - The New Teacher" 
            fill 
            className={cn(
              "object-cover object-top transition-all duration-1000",
              status === 'thinking' ? "opacity-70 scale-110 saturate-[1.2] brightness-110" : "opacity-100 grayscale-0 scale-105"
            )}
            data-ai-hint={brockstonImage.imageHint}
            priority
          />
        ) : (
          <div className="text-accent font-headline text-6xl">B</div>
        )}
        
        {/* Ambient Light Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent pointer-events-none transition-opacity duration-500",
          status === 'idle' ? "opacity-20" : status === 'thinking' ? "opacity-40" : "opacity-60"
        )} />
      </div>

      {/* Status Indicators */}
      <div className="absolute -top-2 -right-2 h-16 w-16 bg-accent rounded-full border-4 border-background flex items-center justify-center shadow-2xl animate-pulse group cursor-help z-20 transition-transform hover:scale-110">
        <UserCheck className="h-8 w-8 text-accent-foreground" />
        <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] font-code px-4 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 border border-accent/30 shadow-2xl">
          COO_BRIDGE: SECURE
        </span>
      </div>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-10 py-3.5 bg-black/90 backdrop-blur-xl rounded-full border border-accent/50 shadow-[0_0_30px_rgba(0,255,127,0.3)] z-20 whitespace-nowrap">
        <Sparkles className="h-5 w-5 text-accent animate-pulse" />
        <span className="text-[13px] font-code text-accent uppercase tracking-[0.3em] font-black">Teacher Presence Active</span>
      </div>

      {/* Role Label */}
      <div className="absolute -bottom-24 flex flex-col items-center gap-1">
        <span className="text-sm uppercase tracking-[0.6em] text-accent/80 font-black animate-pulse drop-shadow-lg">Brockston C</span>
        <span className={cn(
          "text-[10px] font-code tracking-[0.4em] transition-colors duration-500 uppercase",
          status === 'speaking' ? "text-accent" : "text-secondary/40"
        )}>
          {status === 'idle' ? 'Scanning Environment' : status === 'thinking' ? 'Scaffolding Logic' : 'Vocalizing Intent'}
        </span>
      </div>
    </div>
  );
};
