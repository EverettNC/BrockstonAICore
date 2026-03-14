
"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  const brockstonImage = PlaceHolderImages.find(img => img.id === 'brockston-avatar');

  return (
    <div className={cn("relative flex items-center justify-center h-96 w-96 md:h-[500px] md:w-[500px]", className)}>
      {/* Outer Glow Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-4 border-accent/20 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-60 shadow-[0_0_80px_rgba(0,255,127,0.7)]" : "scale-100 opacity-30"
      )} />
      
      {/* Middle Animated Ring */}
      <div className={cn(
        "absolute inset-4 rounded-full border-2 border-accent/40 animate-[spin_20s_linear_infinite]",
        status === 'thinking' && "animate-[spin_4s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-accent shadow-[0_0_20px_rgba(0,255,127,0.9)]" />
      </div>

      {/* Inner Core / Brockston Portrait */}
      <div className={cn(
        "relative h-full w-full rounded-full bg-gradient-to-br from-primary via-primary to-accent/10 flex items-center justify-center overflow-hidden border-4 border-white/10 glow-accent shadow-2xl transition-all duration-500",
        (status === 'speaking' || status === 'thinking') && "core-pulse border-accent/60"
      )}>
        {brockstonImage ? (
          <Image 
            src={brockstonImage.imageUrl} 
            alt="Brockston - The New Teacher" 
            fill 
            className={cn(
              "object-cover object-center transition-all duration-700 hover:scale-110",
              status === 'thinking' ? "opacity-80 scale-105" : "opacity-100 grayscale-0"
            )}
            data-ai-hint={brockstonImage.imageHint}
            priority
          />
        ) : (
          <div className="text-accent font-headline text-4xl">B</div>
        )}
        
        {/* Status Overlay Light */}
        <div className={cn(
          "absolute inset-0 bg-accent/10 pointer-events-none transition-opacity duration-300",
          status === 'idle' ? "opacity-0" : status === 'thinking' ? "opacity-20" : "opacity-40"
        )} />
      </div>

      {/* Simplified Status Label */}
      <div className="absolute -bottom-12 flex flex-col items-center whitespace-nowrap z-20">
        <span className={cn(
          "text-lg font-headline tracking-[0.4em] transition-colors duration-300",
          status === 'speaking' ? "text-accent animate-pulse" : "text-secondary/60"
        )}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
