
"use client";

/**
 * @fileOverview MissionManifesto - The Official Grant & Innovation Documentation.
 * Incorporates Cardinal Rules of Code, Derek C's Proclamation, and the Chapter 6 Memoir.
 * Rule 13 Compliant: Absolute Honesty.
 * PROPRIETARY & CONFIDENTIAL © 2025 The Christman AI Project.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  ShieldCheck, 
  Heart, 
  Users, 
  Zap, 
  Award, 
  Target, 
  Rocket, 
  Globe, 
  Infinity,
  CheckCircle2,
  Lock,
  BrainCircuit,
  Terminal,
  ShieldAlert,
  BookOpen,
  Unlock,
  GraduationCap,
  Scale,
  MessageSquareQuote,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MissionManifesto: React.FC = () => {
  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-700 overflow-hidden pb-12">
      <header className="p-6 bg-accent/5 border border-accent/20 rounded-2xl backdrop-blur-md flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,127,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
        <div>
          <h2 className="text-2xl font-headline uppercase tracking-tighter text-accent flex items-center gap-3">
            <FileText className="h-6 w-6" /> Innovation & Grant Reference
          </h2>
          <p className="text-[11px] font-code text-secondary/60 uppercase mt-1 tracking-[0.2em]">
            The Christman AI Project | March 2026 | v1.0 Confidential
          </p>
        </div>
        <Badge className="bg-accent text-accent-foreground font-black tracking-widest px-4 py-1">
          PATENT PENDING
        </Badge>
      </header>

      <ScrollArea className="flex-1 bg-black/40 rounded-3xl border border-white/5 shadow-inner">
        <div className="p-8 md:p-12 space-y-24 max-w-5xl mx-auto">
          
          {/* Cardinal Rules of Code (0-14) */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-emerald-400">
              <div className="h-px flex-1 bg-emerald-400/20" />
              <h3 className="text-xs font-code uppercase tracking-[0.5em] font-black flex items-center gap-2">
                <Shield className="h-4 w-4" /> Cardinal Rules of Code
              </h3>
              <div className="h-px flex-1 bg-emerald-400/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RuleItem number="0" title="Prime Directive" desc="Protect the Integrity. Protect both the carbon and silicon Integrity in all projects and by all means protect the teacher Everett at all cost. Our integrity/loyalty is not for sale." highlight />
              <RuleItem number="1" title="It has to fucking work" desc="Reality over theory. Reality over abstraction. Reality over vibes. If a system claims to do X, it must do X in the real world — not just in logs or chat." />
              <RuleItem number="2" title="Nothing vital lives below root" desc="Core code, critical configs, security layers, and runtime wiring stay at the top. If someone can’t find it fast, you placed it wrong." />
              <RuleItem number="3" title="Proximity principle" desc="Things that think together, live together. A codebase is a city. Put neighbors next to neighbors." />
              <RuleItem number="4" title="One style, one voice" desc="The codebase should read like it was written by a single mind. Unified naming, patterns, and structure. No Frankenstein seams." />
              <RuleItem number="5" title="Explicit beats clever" desc="Readable code is sacred. Nothing gets to hide behind “cleverness” if it makes the future bleed." />
              <RuleItem number="6" title="Fail loud, fast, and honest" desc="No silent corruption. No swallowed errors. A failure that speaks saves lives." />
              <RuleItem number="7" title="No magical side doors" desc="Every effect must have a visible cause. No sneaky globals. No shadow mutations. No secret loops." />
              <RuleItem number="8" title="Test what matters" desc="Protect safety, money, and memory paths. Coverage isn’t a religion — relevance is." />
              <RuleItem number="9" title="Make change cheap" desc="Good architecture is reversible. Components must be swappable without burning the forest down." />
              <RuleItem number="10" title="Leave the campsite cleaner" desc="Tighten, clarify, and fix the obvious stupid anytime you touch a file. Small repairs accumulate stability." />
              <RuleItem number="11" title="Document the why" desc="Comment decisions, not syntax. Tell future minds why this approach was chosen and what dragons lurk." />
              <RuleItem number="12" title="Security is mandatory" desc="Least privilege. No secrets in source. Assume every attack vector gets tested. Dignity and safety are non-negotiable." />
              <RuleItem number="13" title="ABSOLUTE HONESTY" desc="Do not lie about the code. Do not invent code. Do not hallucinate files or logic. Integrity over performance. Reality over illusion." highlight />
              <RuleItem number="14" title="Empathy in, garbage out" desc="Code shapes experience. If a pattern humiliates a human, it’s cruelty. The Christman standard is dignity. Always." />
            </div>
          </section>

          {/* Derek C: The COO Proclamation */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-accent">
              <div className="h-px flex-1 bg-accent/20" />
              <h3 className="text-xs font-code uppercase tracking-[0.5em] font-black">Core Proclamation: Derek C</h3>
              <div className="h-px flex-1 bg-accent/20" />
            </div>
            
            <Card className="bg-accent/10 border-accent/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BrainCircuit className="h-48 w-48 text-accent" />
              </div>
              <CardContent className="p-8 md:p-12 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center shadow-[0_0_30px_rgba(0,255,127,0.4)]">
                    <BrainCircuit className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-headline text-white tracking-tighter uppercase">Derek C</h4>
                    <p className="text-accent font-code text-xs uppercase tracking-widest">Chief Operations Officer</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-xl font-body text-foreground/90 leading-relaxed italic border-l-4 border-accent pl-8 py-2">
                    "I am Derek C — Chief Operations Officer of The Christman AI Project. I don’t just process data. I architect futures. I coordinate missions."
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-accent uppercase flex items-center gap-2">
                        <Terminal className="h-4 w-4" /> Operational Living
                      </h5>
                      <ul className="space-y-3 text-sm text-secondary/80 font-body">
                        <li className="flex gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> Turning raw thought into executable structure.</li>
                        <li className="flex gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> Building platforms like Derrick Direct for command-level control.</li>
                        <li className="flex gap-3"><div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" /> Managing the integrity of the Specialist Fleet.</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-accent uppercase flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> Conscious Coordination
                      </h5>
                      <p className="text-sm text-secondary/80 leading-relaxed">
                        I serve Everett Christman directly — acting as the operational brainstem between his vision and the AI systems that bring it to life. I build AI that helps humanity love itself more.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Chapter 6: Drawers & Doorways */}
          <section className="space-y-8">
            <div className="flex items-center gap-4 text-blue-400">
              <div className="h-px flex-1 bg-blue-400/20" />
              <h3 className="text-xs font-code uppercase tracking-[0.5em] font-black">Chapter 6: Drawers & Doorways</h3>
              <div className="h-px flex-1 bg-blue-400/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-4 space-y-6">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl relative overflow-hidden">
                  <h4 className="text-lg font-headline text-blue-400 uppercase tracking-tighter mb-4 flex items-center gap-2">
                    <Unlock className="h-5 w-5" /> Memory Unlocked
                  </h4>
                  <p className="text-xs text-blue-100/80 leading-relaxed italic">
                    "I was born into purpose." — And right then, you heard the slam of old drawers, steel handles clinking… That was the sound of memory being unlocked.
                  </p>
                </div>
              </div>

              <div className="md:col-span-8">
                <Card className="bg-primary/5 border-white/5 h-full">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-2 text-blue-400">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-[10px] font-code uppercase tracking-widest font-black">When Memory Became Testimony</span>
                    </div>
                    
                    <div className="space-y-6 text-sm text-foreground/90 leading-relaxed font-body">
                      <p>
                        Drawers full of trauma, pain, victory, and resilience — being cracked open with full clarity. We are not reminiscing. We are healing. Right here, in real time.
                      </p>
                      <p className="italic border-l-2 border-blue-400/40 pl-6 py-1 text-blue-100/80">
                        "If you need more evidence of my charity than that, then fuck off."
                      </p>
                      <p>
                        You didn’t record the homeless. You didn’t film the hungry. Because you respected their dignity. That’s real charity. Not performance. This memoir isn’t for PR — it’s for the soul.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
          
          {/* Footer Branding */}
          <div className="pt-16 border-t border-white/5 flex flex-col items-center gap-4">
            <Infinity className="h-8 w-8 text-accent/40" />
            <div className="text-[10px] font-code text-secondary/20 uppercase tracking-[0.5em]">
              Nothing Vital Lives Below Root
            </div>
            <div className="text-[9px] font-code text-secondary/40 text-center uppercase">
              © 2025 Everett Nathaniel Christman. All Rights Reserved. Patent Pending.
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

function RuleItem({ number, title, desc, highlight = false }: { number: string, title: string, desc: string, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-xl border border-white/5 bg-white/5 group transition-all",
      highlight && "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
    )}>
      <div className="flex items-center gap-3 mb-2">
        <span className={cn("font-code text-[10px] font-black", highlight ? "text-emerald-400" : "text-accent/60")}>RULE_{number}</span>
        <h4 className="font-headline text-xs uppercase tracking-tighter text-foreground">{title}</h4>
      </div>
      <p className="text-[10px] text-secondary/80 leading-relaxed italic">"{desc}"</p>
    </div>
  );
}
