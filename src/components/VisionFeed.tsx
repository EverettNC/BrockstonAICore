"use client";

import React, { useRef, useEffect, useState } from 'react';
import { analyzeVision } from '@/ai/flows/vision-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Shield, Activity, Camera, Loader2, AlertCircle, Scan, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { BehaviorType } from '@/lib/behavioral-interpreter';
import { visionContext } from '@/lib/vision-context';

export const VisionFeed: React.FC = () => {
  const db = useFirestore();
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

      // Ported Behavioral Mapping
      let behaviorType: BehaviorType = "unknown";
      const posture = result.posture_analysis.toLowerCase();
      const emotion = result.emotion_detected.toLowerCase();

      if (posture.includes('stress') || posture.includes('fidget')) behaviorType = "gesture:stimming";
      else if (posture.includes('nod')) behaviorType = "gesture:nod";
      else if (emotion.includes('happy') || emotion.includes('joy')) behaviorType = "symbol:happy";
      else if (emotion.includes('sad') || emotion.includes('pain')) behaviorType = "symbol:sad";
      else if (posture.includes('gaze') || posture.includes('staring')) behaviorType = "eye_tracking:sustained_gaze";

      // PUSH TO VISION CONTEXT (Rolling Window)
      visionContext.push(result.description, behaviorType, 0.92);

      addDoc(collection(db, 'behavioral_history'), {
        type: behaviorType,
        intensity: 0.75,
        context: { source: 'vision_system', scene: result.description, safety: result.safety_status },
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Perception Synchronized",
        description: `Visual core detected ${behaviorType.split(':')[1]} state.`,
      });

    } catch (err: any) {
      toast({ variant: "destructive", title: "Vision Failure", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700 overflow-y-auto system-log pr-2 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        <section className="lg:col-span-7 flex flex-col">
          <Card className="bg-black/40 border-white/5 overflow-hidden flex-1 flex flex-col shadow-2xl">
            <CardHeader className="py-3 px-4 border-b border-white/5 bg-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-accent flex items-center justify-between">
                <span className="flex items-center gap-2"><Eye className="h-3 w-3" /> Live Visual Cortex</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent animate-pulse">Neural Link Sync</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative aspect-video bg-black flex-1">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover opacity-80" 
                autoPlay 
                muted 
              />
              <div className="absolute inset-0 pointer-events-none border-[20px] border-accent/5" />
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

              {!hasCameraPermission && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center z-20">
                  <Alert variant="destructive" className="max-w-xs bg-red-950/20 border-red-500/20">
                    <AlertTitle className="text-red-400 font-headline uppercase tracking-tighter">Vision Offline</AlertTitle>
                    <AlertDescription className="text-red-200/60 font-code text-[10px]">
                      Please allow camera access to activate Brockston's visual cortex and enable behavioral pattern recognition.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
              
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button 
                  onClick={captureAndAnalyze} 
                  disabled={!hasCameraPermission || loading}
                  size="sm" 
                  className="bg-accent text-accent-foreground glow-accent hover:scale-105 transition-transform"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4 mr-2" />}
                  Trigger Perception
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20 shadow-xl transition-all hover:bg-card/60">
            <CardHeader className="py-3 bg-accent/5 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Shield className="h-3 w-3 text-accent" /> Perception Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {analysis ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-code text-accent/60 flex items-center gap-1">
                      <Activity className="h-2 w-2" /> Scene Context
                    </label>
                    <p className="text-xs leading-relaxed italic text-foreground/90 font-body bg-primary/20 p-3 rounded-lg border border-white/5">
                      "{analysis.description}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-primary/20 rounded-lg border border-white/5 hover:border-accent/30 transition-colors">
                      <div className="text-[8px] text-secondary/60 uppercase font-code mb-1">Detected Emotion</div>
                      <div className="text-xs text-accent font-bold uppercase tracking-widest">{analysis.emotion_detected}</div>
                    </div>
                    <div className="p-3 bg-primary/20 rounded-lg border border-white/5 hover:border-accent/30 transition-colors">
                      <div className="text-[8px] text-secondary/60 uppercase font-code mb-1">Safety Assessment</div>
                      <div className="text-xs text-accent font-bold uppercase tracking-widest">{analysis.safety_status}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase font-code text-accent/60">Posture Analysis</label>
                    <p className="text-[11px] text-foreground/80 leading-relaxed font-code bg-black/40 p-3 rounded-lg">
                      {analysis.posture_analysis}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center opacity-20 group">
                  <Eye className="h-12 w-12 mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-[10px] uppercase font-code tracking-[0.2em]">Awaiting Perception Trigger</p>
                  <p className="text-[8px] mt-2 font-code">Click 'Trigger Perception' to start scanning.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-accent/10">
            <CardHeader className="py-2 border-b border-white/5">
              <CardTitle className="text-[9px] uppercase font-code text-accent/60 flex items-center gap-2">
                <History className="h-3 w-3" /> Recent Context window
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              {visionContext.snapshot().events.map((ev, i) => (
                <div key={i} className="flex justify-between items-center text-[8px] font-code text-secondary/60 border-b border-white/5 pb-1 last:border-0">
                  <span className="truncate max-w-[150px]">{ev.description}</span>
                  <span className="text-accent">{(ev.confidence * 100).toFixed(0)}%</span>
                </div>
              ))}
              {visionContext.snapshot().count === 0 && (
                <p className="text-[8px] text-secondary/40 text-center italic">No vision events in span.</p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
