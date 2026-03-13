
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
        status === 'speaking' ? "scale-110 opacity-40 shadow-[0_0_30px_rgba(0,255,127,0.4)]" : "scale-100 opacity-20"
      )} />
      
      {/* Middle Animated Ring */}
      <div className={cn(
        "absolute h-40 w-40 rounded-full border border-accent/40 animate-[spin_15s_linear_infinite]",
        status === 'thinking' && "animate-[spin_3s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgba(0,255,127,0.8)]" />
      </div>

      {/* Inner Core / Brockston Portrait */}
      <div className={cn(
        "relative h-32 w-32 rounded-full bg-gradient-to-br from-primary via-primary to-accent/10 flex items-center justify-center overflow-hidden border-2 border-white/10 glow-accent shadow-2xl transition-all duration-500",
        status === 'speaking' && "core-pulse border-accent/40"
      )}>
        {brockstonImage ? (
          <Image 
            src={brockstonImage.imageUrl} 
            alt="Brockston - The Teacher" 
            fill 
            className={cn(
              "object-cover transition-opacity duration-500",
              status === 'thinking' ? "opacity-70" : "opacity-100"
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
      <div className="absolute -bottom-10 flex flex-col items-center">
        <span className="text-[8px] uppercase tracking-[0.2em] text-secondary/60 font-code">Teacher Presence: ACTIVE</span>
        <span className={cn(
          "text-[10px] font-headline tracking-widest transition-colors duration-300",
          status === 'speaking' ? "text-accent animate-pulse" : "text-secondary"
        )}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
