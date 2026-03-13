
"use client";

import React, { useRef, useEffect, useState } from 'react';
import { analyzeVision } from '@/ai/flows/vision-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Shield, Activity, Camera, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export const VisionFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Vision capabilities are limited without camera access.',
        });
      }
    };
    getCameraPermission();
  }, [toast]);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || loading) return;
    setLoading(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUri = canvas.toDataURL('image/jpeg');

      const result = await analyzeVision({ photoDataUri: dataUri });
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <section className="lg:col-span-7">
          <Card className="bg-black/40 border-white/5 overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center justify-between">
                <span className="flex items-center gap-2"><Eye className="h-3 w-3" /> Live Vision Feed</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">Active Monitor</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative aspect-video">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover bg-primary/10" 
                autoPlay 
                muted 
              />
              {!hasCameraPermission && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-6 text-center">
                  <Alert variant="destructive" className="max-w-xs">
                    <AlertTitle>Vision Offline</AlertTitle>
                    <AlertDescription>Please allow camera access to activate Brockston's visual cortex.</AlertDescription>
                  </Alert>
                </div>
              )}
              <div className="absolute bottom-4 right-4">
                <Button 
                  onClick={captureAndAnalyze} 
                  disabled={!hasCameraPermission || loading}
                  size="sm" 
                  className="bg-accent text-accent-foreground glow-accent"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                  Trigger Perception
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto system-log pr-2">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader className="py-3">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Shield className="h-3 w-3 text-accent" /> Perception Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-code text-secondary/60">Scene Context</label>
                    <p className="text-xs leading-relaxed italic">"{analysis.description}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-primary/20 rounded border border-white/5">
                      <div className="text-[8px] text-secondary/60 uppercase">Emotion</div>
                      <div className="text-xs text-accent font-medium">{analysis.emotion_detected}</div>
                    </div>
                    <div className="p-2 bg-primary/20 rounded border border-white/5">
                      <div className="text-[8px] text-secondary/60 uppercase">Safety</div>
                      <div className="text-xs text-accent font-medium">{analysis.safety_status}</div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-code text-secondary/60">Posture Detail</label>
                    <p className="text-xs text-foreground/80">{analysis.posture_analysis}</p>
                  </div>
                </>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center opacity-30">
                  <Activity className="h-8 w-8 mb-2" />
                  <p className="text-[10px] uppercase font-code">Awaiting Perception Trigger</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-[9px] text-accent font-code">
                <AlertCircle className="h-3 w-3" /> System Prompt: Vision
              </div>
              <p className="text-[9px] text-secondary leading-relaxed font-code italic">
                "Brockston doesn't just see pixels; he detects the soul's leakage through the eyes. Every micro-expression is a data point for self-love."
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
