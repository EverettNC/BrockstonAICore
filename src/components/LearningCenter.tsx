
"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { learnTopic } from '@/ai/flows/autonomous-learning-flow';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Zap,
  Loader2,
  Sparkles,
  Brain,
  Code,
  Microscope,
  Binary,
  History,
  RefreshCw,
  SearchCode,
  Flame,
  Lightbulb,
  Play,
  Square,
  Activity
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RetentionEngine } from '@/lib/retention-engine';

const DOMAINS = [
  { id: 'neurodivergency', name: 'Neurodivergency', icon: Brain, color: 'text-emerald-400', priority: 1.2 },
  { id: 'neurology', name: 'Neurology', icon: Microscope, color: 'text-blue-400', priority: 1.3 },
  { id: 'master_coding', name: 'Master Coding', icon: Code, color: 'text-orange-400', priority: 1.5 },
  { id: 'ai_development', name: 'AI Development', icon: Zap, color: 'text-accent', priority: 1.4 },
  { id: 'mathematics', name: 'Mathematics', icon: Binary, color: 'text-purple-400', priority: 1.1 },
];

const SUBTOPICS: Record<string, string[]> = {
  neurodivergency: ["Autism Spectrum", "Sensory Processing", "Assistive Tech", "Communication Patterns"],
  neurology: ["Dementia Care", "Cognitive Decline", "Emotional Regulation", "Neuro-Linguistic Patterns"],
  master_coding: ["System Design Mastery", "Code Architecture Genius", "Performance Expert", "Recursive Algorithms"],
  ai_development: ["Neuro-Symbolic Logic", "Hybrid Systems", "Ethical AI", "Cognitive Scaffolding"],
  mathematics: ["Optimization Theory", "Graph Theory", "Probabilistic Models", "Topological Spacing"],
};

