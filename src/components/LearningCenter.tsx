
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { learnTopic, LearningOutput } from '@/ai/flows/autonomous-learning-flow';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc, query, orderBy, limit, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  BookOpen, 
  Zap, 
  Loader2, 
  Sparkles, 
  Brain, 
  Code, 
  Microscope, 
  Binary, 
  History, 
  RefreshCw, 
  ShieldCheck,
  SearchCode,
  Flame,
  Lightbulb
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { RetentionEngine, MemoryItem } from '@/lib/retention-engine';

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

  const masteryQuery = useMemo(() => query(collection(db, 'knowledge_domains')), [db]);
  const { data: masteryData } = useCollection<any>(masteryQuery);

  const insightsQuery = useMemo(() => query(
    collection(db, 'learned_insights'),
    orderBy('timestamp', 'desc'),
    limit(15)
  ), [db]);
  const { data: insights } = useCollection<any>(insightsQuery);

  const memoryQuery = useMemo(() => query(
    collection(db, 'enhanced_memory'),
    orderBy('next_review', 'asc'),
    limit(5)
  ), [db]);
  const { data: memories } = useCollection<any>(memoryQuery);

  const handleLearn = async () => {
    setLoading(true);
    
    // Select topic based on Score = Priority * (1 - Mastery)
    const domainInfo = DOMAINS.find(d => d.id === activeDomain)!;
    const currentMastery = masteryData?.find(d => d.id === activeDomain)?.mastery_level || 0;
    const score = RetentionEngine.calculateTopicScore(domainInfo.priority, currentMastery);

    const subtopics = SUBTOPICS[activeDomain];
    const subtopic = subtopics[Math.floor(Math.random() * subtopics.length)];

    try {
      toast({ title: "Core Research Initiated", description: `Selected: ${subtopic} (Score: ${score.toFixed(2)})` });
      
      const result = await learnTopic({ domain: activeDomain as any, subtopic });
      
      // Update mastery
      const newMastery = Math.min(1.0, currentMastery + result.mastery_boost);
      await setDoc(doc(db, 'knowledge_domains', activeDomain), {
        domain: activeDomain,
        mastery_level: newMastery,
        last_update: serverTimestamp()
      }, { merge: true });

      // Store in Enhanced Memory (Spaced Repetition)
      const memoryId = `mem_${Date.now()}`;
      await setDoc(doc(db, 'enhanced_memory', memoryId), {
        topic: subtopic,
        domain: activeDomain,
        content: result.summary,
        last_review: Date.now(),
        interval: 3600, // 1 hour initial
        next_review: Date.now() + 3600 * 1000,
        mastery: 0.8,
        importance: domainInfo.priority
      });

      // Reflection: deriving insight
      const insight = RetentionEngine.deriveHybridInsight({
        id: memoryId,
        topic: subtopic,
        domain: activeDomain,
        content: result.summary,
        last_review: Date.now(),
        interval: 3600,
        mastery: 0.8,
        importance: domainInfo.priority
      });

      await addDoc(collection(db, 'learned_insights'), {
        topic: subtopic,
        domain: activeDomain,
        insight: result.generated_insight,
        reflection: insight,
        timestamp: serverTimestamp()
      });

      toast({
        title: "Mastery Potentiated",
        description: `Brockston reached ${(newMastery * 100).toFixed(1)}% mastery in ${activeDomain}.`,
      });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Cognitive Stall", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (memory: any) => {
    const nextInterval = RetentionEngine.calculateNextInterval(memory.interval, true);
    await setDoc(doc(db, 'enhanced_memory', memory.id), {
      ...memory,
      last_review: Date.now(),
      interval: nextInterval,
      next_review: Date.now() + nextInterval * 1000,
    }, { merge: true });
    
    toast({ title: "Memory Consolidated", description: `Interval doubled to ${Math.floor(nextInterval / 60)} minutes.` });
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-hidden">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <GraduationCap className="h-5 w-5" /> Neuro-Symbolic Learning Center
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            Autonomous Self-Improvement | Spaced Repetition (LTP) | v5.5 Core
          </p>
        </div>
        <Badge variant="outline" className="text-accent border-accent/20 font-code animate-pulse text-[8px]">
          LTP KERNEL: ACTIVE
        </Badge>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">
        
        {/* Left: Domains & Learning */}
        <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 system-log">
          <Card className="bg-card/50 border-accent/20 shadow-2xl">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Flame className="h-3 w-3 text-orange-400" /> Research Curriculum
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-3">
                {DOMAINS.map((domain) => {
                  const mastery = masteryData?.find(d => d.id === domain.id)?.mastery_level || 0;
                  return (
                    <div 
                      key={domain.id} 
                      onClick={() => setActiveDomain(domain.id)}
                      className={cn(
                        "p-3 rounded-xl border transition-all relative group",
                        activeDomain === domain.id 
                          ? "bg-accent/10 border-accent/40 shadow-[0_0_15px_rgba(0,255,127,0.1)]" 
                          : "bg-primary/5 border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <domain.icon className={cn("h-4 w-4", domain.color)} />
                          <span className="text-xs font-headline uppercase tracking-tighter">{domain.name}</span>
                        </div>
                        <span className="text-[10px] font-code text-accent">{(mastery * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={mastery * 100} className="h-1 bg-primary/20 [&>div]:bg-accent" />
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={handleLearn} 
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/80 glow-accent group h-12 shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Neuro-Symbolic Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 group-hover:scale-125 transition-transform" />
                    Trigger Autonomous Research
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Spaced Repetition Queue */}
          <Card className="bg-primary/5 border-white/5 border-accent/10">
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

        {/* Right: Insights & Reflection */}
        <section className="lg:col-span-8 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col overflow-hidden">
            <CardHeader className="py-4 border-b border-white/5 bg-primary/10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-accent" /> Neuro-Symbolic Reflection Log</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent uppercase">Retention Mode: ON</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 system-log space-y-6">
              {insights?.map((insight, i) => (
                <div key={i} className="space-y-4 animate-in slide-in-from-bottom-2 duration-500 group">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-white/5 relative overflow-hidden group-hover:border-accent/30 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                        <span className="text-[10px] font-code text-accent/60">[{new Date(insight.timestamp?.toDate ? insight.timestamp.toDate() : Date.now()).toLocaleTimeString()}]</span>
                        <Badge className="bg-accent/10 text-accent text-[8px] border-accent/20 uppercase">{insight.domain}</Badge>
                      </div>
                      <span className="text-[9px] text-secondary/40 font-bold uppercase tracking-widest">TOPIC: {insight.topic}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="text-xs text-foreground/90 italic leading-relaxed pl-4 border-l-2 border-accent/20">
                        "{insight.insight}"
                      </div>
                      {insight.reflection && (
                        <div className="p-2 bg-accent/5 rounded border border-accent/10 text-[10px] text-secondary/80 flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-accent shrink-0 mt-0.5" />
                          <span className="italic">{insight.reflection}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!insights?.length && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <SearchCode className="h-16 w-16 mb-2" />
                  <p className="font-code text-sm uppercase tracking-widest">Awaiting Initial Cogitation...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
