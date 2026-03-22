"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

export type AvatarEmotion = 'neutral' | 'happy' | 'thinking' | 'learning' | 'excited' | 'confident' | 'curious' | 'focused';
export type AvatarStatus = 'idle' | 'thinking' | 'speaking' | 'listening';

interface CoreAvatarProps {
  status: AvatarStatus;
  emotion?: AvatarEmotion;
  className?: string;
  intelligenceLevel?: number;
  isLearning?: boolean;
}

const emotionImages: Record<AvatarEmotion, { idle: string; speaking?: string }> = {
  neutral: { idle: '/images/brockston-blue.jpg', speaking: '/images/brockston-champagne.jpg' },
  happy: { idle: '/images/brockston-happy.jpg', speaking: '/images/brockston-talking-happy.png' },
  thinking: { idle: '/images/brockston-thinking.png', speaking: '/images/brockston-talking-thinking.png' },
  learning: { idle: '/images/brockston-thinking.png', speaking: '/images/brockston-talking-thinking.png' },
  excited: { idle: '/images/brockston-happy.jpg', speaking: '/images/brockston-talking-happy.png' },
  confident: { idle: '/images/brockston-professional.jpg', speaking: '/images/brockston-champagne.jpg' },
  curious: { idle: '/images/brockston-thinking.png', speaking: '/images/brockston-talking-neutral.png' },
  focused: { idle: '/images/brockston-neutral.png', speaking: '/images/brockston-talking-neutral.png' },
};

export const CoreAvatar: React.FC<CoreAvatarProps> = ({
  status,
  emotion = 'neutral',
  className,
  isLearning = false
}) => {
  const [lipSyncOpen, setLipSyncOpen] = useState(false);

  useEffect(() => {
    if (status === 'speaking') {
      const interval = setInterval(() => {
        setLipSyncOpen(prev => !prev);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [status]);

  const imageSrc = status === 'speaking' && emotionImages[emotion].speaking
    ? emotionImages[emotion].speaking
    : emotionImages[emotion].idle;

  return (
    <div className={cn("relative flex flex-col items-center justify-center gap-4", className)}>
      {/* Avatar Circle */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-accent/30 shadow-[0_0_60px_rgba(0,255,127,0.3)] bg-black">
        <Image
          src={imageSrc}
          alt="BROCKSTON C"
          fill
          className="object-cover object-top"
          priority
          unoptimized
        />

        {/* Lip Sync */}
        {status === 'speaking' && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
            <div
              className={cn(
                "bg-accent rounded-full transition-all duration-150",
                lipSyncOpen ? "w-6 h-3" : "w-4 h-1"
              )}
            />
          </div>
        )}

        {/* Emotion Badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded-full border border-accent/30">
          <span className="text-[10px] font-code text-accent uppercase">{emotion}</span>
        </div>

        {/* CORE_LINK */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-accent/80">
          <BrainCircuit className="h-3 w-3" />
          <span className="text-[9px] font-code uppercase tracking-wider">CORE_LINK</span>
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        <div className="text-3xl font-headline text-white tracking-tighter">BROCKSTON <span className="text-accent">C</span></div>
        <div className="text-[10px] font-code text-secondary/50 uppercase tracking-widest mt-1">Chief Operations Officer</div>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            status === 'speaking' ? "bg-accent animate-pulse" : "bg-accent/40"
          )} />
          <span className="text-[10px] font-code uppercase text-secondary/60">{status}</span>
        </div>
      </div>
    </div>
  );
};