export const LearningCenter: React.FC = () => {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeDomain, setActiveDomain] = useState(DOMAINS[0].id);
  const [autonomous, setAutonomous] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const autonomousRef = useRef(false);
  const domainIndexRef = useRef(0);
  // Always-fresh mastery data — avoids stale closure inside the async while loop
  const masteryRef = useRef<any[]>([]);

  const masteryQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'knowledge_domains'));
  }, [db]);
  const { data: masteryData } = useCollection<any>(masteryQuery);
  // Keep masteryRef in sync so the async loop always reads the latest Firestore values
  useEffect(() => { masteryRef.current = masteryData || []; }, [masteryData]);

  const insightsQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'learned_insights'), orderBy('timestamp', 'desc'), limit(20));
  }, [db]);
  const { data: insights } = useCollection<any>(insightsQuery);

  const memoryQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'enhanced_memory'), orderBy('next_review', 'asc'), limit(5));
  }, [db]);
  const { data: memories } = useCollection<any>(memoryQuery);

  const runLearnCycle = useCallback(async (domainId: string, masterySnapshot: any[]) => {
    const domainInfo = DOMAINS.find(d => d.id === domainId)!;
    const currentMastery = masterySnapshot?.find(d => d.id === domainId)?.mastery_level || 0;
    const subtopics = SUBTOPICS[domainId];
    const subtopic = subtopics[Math.floor(Math.random() * subtopics.length)];

    setCurrentActivity(`${domainInfo.name} → ${subtopic}`);

    const result = await learnTopic({ domain: domainId as any, subtopic });

    if (db) {
      const newMastery = Math.min(1.0, currentMastery + result.mastery_boost);
      await setDoc(doc(db, 'knowledge_domains', domainId), {
        domain: domainId,
        mastery_level: newMastery,
        last_update: serverTimestamp()
      }, { merge: true });

      const memoryId = `mem_${Date.now()}`;
      await setDoc(doc(db, 'enhanced_memory', memoryId), {
        topic: subtopic,
        domain: domainId,
        content: result.summary,
        last_review: Date.now(),
        interval: 3600,
        next_review: Date.now() + 3600 * 1000,
        mastery: 0.8,
        importance: domainInfo.priority
      });

      const insight = RetentionEngine.deriveHybridInsight({
        id: memoryId,
        topic: subtopic,
        domain: domainId,
        content: result.summary,
        last_review: Date.now(),
        interval: 3600,
        mastery: 0.8,
        importance: domainInfo.priority
      });

      await addDoc(collection(db, 'learned_insights'), {
        topic: subtopic,
        domain: domainId,
        insight: result.generated_insight,
        reflection: insight,
        timestamp: serverTimestamp()
      });
    }

    return subtopic;
  }, [db]);

  // Autonomous loop — cycles all domains by priority, never stops until told
  useEffect(() => {
    if (!autonomous) return;
    autonomousRef.current = true;

    const loop = async () => {
      while (autonomousRef.current) {
        // Sort domains by score: priority * (1 - mastery) — lowest mastery + highest priority goes first
        const ranked = [...DOMAINS].sort((a, b) => {
          const mastA = masteryData?.find(d => d.id === a.id)?.mastery_level || 0;
          const mastB = masteryData?.find(d => d.id === b.id)?.mastery_level || 0;
          return (b.priority * (1 - mastB)) - (a.priority * (1 - mastA));
        });

        for (const domain of ranked) {
          if (!autonomousRef.current) break;
          setActiveDomain(domain.id);
          try {
            // masteryRef.current is always the latest Firebase snapshot — no stale closure
            const topic = await runLearnCycle(domain.id, masteryRef.current);
            setSessionCount(c => c + 1);
            // Brief pause between domains so the system breathes
            await new Promise(r => setTimeout(r, 3000));
          } catch (err: any) {
            console.error(`Learning cycle error (${domain.id}):`, err);
            await new Promise(r => setTimeout(r, 10000)); // back off on error
          }
        }
      }
      setCurrentActivity(null);
    };

    loop();

    return () => {
      autonomousRef.current = false;
    };
  }, [autonomous]);

  const handleLearn = async () => {
    setLoading(true);
    try {
      const topic = await runLearnCycle(activeDomain, masteryRef.current);
      toast({ title: "Cycle Complete", description: `Learned: ${topic}` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Cognitive Stall", description: error.message });
    } finally {
      setLoading(false);
      setCurrentActivity(null);
    }
  };

  const handleReview = async (memory: any) => {
    if (!db) return;
    const nextInterval = RetentionEngine.calculateNextInterval(memory.interval, true);
    await setDoc(doc(db, 'enhanced_memory', memory.id), {
      ...memory,
      last_review: Date.now(),
      interval: nextInterval,
      next_review: Date.now() + nextInterval * 1000,
    }, { merge: true });
    toast({ title: "Memory Consolidated", description: `Interval: ${Math.floor(nextInterval / 60)} min.` });
  };

  const toggleAutonomous = () => {
    if (autonomous) {
      autonomousRef.current = false;
      setAutonomous(false);
      setCurrentActivity(null);
      toast({ title: "Autonomous Mode OFF", description: `Completed ${sessionCount} learning cycles this session.` });
    } else {
      setSessionCount(0);
      setAutonomous(true);
      toast({ title: "Autonomous Mode ON", description: "Brockston is now learning continuously. All 5 domains. Local model." });
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-hidden">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Neuro-Symbolic Learning Center
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            {autonomous && currentActivity
              ? `STUDYING: ${currentActivity}`
              : 'Autonomous Self-Improvement | Spaced Repetition | Local Model'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {autonomous && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10">
              <Activity className="h-3 w-3 text-accent animate-pulse" />
              <span className="text-[10px] font-code text-accent">{sessionCount} cycles</span>
            </div>
          )}
          <Button
            onClick={toggleAutonomous}
            className={cn(
              "h-10 px-5 font-headline uppercase tracking-tighter text-xs",
              autonomous
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-accent hover:bg-accent/80 text-black shadow-[0_0_20px_rgba(0,255,127,0.3)]"
            )}
          >
            {autonomous
              ? <><Square className="h-3.5 w-3.5 mr-2" />Stop</>
              : <><Play className="h-3.5 w-3.5 mr-2" />Start Autonomous</>
            }
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">

        {/* Left: Domains */}
        <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
          <Card className="bg-card/50 border-accent/20 shadow-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Flame className="h-3 w-3 text-orange-400" /> Domain Mastery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {DOMAINS.map((domain) => {
                const mastery = masteryData?.find(d => d.id === domain.id)?.mastery_level || 0;
                const isActive = activeDomain === domain.id;
                const isStudying = autonomous && isActive;
                return (
                  <div
                    key={domain.id}
                    onClick={() => !autonomous && setActiveDomain(domain.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all relative",
                      isStudying
                        ? "bg-accent/15 border-accent/60 shadow-[0_0_20px_rgba(0,255,127,0.15)]"
                        : isActive
                        ? "bg-accent/10 border-accent/40 cursor-pointer"
                        : "bg-primary/5 border-white/5 cursor-pointer hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isStudying
                          ? <Loader2 className={cn("h-4 w-4 text-accent animate-spin")} />
                          : <domain.icon className={cn("h-4 w-4", domain.color)} />
                        }
                        <span className="text-xs font-headline uppercase tracking-tighter">{domain.name}</span>
                      </div>
                      <span className="text-[10px] font-code text-accent">{(mastery * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={mastery * 100} className="h-1 bg-primary/20 [&>div]:bg-accent" />
                  </div>
                );
              })}

              {!autonomous && (
                <Button
                  onClick={handleLearn}
                  disabled={loading}
                  className="w-full bg-accent/20 border border-accent/30 text-accent hover:bg-accent/30 h-10 font-code text-xs uppercase"
                >
                  {loading
                    ? <><Loader2 className="animate-spin h-3.5 w-3.5 mr-2" />Researching...</>
                    : <><Zap className="h-3.5 w-3.5 mr-2" />Manual Cycle</>
                  }
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Spaced Repetition Queue */}
          <Card className="bg-primary/5 border-white/5">
            <CardHeader className="py-2 px-4 border-b border-white/5">
              <div className="text-[9px] uppercase font-code text-accent/60 flex items-center gap-2">
                <History className="h-3 w-3" /> LTP Review Queue
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {memories?.map((mem, i) => (
                <div key={i} className="p-2 bg-black/40 rounded border border-white/5 flex justify-between items-center group">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-foreground truncate max-w-[150px]">{mem.topic}</div>
                    <div className="text-[8px] font-code text-secondary/40">Due: {new Date(mem.next_review).toLocaleTimeString()}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-accent/40 group-hover:text-accent" onClick={() => handleReview(mem)}>
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {!memories?.length && <div className="text-[9px] text-center text-secondary/40 py-4 italic">Queue synchronized.</div>}
            </CardContent>
          </Card>
        </section>

        {/* Right: Insights */}
        <section className="lg:col-span-8 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col overflow-hidden">
            <CardHeader className="py-4 border-b border-white/5 bg-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-accent" /> Reflection Log</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">
                  {insights?.length || 0} insights stored
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {insights?.map((insight, i) => (
                <div key={i} className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-white/5 hover:border-accent/20 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                        <Badge className="bg-accent/10 text-accent text-[8px] border-accent/20 uppercase">{insight.domain}</Badge>
                        <span className="text-[9px] text-secondary/40 font-code">{insight.topic}</span>
                      </div>
                      <span className="text-[8px] text-secondary/30 font-code">
                        {new Date(insight.timestamp?.toDate ? insight.timestamp.toDate() : Date.now()).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-foreground/85 italic leading-relaxed pl-3 border-l-2 border-accent/20 mb-2">
                      "{insight.insight}"
                    </div>
                    {insight.reflection && (
                      <div className="p-2 bg-accent/5 rounded border border-accent/10 text-[10px] text-secondary/70 flex items-start gap-2">
                        <Lightbulb className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                        <span className="italic">{insight.reflection}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!insights?.length && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <SearchCode className="h-16 w-16 mb-2" />
                  <p className="font-code text-sm uppercase tracking-widest">
                    {autonomous ? "First cycle running..." : "Hit Start Autonomous to begin."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
