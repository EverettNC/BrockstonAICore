
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
 * @fileOverview CoreAvatar - THE NEW TEACHER.
 * Styled blonde hair, blue eyes, gold champagne patterned suit.
 * The face of Dignity and Protection.
 */

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  const brockstonImage = PlaceHolderImages.find(img => img.id === 'brockston-avatar');

  return (
    <div className={cn("relative flex items-center justify-center h-[500px] w-[500px] md:h-[600px] md:w-[600px]", className)}>
      {/* Outer Glow Ring - The "Teacher Vision" */}
      <div className={cn(
        "absolute inset-0 rounded-full border-[3px] border-accent/30 transition-all duration-1000",
        status === 'speaking' ? "scale-115 opacity-80 shadow-[0_0_150px_rgba(0,255,127,1)]" : "scale-100 opacity-40 shadow-[0_0_80px_rgba(0,255,127,0.4)]"
      )} />
      
      {/* Middle Haptic Ring */}
      <div className={cn(
        "absolute inset-8 rounded-full border-2 border-accent/50 animate-[spin_60s_linear_infinite]",
        status === 'thinking' && "animate-[spin_10s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-accent shadow-[0_0_30px_rgba(0,255,127,1)]" />
      </div>

      {/* Inner Frame - THE PORTRAIT WINDOW */}
      <div className={cn(
        "relative h-full w-full rounded-full bg-gradient-to-br from-primary via-primary/40 to-accent/10 flex items-center justify-center overflow-hidden border-[12px] border-white/10 shadow-[0_0_120px_rgba(0,0,0,1)] transition-all duration-700",
        (status === 'speaking' || status === 'thinking') && "core-pulse border-accent/80 scale-[1.05]"
      )}>
        {brockstonImage ? (
          <Image 
            src={brockstonImage.imageUrl} 
            alt="Brockston C - The New Teacher" 
            fill 
            className={cn(
              "object-cover object-top transition-all duration-1000 brightness-110",
              status === 'thinking' ? "opacity-90 scale-115 saturate-[1.4]" : "opacity-100 grayscale-0 scale-110"
            )}
            data-ai-hint={brockstonImage.imageHint}
            priority
          />
        ) : (
          <div className="text-accent font-headline text-9xl">B</div>
        )}
        
        {/* High-Fidelity Ambient Light Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-accent/40 via-transparent to-transparent pointer-events-none transition-opacity duration-500",
          status === 'idle' ? "opacity-40" : status === 'thinking' ? "opacity-60" : "opacity-80"
        )} />
      </div>

      {/* Verification Status Overlay */}
      <div className="absolute bottom-12 right-12 h-24 w-24 bg-accent rounded-full border-8 border-background flex items-center justify-center shadow-2xl animate-pulse group cursor-help z-20 transition-transform hover:scale-125">
        <UserCheck className="h-12 w-12 text-accent-foreground" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[11px] font-code px-6 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 border border-accent/50 shadow-[0_0_30px_rgba(0,255,127,0.4)] flex flex-col items-center">
          <span className="font-black text-accent uppercase tracking-widest">BRIDGE_LINK: SECURE</span>
          <span className="text-[9px] opacity-70">Identity Actualized v5.0</span>
        </div>
      </div>

      {/* Floating Status Bar */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 px-16 py-5 bg-black/95 backdrop-blur-3xl rounded-full border border-accent/60 shadow-[0_0_60px_rgba(0,255,127,0.5)] z-20 whitespace-nowrap">
        <Sparkles className="h-8 w-8 text-accent animate-pulse" />
        <span className="text-[18px] font-code text-accent uppercase tracking-[0.5em] font-black">PRESENCE ACTIVE</span>
      </div>
    </div>
  );
};
