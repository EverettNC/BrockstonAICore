"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type AvatarEmotion = 'neutral' | 'happy' | 'thinking' | 'learning' | 'excited' | 'confident' | 'curious' | 'focused';
export type AvatarStatus = 'idle' | 'thinking' | 'speaking' | 'listening';

interface CoreAvatarProps {
  status: AvatarStatus;
  emotion?: AvatarEmotion;
  className?: string;
  intelligenceLevel?: number;
  isLearning?: boolean;
  speechDuration?: number;
  videoSrc?: string;
}

const emotionImages: Record<AvatarEmotion, { idle: string; speaking?: string }> = {
  neutral: { idle: '/images/brockston-blue.jpg', speaking: '/images/brockston-champagne.jpg' },
  happy: { idle: '/images/brockston-talking-happy.png', speaking: '/images/brockston-talking-happy.png' },
  thinking: { idle: '/images/brockston-thinking.png', speaking: '/images/brockston-talking-thinking.png' },
  learning: { idle: '/images/brockston-thinking.png', speaking: '/images/brockston-talking-thinking.png' },
  excited: { idle: '/images/brockston-talking-happy.png', speaking: '/images/brockston-talking-happy.png' },
  confident: { idle: '/images/brockston-professional.jpg', speaking: '/images/brockston-champagne.jpg' },
  curious: { idle: '/images/brockston-thinking.png', speaking: '/images/brockston-talking-neutral.png' },
  focused: { idle: '/images/brockston-neutral.png', speaking: '/images/brockston-talking-neutral.png' },
};

export const CoreAvatar: React.FC<CoreAvatarProps> = ({
  status,
  emotion = 'neutral',
  className,
  isLearning = false,
  speechDuration,
  videoSrc,
}) => {
  const [lipSyncOpen, setLipSyncOpen] = useState(false);

  useEffect(() => {
    if (status === 'speaking') {
      const intervalMs = speechDuration
        ? Math.max(100, Math.min(300, Math.round(speechDuration / 30)))
        : 200;
      const interval = setInterval(() => {
        setLipSyncOpen(prev => !prev);
      }, intervalMs);
      return () => clearInterval(interval);
    }
  }, [status, speechDuration]);

  const imageSrc = status === 'speaking' && emotionImages[emotion].speaking
    ? emotionImages[emotion].speaking
    : emotionImages[emotion].idle;

  return (
    <div className={cn("relative w-full aspect-[3/4] overflow-hidden rounded-2xl", className)}>
      {videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      ) : (
        <Image
          src={imageSrc}
          alt="BROCKSTON C"
          fill
          className="object-cover object-top"
          priority
          unoptimized
        />
      )}
    </div>
  );
};
