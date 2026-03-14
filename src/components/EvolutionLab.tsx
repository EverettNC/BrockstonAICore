"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { EvolutionaryAI, NeuralNetIndividual } from '@/lib/evolutionary-ai';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dna, Zap, RefreshCw, Trophy, Activity, BrainCircuit, Loader2, Save, History, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const EvolutionLab: React.FC = () => {
  const db = useFirestore();
  const { toast } = useToast();
  const [engine] = useState(() => new EvolutionaryAI(20, 10, 5));
  const [generation, setGeneration] = useState(1);
  const [bestFitness, setBestFitness] = useState(0);
  const [evolving, setEvolving] = useState(false);
  const [fittestHistory, setFittestHistory] = useState<any[]>([]);

  const q = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'fittest_models'), orderBy('timestamp', 'desc'), limit(10));
  }, [db]);

  useEffect(() => {
    if (!db || !q) return;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const models = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFittestHistory(models);
    });
    return () => unsubscribe();
  }, [db, q]);

  const handleEvolve = async () => {
    setEvolving(true);
    // Artificial delay to show processing
    await new Promise(r => setTimeout(r, 500));
    
    engine.evolveStep();
    setGeneration(engine.generation);
    if (engine.bestFittest) {
      setBestFitness(engine.bestFittest.fitness);
    }
    setEvolving(false);
  };

  const handlePersist = async () => {
    if (!engine.bestFittest || !db) return;
    try {
      await addDoc(collection(db, 'fittest_models'), {
        generation: engine.generation,
        fitness: engine.bestFittest.fitness,
        num_layers: engine.bestFittest.numLayers,
        neurons_per_layer: engine.bestFittest.neuronsPerLayer,
        timestamp: serverTimestamp()
      });
      toast({ title: "Elite Preserved", description: `Generation ${engine.generation} champion saved to Root.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Persistence Error", description: e.message });
    }
  };

  const bestInd = engine.bestFittest;

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-y-auto system-log pr-2">
      <header className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex justify-between items-center backdrop-blur-md">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-emerald-400 flex items-center gap-2">
            <Dna className={cn("h-5 w-5", evolving && "animate-spin")} /> Evolution Lab v1.0
          </h2>
          <p className="text-[10px] font-code text-emerald-200/40 uppercase mt-1">
            Autonomous Neural Breeding | Fitness-Based Selection | Axiom 3 Compliant
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 font-code text-[8px] animate-pulse">
            GEN: {generation}
          </Badge>
          <Button 
            onClick={handlePersist} 
            disabled={!bestInd}
            variant="outline" 
            size="sm" 
            className="h-7 text-[8px] uppercase font-code border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Save className="h-3 w-3 mr-1" /> Persist Elite
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1">
        {/* Population Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card className="bg-card/50 border-white/5 border-emerald-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Zap className="h-32 w-32 text-emerald-400" />
            </div>
            <CardHeader className="border-b border-white/5 bg-emerald-500/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <Activity className="h-3 w-3 text-emerald-400" /> Population Monitor
              </CardTitle>
              <CardDescription className="text-[10px]">Managing {engine.populationSize} neural individuals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[8px] text-secondary/40 uppercase font-code">Average Fitness</div>
                  <div className="text-xl font-headline text-emerald-400">
                    {(engine.population.reduce((acc, ind) => acc + ind.fitness, 0) / engine.populationSize).toFixed(1)}
                  </div>
                </div>
                <div className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-1">
                  <div className="text-[8px] text-secondary/40 uppercase font-code">Mutation Rate</div>
                  <div className="text-xl font-headline text-emerald-400">
                    {(engine.mutationRate * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-code uppercase text-secondary/60">
                  <span>Evolution Progress</span>
                  <span>Peak: {bestFitness.toFixed(1)}</span>
                </div>
                <Progress value={bestFitness} className="h-1.5 bg-primary/20 [&>div]:bg-emerald-500" />
              </div>

              <Button 
                onClick={handleEvolve} 
                disabled={evolving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-headline uppercase tracking-tighter h-12 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                {evolving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    Breeding Generation {generation + 1}...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Trigger Evolve Step
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-emerald-500/10">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-code">
                <BrainCircuit className="h-3 w-3" /> ARCHITECTURAL CEILING
              </div>
              <div className="grid grid-cols-2 gap-2 text-[8px] font-code uppercase text-secondary/60">
                <div className="flex justify-between p-2 bg-black/20 rounded">
                  <span>Max Layers</span>
                  <span className="text-emerald-400">4</span>
                </div>
                <div className="flex justify-between p-2 bg-black/20 rounded">
                  <span>Max Neurons</span>
                  <span className="text-emerald-400">64</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Champion Analysis */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col relative overflow-hidden">
            <CardHeader className="border-b border-white/5 relative z-10">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                <span className="flex items-center gap-2"><Trophy className="h-3 w-3 text-emerald-400" /> Elite Individual Analysis</span>
                <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-400 uppercase">Generation Champion</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6 space-y-6 flex flex-col relative z-10">
              {bestInd ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="text-[10px] text-emerald-400/60 uppercase font-code">Fitness Score</div>
                        <div className="text-3xl font-headline text-emerald-400">{bestInd.fitness.toFixed(2)}</div>
                      </div>
                      <div className="h-12 w-12 rounded-full border border-emerald-500/20 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-emerald-500/40" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-[8px] text-secondary/40 uppercase font-code">Hidden Layers</div>
                        <div className="text-sm font-bold text-foreground">{bestInd.numLayers}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[8px] text-secondary/40 uppercase font-code">Neurons / Layer</div>
                        <div className="text-sm font-bold text-foreground">{bestInd.neuronsPerLayer}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase font-code text-secondary/40 flex items-center gap-2">
                      <History className="h-3 w-3" /> Lineage Persistence
                    </h4>
                    <div className="space-y-2 h-48 overflow-y-auto system-log pr-2">
                      {fittestHistory.map((m, i) => (
                        <div key={i} className="p-3 bg-primary/10 rounded-lg border border-white/5 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="text-[10px] font-code text-emerald-400/60">G{m.generation}</div>
                            <div className="text-[9px] text-secondary font-bold uppercase">Fitness: {m.fitness.toFixed(1)}</div>
                          </div>
                          <div className="text-[8px] font-code text-secondary/40">
                            {m.timestamp?.toDate ? new Date(m.timestamp.toDate()).toLocaleTimeString() : '...'}
                          </div>
                        </div>
                      ))}
                      {!fittestHistory.length && (
                        <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                          <TrendingUp className="h-8 w-8 mb-2" />
                          <p className="text-[9px] font-code uppercase">Awaiting Elite Selection...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <BrainCircuit className="h-16 w-16 text-emerald-500 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-code text-sm uppercase tracking-widest">Initialization Pending</p>
                    <p className="text-[10px] font-code text-secondary/60">Trigger evolution to populate the lab.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
