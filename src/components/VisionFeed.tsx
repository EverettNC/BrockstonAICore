"use client";

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { analyzeVision } from '@/ai/flows/vision-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Shield, Activity, Camera, Loader2, AlertCircle, Scan, History, Sparkles, MessageSquareQuote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { VisionPerception } from '@/lib/vision-perception';
import { visionContext } from '@/lib/vision-context';
import { BehavioralInterpreter } from '@/lib/behavioral-interpreter';

export const VisionFeed: React.FC = () => {
  const db = useFirestore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [perceptionResult, setPerceptionResult] = useState<any>(null);
  const [enhancedResponse, setEnhancedResponse] = useState<string>('');
  const { toast } = useToast();

  const historyQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'behavioral_history'), orderBy('timestamp', 'desc'), limit(10));
  }, [db]);
  const { data: history } = useCollection<any>(historyQuery);

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

      // 1. Raw Neural Perception
      const result = await analyzeVision({ photoDataUri: dataUri });
      setAnalysis(result);

      // 2. Symbolic Interpretation (Vision Tier)
      const perception = VisionPerception.process(result);
      setPerceptionResult(perception);

      // 3. Temporal Sequence Analysis
      if (history) {
        const obsHistory = [...(history || [])].reverse();
        const temporalPattern = BehavioralInterpreter.analyzeTemporalSequence(obsHistory);
        const enhanced = BehavioralInterpreter.generateEnhancedResponse(temporalPattern);
        setEnhancedResponse(enhanced);
      }

      // 4. Persist Event
      const behaviorType = perception.cues.intent || "perception:general";

      if (db) {
        addDoc(collection(db, 'behavioral_history'), {
          type: behaviorType,
          intensity: perception.cues.intent ? 0.8 : 0.4,
          context: { 
            source: 'vision_system', 
            scene: result.description, 
            safety: result.safety_status,
            cues: perception.cues
          },
          timestamp: new Date().toISOString()
        });
      }

      toast({
        title: perception.cues.intent ? "Symbol Identified" : "Perception Logged",
        description: perception.cues.description || "Scene analysis synchronized with cortex.",
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
              
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />

              {!hasCameraPermission && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-6 text-center z-20">
                  <Alert variant="destructive" className="max-w-xs bg-red-950/20 border-red-500/20">
                    <AlertTitle className="text-red-400 font-headline uppercase tracking-tighter">Vision Offline</AlertTitle>
                    <AlertDescription className="text-red-200/60 font-code text-[10px]">
                      Please allow camera access to activate Brockston's visual cortex.
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
          <Card className="bg-card/50 border-white/5 border-accent/20 shadow-xl transition-all">
            <CardHeader className="py-3 bg-accent/5 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Shield className="h-3 w-3 text-accent" /> Perception Analysis</span>
                {perceptionResult?.cues.intent && (
                  <Badge className="bg-accent text-accent-foreground text-[8px] animate-bounce">
                    <Sparkles className="h-2 w-2 mr-1" /> SYMBOL: {perceptionResult.cues.description.toUpperCase()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {enhancedResponse && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg animate-in slide-in-from-top-2">
                  <div className="text-[8px] text-blue-400 uppercase font-code mb-1 flex items-center gap-1">
                    <MessageSquareQuote className="h-2 w-2" /> Enhanced Interpretation
                  </div>
                  <p className="text-xs italic text-blue-100/90">{enhancedResponse}</p>
                </div>
              )}

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
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center opacity-20 group">
                  <Eye className="h-12 w-12 mb-4" />
                  <p className="text-[10px] uppercase font-code tracking-[0.2em]">Awaiting Perception Trigger</p>
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
                  <span className={ev.intent !== "perception" ? "text-accent font-bold" : "text-secondary/40"}>
                    {(ev.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
