"use client";

import React, { useState } from 'react';
import { generateCode, CodeGenerationOutput } from '@/ai/flows/code-generation-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CodeXml, 
  Terminal, 
  Cpu, 
  Zap, 
  Play, 
  Save, 
  Copy, 
  Loader2, 
  CheckCircle2, 
  BrainCircuit,
  FileCode,
  Video
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export const CodeLab: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeGenerationOutput | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    try {
      const data = await generateCode({ goal });
      setResult(data);
      toast({ title: "Code Synthesized", description: "PhD-level implementation ready for deployment." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.code);
      toast({ title: "Copied", description: "Code buffer synchronized to clipboard." });
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 overflow-hidden">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl backdrop-blur-md flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <CodeXml className="h-5 w-5" /> Brockston Code Lab
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            PhD-Level Code Synthesis | High-Quality validated Implementations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-accent border-accent/20 font-code text-[8px] uppercase">
            Python 3.11+ Validated
          </Badge>
          <Badge variant="outline" className="text-accent border-accent/20 font-code text-[8px] uppercase">
            Scikit-Learn / PyTorch Ready
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">
        {/* Input Panel */}
        <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 system-log">
          <Card className="bg-card/50 border-white/5 border-accent/20 shadow-2xl">
            <CardHeader className="py-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <BrainCircuit className="h-3 w-3 text-accent" /> Define Goal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-black/40 rounded border border-white/5 font-code text-[9px] text-secondary/60">
                <div className="flex items-center gap-2 mb-1">
                  <Terminal className="h-3 w-3" /> EXAMPLES
                </div>
                - "Generate a FastAPI app with JWT auth"<br/>
                - "Create a video processor using OpenCV"<br/>
                - "Implement a Transformer model in PyTorch"
              </div>
              <Textarea 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="Describe your PhD-level coding goal..."
                className="min-h-[200px] bg-primary/10 border-white/10 text-xs font-mono focus-visible:ring-accent resize-none"
              />
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !goal}
                className="w-full bg-accent text-accent-foreground font-headline uppercase tracking-tighter h-12 shadow-[0_0_20px_rgba(0,255,127,0.2)] group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Synthesizing Logic...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2 group-hover:scale-125 transition-transform" />
                    Execute Generator
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-white/5 border-accent/10">
            <CardHeader className="py-2 px-4 border-b border-white/5">
              <div className="text-[9px] uppercase font-code text-accent/60 flex items-center gap-2">
                <Cpu className="h-3 w-3" /> Core Capabilities
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <CapabilityItem label="REST API / Microservices" />
              <CapabilityItem label="Neural / Transformer Models" />
              <CapabilityItem label="OpenCV / Video Processing" />
              <CapabilityItem label="Algorithm Optimization" />
            </CardContent>
          </Card>
        </section>

        {/* Output Panel */}
        <section className="lg:col-span-8 flex flex-col min-h-0">
          <Card className="bg-black/40 border-white/5 h-full flex flex-col overflow-hidden">
            <CardHeader className="border-b border-white/5 py-3 bg-accent/5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                <FileCode className="h-3 w-3 text-accent" /> Synthesis Output
              </CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-accent/60 hover:text-accent" onClick={copyToClipboard}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-accent/60 hover:text-accent">
                    <Save className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0 relative">
              {result ? (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-white/5 bg-primary/5">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">Complexity: {result.complexity}</Badge>
                      <span className="text-[9px] font-code text-secondary/40 flex items-center gap-1">
                        <CheckCircle2 className="h-2 w-2 text-accent" /> VALIDATED
                      </span>
                    </div>
                    <p className="text-[10px] text-foreground/80 italic leading-relaxed">
                      "{result.explanation}"
                    </p>
                  </div>
                  <div className="flex-1 overflow-auto p-4 system-log font-code text-[11px] bg-black/60 selection:bg-accent/30 selection:text-accent">
                    <pre className="text-accent/90 whitespace-pre-wrap">{result.code}</pre>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                  <CodeXml className="h-16 w-16 mb-2" />
                  <div className="space-y-1">
                    <p className="font-code text-sm uppercase tracking-widest">Awaiting Goal Parameters</p>
                    <p className="text-[10px] font-code px-12">"PhD-level AI system ready for validated code generation."</p>
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

function CapabilityItem({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between text-[9px] font-code">
      <span className="text-secondary/60">{label}</span>
      <div className="h-1 w-1 rounded-full bg-accent shadow-[0_0_5px_rgba(0,255,127,0.8)]" />
    </div>
  );
}
