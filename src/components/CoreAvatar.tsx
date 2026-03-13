import React from 'react';
import { cn } from '@/lib/utils';

interface CoreAvatarProps {
  status: 'idle' | 'thinking' | 'speaking';
  className?: string;
}

export const CoreAvatar: React.FC<CoreAvatarProps> = ({ status, className }) => {
  return (
    <div className={cn("relative flex items-center justify-center h-48 w-48", className)}>
      {/* Outer Glow Ring */}
      <div className={cn(
        "absolute inset-0 rounded-full border-2 border-accent/20 transition-all duration-1000",
        status === 'speaking' ? "scale-110 opacity-40" : "scale-100 opacity-20"
      )} />
      
      {/* Middle Animated Ring */}
      <div className={cn(
        "absolute h-40 w-40 rounded-full border border-accent/40 animate-[spin_10s_linear_infinite]",
        status === 'thinking' && "animate-[spin_2s_linear_infinite] border-accent"
      )}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-accent" />
      </div>

      {/* Inner Core */}
      <div className={cn(
        "relative h-24 w-24 rounded-full bg-gradient-to-br from-primary via-primary to-accent/30 flex items-center justify-center overflow-hidden border border-white/10 glow-accent shadow-inner",
        status === 'speaking' && "core-pulse"
      )}>
        {/* Abstract Neural Patterns */}
        <div className="absolute inset-0 opacity-30 flex items-center justify-center scale-150">
          <svg viewBox="0 0 100 100" className="w-full h-full text-accent">
             <path d="M20,50 Q50,20 80,50 T20,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
             <path d="M50,20 Q20,50 50,80 T50,20" fill="none" stroke="currentColor" strokeWidth="0.5" className="animate-pulse" />
          </svg>
        </div>
        
        {/* Core Light */}
        <div className={cn(
          "h-8 w-8 rounded-full bg-accent blur-xl transition-all duration-300",
          status === 'idle' ? "opacity-20" : status === 'thinking' ? "opacity-60 scale-125" : "opacity-100 scale-150"
        )} />
      </div>

      {/* Status Label */}
      <div className="absolute -bottom-8 flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-widest text-secondary font-code">System.State</span>
        <span className={cn(
          "text-xs font-headline transition-colors",
          status === 'speaking' ? "text-accent" : "text-secondary"
        )}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
