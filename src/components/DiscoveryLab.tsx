
"use client";

import React, { useState } from 'react';
import { collaborativeDiscovery, DiscoveryOutput } from '@/ai/flows/collaborative-discovery-flow';
import { useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Microscope, Beaker, FileText, Lightbulb, Loader2, Save, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const DiscoveryLab: React.FC = () => {
  const [insight, setInsight] = useState('');
  const [area, setArea] = useState<any>('autism_treatments');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiscoveryOutput | null>(null);
  
  const db = useFirestore();
  const { toast } = useToast();

  const handleDiscovery = async () => {
    if (!insight.trim()) return;
    setLoading(true);
    try {
      const data = await collaborativeDiscovery({
        everettInsight: insight,
        researchArea: area
      });
      setResult(data);
      
      // Persist to HIPAA-logged Research collection
      if (db) await addDoc(collection(db, 'research_discoveries'), {
        ...data,
        insight,
        research_area: area,
        timestamp: serverTimestamp(),
        contributor: "Everett N. Christman"
      });

      toast({
        title: "Discovery Logged",
        description: "Your joint breakthrough has been persisted to the secure vault.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Analysis Failure",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        
        {/* Input Panel */}
        <section className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2 system-log">
          <Card className="bg-card/50 border-white/5 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-accent">
                <Microscope className="h-4 w-4" /> Collaborative Discovery Lab
              </CardTitle>
              <CardDescription className="text-xs">
                Derek C & Everett Christman: Joint Hypothesis Generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-code text-secondary/60">Research Domain</label>
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger className="bg-primary/20 border-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autism_treatments">Autism Treatments (2025)</SelectItem>
                    <SelectItem value="alzheimers_breakthroughs">Alzheimer's Breakthroughs</SelectItem>
                    <SelectItem value="nonverbal_communication">Non-Verbal AAC/Speech</SelectItem>
                    <SelectItem value="neurodiversity_paradigm">Neurodiversity Advocacy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-code text-secondary/60">Everett's Visionary Insight</label>
                <Textarea 
                  placeholder="Share a pattern, observation, or question..."
                  className="min-h-[200px] bg-primary/10 border-white/5 resize-none focus-visible:ring-accent"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleDiscovery} 
                disabled={loading || !insight}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/80 glow-accent"
              >
                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Beaker className="h-4 w-4 mr-2" />}
                Trigger Derek's Analysis
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/30 border-white/5">
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-accent font-code">
                <Lightbulb className="h-3 w-3" /> TIP: Neural Connections
              </div>
              <p className="text-[10px] text-secondary leading-relaxed">
                Try connecting 2025 breakthroughs (like Leucovorin) with your personal observations of non-verbal sensory patterns. Derek's graph is optimized for cross-domain discovery.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Output Panel */}
        <section className="lg:col-span-7 flex flex-col min-h-0">
          <Card className="bg-black/20 border-white/5 h-full flex flex-col">
            <CardHeader className="flex-none border-b border-white/5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-headline tracking-tighter uppercase flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" /> Discovery Documentation
                </CardTitle>
                {result && (
                  <Badge className="bg-accent/20 text-accent border-accent/20">
                    Publication Potential: {result.publicationPotential.potential}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 system-log">
              {!result && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Microscope className="h-12 w-12 mb-4 text-secondary" />
                  <p className="text-sm font-code">Awaiting collaborative trigger...</p>
                  <p className="text-[10px] uppercase mt-2">Derek C is idle.</p>
                </div>
              ) : loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-xs font-code animate-pulse">Derek is scanning knowledge graph (v2025.11)...</p>
                </div>
              ) : result ? (
                <div className="space-y-8 animate-in fade-in duration-700">
                  {/* Analysis Segment */}
                  <div>
                    <h3 className="text-[10px] uppercase font-code text-accent mb-3 flex items-center gap-2">
                      <Save className="h-3 w-3" /> Derek's Neural Analysis
                    </h3>
                    <div className="text-sm text-foreground/90 leading-relaxed font-body bg-primary/10 p-4 rounded-lg border border-white/5 whitespace-pre-wrap">
                      {result.analysis}
                    </div>
                  </div>

                  {/* Hypotheses Segment */}
                  <div>
                    <h3 className="text-[10px] uppercase font-code text-accent mb-3">Generated Hypotheses</h3>
                    <div className="grid gap-3">
                      {result.hypotheses.map((h, i) => (
                        <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-accent/20 transition-colors group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[9px] uppercase font-bold text-secondary/60">{h.type.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-[8px] opacity-60 uppercase">{h.impactPotential} Impact</Badge>
                          </div>
                          <p className="text-xs font-semibold text-accent group-hover:translate-x-1 transition-transform">{h.hypothesis}</p>
                          <p className="text-[10px] text-secondary mt-1 italic">Rationale: {h.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Publication & Next Steps */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-[10px] uppercase font-code text-accent mb-3">Publication Venue</h3>
                      <div className="space-y-2">
                        {result.publicationPotential.suggestedVenues.map((v, i) => (
                          <div key={i} className="text-[10px] text-foreground/70 flex items-center gap-2">
                            <div className="h-1 w-1 rounded-full bg-accent" /> {v}
                          </div>
                        ))}
                        <p className="text-[9px] text-secondary mt-2">Timeline: {result.publicationPotential.timeline}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] uppercase font-code text-accent mb-3">Recommended Next Steps</h3>
                      <ul className="space-y-2">
                        {result.nextSteps.map((step, i) => (
                          <li key={i} className="text-[10px] text-foreground/70 leading-snug">
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};
