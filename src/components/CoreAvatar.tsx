
"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  const brockstonImage = PlaceHolderImages.find(img => img.id === 'brockston-avatar');

  return (
    <div className={cn("relative flex items-center justify-center h-48 w-48", className)}>
      {/* Outer Glow Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-accent/20 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-40 shadow-[0_0_40px_rgba(0,255,127,0.5)]" : "scale-100 opacity-20"
      )} />
      
      {/* Middle Animated Ring */}
      <div className={cn(
        "absolute inset-2 rounded-full border border-accent/40 animate-[spin_15s_linear_infinite]",
        status === 'thinking' && "animate-[spin_3s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_15px_rgba(0,255,127,0.9)]" />
      </div>

      {/* Inner Core / Brockston Portrait */}
      <div className={cn(
        "relative h-full w-full rounded-full bg-gradient-to-br from-primary via-primary to-accent/10 flex items-center justify-center overflow-hidden border-2 border-white/10 glow-accent shadow-2xl transition-all duration-500",
        status === 'speaking' && "core-pulse border-accent/40"
      )}>
        {brockstonImage ? (
          <Image 
            src={brockstonImage.imageUrl} 
            alt="Brockston - The Teacher" 
            fill 
            className={cn(
              "object-cover transition-all duration-700",
              status === 'thinking' ? "opacity-60 grayscale-[0.5]" : "opacity-100 grayscale-0"
            )}
            data-ai-hint={brockstonImage.imageHint}
          />
        ) : (
          <div className="text-accent font-headline text-2xl">B</div>
        )}
        
        {/* Status Overlay Light */}
        <div className={cn(
          "absolute inset-0 bg-accent/10 pointer-events-none transition-opacity duration-300",
          status === 'idle' ? "opacity-0" : status === 'thinking' ? "opacity-20" : "opacity-40"
        )} />
      </div>

      {/* Status Label */}
      <div className="absolute -bottom-12 flex flex-col items-center whitespace-nowrap">
        <span className="text-[8px] uppercase tracking-[0.3em] text-accent font-bold animate-pulse">Teacher Presence: ACTIVE</span>
        <span className={cn(
          "text-[10px] font-headline tracking-[0.2em] transition-colors duration-300 mt-1",
          status === 'speaking' ? "text-accent animate-pulse" : "text-secondary/60"
        )}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
