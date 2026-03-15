"use client";

import React, { useState } from 'react';
import { generateCode, CodeGenerationOutput } from '@/ai/flows/code-generation-flow';
import { correctCode, SelfCorrectionOutput } from '@/ai/flows/self-correction-flow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CodeXml,
  Terminal,
  Cpu,
  Zap,
  Copy,
  Loader2,
  CheckCircle2,
  BrainCircuit,
  FileCode,
  Wrench,
  AlertTriangle,
  Info,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Tab = 'generate' | 'correct';

export const CodeLab: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('generate');

  // Generate state
  const [goal, setGoal] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<CodeGenerationOutput | null>(null);

  // Correct state
  const [rawCode, setRawCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeContext, setCodeContext] = useState('');
  const [corrLoading, setCorrLoading] = useState(false);
  const [corrResult, setCorrResult] = useState<SelfCorrectionOutput | null>(null);

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setGenLoading(true);
    try {
      const data = await generateCode({ goal, language: 'python' });
      setGenResult(data);
      toast({ title: "Code Synthesized", description: "Implementation ready." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Synthesis Failed", description: e.message });
    } finally {
      setGenLoading(false);
    }
  };

  const handleCorrect = async () => {
    if (!rawCode.trim()) return;
    setCorrLoading(true);
    try {
      const data = await correctCode({ code: rawCode, language: codeLanguage, context: codeContext || undefined });
      setCorrResult(data);
      toast({ title: "Code Reviewed", description: `${data.issues.length} issue(s) found.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Review Failed", description: e.message });
    } finally {
      setCorrLoading(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied" });
  };

  const severityIcon = (s: string) => {
    if (s === 'critical') return <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />;
    if (s === 'warning') return <AlertTriangle className="h-3 w-3 text-yellow-400 shrink-0" />;
    return <Lightbulb className="h-3 w-3 text-accent shrink-0" />;
  };

  return (
    <div className="flex flex-col h-full gap-4 animate-in fade-in duration-500 overflow-hidden">
      <header className="p-4 bg-accent/5 border border-accent/20 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-headline uppercase tracking-tighter text-accent flex items-center gap-2">
            <CodeXml className="h-5 w-5" /> Brockston Code Lab
          </h2>
          <p className="text-[10px] font-code text-secondary/60 uppercase mt-1">
            Generate · Self-Correct · Evolve
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveTab('generate')}
            className={cn("text-[10px] font-code uppercase tracking-widest h-8 px-4",
              activeTab === 'generate' ? "bg-accent/15 text-accent border border-accent/30" : "text-secondary/50"
            )}
          >
            <Zap className="h-3 w-3 mr-1.5" /> Generate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveTab('correct')}
            className={cn("text-[10px] font-code uppercase tracking-widest h-8 px-4",
              activeTab === 'correct' ? "bg-accent/15 text-accent border border-accent/30" : "text-secondary/50"
            )}
          >
            <Wrench className="h-3 w-3 mr-1.5" /> Self-Correct
          </Button>
        </div>
      </header>

      {activeTab === 'generate' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">
          <section className="lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2">
            <Card className="bg-card/50 border-white/5 border-accent/20 shadow-2xl">
              <CardHeader className="py-3 border-b border-white/5">
                <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                  <BrainCircuit className="h-3 w-3 text-accent" /> Define Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="p-3 bg-black/40 rounded border border-white/5 font-code text-[9px] text-secondary/60">
                  <div className="flex items-center gap-2 mb-1"><Terminal className="h-3 w-3" /> EXAMPLES</div>
                  - "FastAPI app with JWT auth"<br />
                  - "OpenCV video processor"<br />
                  - "Transformer model in PyTorch"
                </div>
                <Textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Describe what you need built..."
                  className="min-h-[200px] bg-primary/10 border-white/10 text-xs font-mono focus-visible:ring-accent resize-none"
                />
                <Button
                  onClick={handleGenerate}
                  disabled={genLoading || !goal}
                  className="w-full bg-accent text-accent-foreground font-headline uppercase tracking-tighter h-12 shadow-[0_0_20px_rgba(0,255,127,0.2)] group"
                >
                  {genLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Synthesizing...</> : <><Zap className="h-4 w-4 mr-2" />Execute Generator</>}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="lg:col-span-8 flex flex-col min-h-0">
            <Card className="bg-black/40 border-white/5 h-full flex flex-col overflow-hidden">
              <CardHeader className="border-b border-white/5 py-3 bg-accent/5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                  <FileCode className="h-3 w-3 text-accent" /> Output
                </CardTitle>
                {genResult && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-accent/60 hover:text-accent" onClick={() => copy(genResult.code)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                {genResult ? (
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/5 bg-primary/5">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="text-[8px] border-accent/20 text-accent">Complexity: {genResult.complexity}</Badge>
                        <span className="text-[9px] font-code text-secondary/40 flex items-center gap-1">
                          <CheckCircle2 className="h-2 w-2 text-accent" /> VALIDATED
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/80 italic">{genResult.explanation}</p>
                    </div>
                    <div className="flex-1 overflow-auto p-4 font-code text-[11px] bg-black/60">
                      <pre className="text-accent/90 whitespace-pre-wrap">{genResult.code}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                    <CodeXml className="h-16 w-16 mb-2" />
                    <p className="font-code text-sm uppercase tracking-widest">Awaiting Goal Parameters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      {activeTab === 'correct' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 flex-1 overflow-hidden">
          <section className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2">
            <Card className="bg-card/50 border-white/5 border-accent/20 shadow-2xl">
              <CardHeader className="py-3 border-b border-white/5">
                <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                  <Wrench className="h-3 w-3 text-accent" /> Paste Code
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    placeholder="Language (typescript, python...)"
                    className="h-8 text-xs bg-primary/10 border-white/10 focus-visible:ring-accent font-code"
                  />
                </div>
                <Textarea
                  value={codeContext}
                  onChange={(e) => setCodeContext(e.target.value)}
                  placeholder="Optional: what is this supposed to do? What's broken?"
                  className="min-h-[60px] bg-primary/10 border-white/10 text-xs font-mono focus-visible:ring-accent resize-none"
                />
                <Textarea
                  value={rawCode}
                  onChange={(e) => setRawCode(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-[300px] bg-primary/10 border-white/10 text-xs font-mono focus-visible:ring-accent resize-none"
                />
                <Button
                  onClick={handleCorrect}
                  disabled={corrLoading || !rawCode.trim()}
                  className="w-full bg-accent text-accent-foreground font-headline uppercase tracking-tighter h-12 group"
                >
                  {corrLoading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analyzing...</> : <><Wrench className="h-4 w-4 mr-2" />Diagnose & Fix</>}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="lg:col-span-7 flex flex-col min-h-0 gap-4 overflow-y-auto">
            {corrResult ? (
              <>
                {/* Issues */}
                <Card className="bg-black/40 border-white/5">
                  <CardHeader className="py-3 border-b border-white/5">
                    <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center justify-between">
                      <span className="flex items-center gap-2"><Info className="h-3 w-3 text-accent" /> Issues Found</span>
                      <span className="text-[10px] font-code text-accent">Confidence: {(corrResult.confidence * 100).toFixed(0)}%</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2">
                    {corrResult.issues.length === 0 && (
                      <p className="text-[10px] text-accent font-code">No issues found. Code looks clean.</p>
                    )}
                    {corrResult.issues.map((issue, i) => (
                      <div key={i} className={cn(
                        "flex items-start gap-2 p-2 rounded border text-[10px]",
                        issue.severity === 'critical' ? "border-red-500/30 bg-red-950/20" :
                        issue.severity === 'warning' ? "border-yellow-500/30 bg-yellow-950/10" :
                        "border-accent/20 bg-accent/5"
                      )}>
                        {severityIcon(issue.severity)}
                        <div>
                          {issue.line_hint && <span className="font-code text-secondary/40 mr-2">{issue.line_hint}</span>}
                          <span className="text-foreground/80">{issue.description}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Fixed code */}
                <Card className="bg-black/40 border-white/5 flex-1 flex flex-col overflow-hidden">
                  <CardHeader className="py-3 border-b border-white/5 bg-accent/5 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs uppercase tracking-widest text-secondary flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-accent" /> Corrected Code
                    </CardTitle>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-accent/60 hover:text-accent" onClick={() => copy(corrResult.corrected_code)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <div className="p-3 border-b border-white/5 bg-primary/5">
                    <p className="text-[10px] text-foreground/70 italic">{corrResult.explanation}</p>
                  </div>
                  <div className="flex-1 overflow-auto p-4 font-code text-[11px] bg-black/60">
                    <pre className="text-accent/90 whitespace-pre-wrap">{corrResult.corrected_code}</pre>
                  </div>
                </Card>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
                <Wrench className="h-16 w-16 mb-2" />
                <p className="font-code text-sm uppercase tracking-widest">Paste code. Brockston will diagnose and fix it.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
