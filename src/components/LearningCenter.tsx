
"use client";

import React, { useState, useMemo } from 'react';
import { learnTopic, LearningOutput } from '@/ai/flows/autonomous-learning-flow';
import { useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, doc, setDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BookOpen, Zap, Loader2, Sparkles, Brain, Code, Microscope, Binary } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const DOMAINS = [
  { id: 'neurodivergency', name: 'Neurodivergency', icon: Brain, color: 'text-emerald-400' },
  { id: 'neurology', name: 'Neurology', icon: Microscope, color: 'text-blue-400' },
  { id: 'master_coding', name: 'Master Coding', icon: Code, color: 'text-orange-400' },
  { id: 'ai_development', name: 'AI Development', icon: Zap, color: 'text-accent' },
  { id: 'mathematics', name: 'Mathematics', icon: Binary, color: 'text-purple-400' },
];

const SUBTOPICS: Record<string, string[]> = {
  neurodivergency: ["Autism Spectrum", "Sensory Processing", "Assistive Tech"],
  neurology: ["Dementia Care", "Cognitive Decline", "Emotional Regulation"],
  master_coding: ["System Design Mastery", "Code Architecture Genius", "Performance Expert"],
  ai_development: ["Neuro-Symbolic Logic", "Hybrid Systems", "Ethical AI"],
  mathematics: ["Optimization Theory", "Graph Theory", "Probabilistic Models"],
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
    limit(10)
  ), [db]);
  const { data: insights } = useCollection<any>(insightsQuery);

  const handleLearn = async () => {
    setLoading(true);
    const subtopics = SUBTOPICS[activeDomain];
    const subtopic = subtopics[Math.floor(Math.random() * subtopics.length)];

    try {
      const result = await learnTopic({ domain: activeDomain as any, subtopic });
      
      // Update mastery in Firestore
      const domainDoc = doc(db, 'knowledge_domains', activeDomain);
      const currentMastery = masteryData?.find(d => d.id === activeDomain)?.mastery_level || 0;
      const newMastery = Math.min(1.0, currentMastery + result.mastery_boost);

      await setDoc(domainDoc, {
        domain: activeDomain,
        mastery_level: newMastery,
        last_update: serverTimestamp()
      }, { merge: true });

      // Log insight
      await addDoc(collection(db, 'learned_insights'), {
        topic: subtopic,
        domain: activeDomain,
        insight: result.generated_insight,
        timestamp: serverTimestamp()
      });

      // Update global core state
      await setDoc(doc(db, 'cognitive_core', 'main-bridge'), {
        independence_confidence: newMastery * 0.85 // Map mastery to confidence
      }, { merge: true });

      toast({
        title: "Knowledge Acquired",
        description: `Brockston mastered ${subtopic} in the ${activeDomain} domain.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Learning Interrupted",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Domain Mastery Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm uppercase tracking-widest text-accent flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Domain Mastery Center
              </CardTitle>
              <CardDescription className="text-xs">Neuro-Symbolic Self-Improvement System</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {DOMAINS.map((domain) => {
                  const mastery = masteryData?.find(d => d.id === domain.id)?.mastery_level || 0;
                  return (
                    <div 
                      key={domain.id} 
                      onClick={() => setActiveDomain(domain.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all",
                        activeDomain === domain.id 
                          ? "bg-accent/10 border-accent/40 shadow-[0_0_10px_rgba(0,255,127,0.1)]" 
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
                      <Progress value={mastery * 100} className="h-1 bg-primary/20" />
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={handleLearn} 
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/80 glow-accent group h-12"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Zap className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />}
                Trigger Autonomous Research
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-[10px] text-accent font-code mb-2">
                <BookOpen className="h-3 w-3" /> Learning Principle
              </div>
              <p className="text-[10px] text-secondary leading-relaxed italic">
                "Neuro-symbolic integration: Neural embeddings for research, symbolic rules for retention. Every lesson must serve human dignity."
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Insight Stream */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col">
            <CardHeader className="py-4 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Sparkles className="h-3 w-3 text-accent" /> Autonomous Insights Log</span>
                <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">Lived Truth Derived</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 system-log space-y-3 font-code text-[11px]">
              {insights?.map((insight, i) => (
                <div key={i} className="p-3 bg-primary/10 rounded-lg border border-white/5 animate-in slide-in-from-right-2 duration-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-accent/40">[{new Date(insight.timestamp).toLocaleTimeString()}]</span>
                    <Badge variant="outline" className="text-[8px] uppercase border-accent/20 text-accent/60">
                      {insight.domain}
                    </Badge>
                  </div>
                  <div className="text-secondary/60 text-[9px] mb-1 font-bold">TOPIC: {insight.topic}</div>
                  <div className="text-foreground/90 italic leading-relaxed">"{insight.insight}"</div>
                </div>
              ))}
              {!insights?.length && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <GraduationCap className="h-12 w-12 mb-4" />
                  <p>Awaiting Autonomous Session...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
