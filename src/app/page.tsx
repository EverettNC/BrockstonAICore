
'use client';

import React, { useState, use } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { CortexMonitor } from '@/components/CortexMonitor';
import { LearningCenter } from '@/components/LearningCenter';
import { CodeLab } from '@/components/CodeLab';
import {
  Cpu,
  BrainCircuit,
  GraduationCap,
  ShieldCheck,
  Zap,
  CodeXml,
  User,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PageProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type Tab = 'brockston' | 'learning' | 'codelab' | 'cortex';

export default function Home(props: PageProps) {
  const _params = use(props.params);
  const _searchParams = use(props.searchParams);

  const [activeTab, setActiveTab] = useState<Tab>('brockston');

  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-20 flex-none hidden md:flex flex-col items-center py-8 bg-card border-r border-white/5 z-50">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-10 border-2 border-accent/40 bg-black/60 shadow-[0_0_20px_rgba(0,255,127,0.2)]">
          <Cpu className="text-accent h-6 w-6" />
        </div>

        <nav className="flex flex-col gap-4 flex-1 w-full px-3">
          <NavIcon icon={MessageSquare} active={activeTab === 'brockston'}   onClick={() => setActiveTab('brockston')}  label="Talk to Brockston" />
          <NavIcon icon={GraduationCap} active={activeTab === 'learning'}    onClick={() => setActiveTab('learning')}   label="Learning Center" />
          <NavIcon icon={CodeXml}       active={activeTab === 'codelab'}     onClick={() => setActiveTab('codelab')}    label="Code Lab" />
          <NavIcon icon={BrainCircuit}  active={activeTab === 'cortex'}      onClick={() => setActiveTab('cortex')}     label="Cortex Monitor" />
        </nav>

        <div className="pt-6 border-t border-white/5 w-full flex justify-center">
          <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <User className="h-4 w-4 text-accent/60" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden h-full">
        {/* Header */}
        <header className="flex-none flex items-center justify-between px-6 py-3 border-b border-white/5 bg-card/30 backdrop-blur-md z-40">
          <div className="flex flex-col">
            <h1 className="text-lg font-headline tracking-tighter uppercase">
              Brockston <span className="text-accent">AI Core</span>
            </h1>
            <p className="text-[9px] text-secondary/50 font-code uppercase tracking-widest flex items-center gap-1">
              E. N. Christman
              <span className="text-accent/70 flex items-center gap-1 ml-2">
                <ShieldCheck className="h-2.5 w-2.5" /> CSS Axiom v1.0
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(0,255,127,0.8)]" />
            <span className="text-[10px] font-code text-accent uppercase tracking-widest">ONLINE</span>
          </div>
        </header>

        {/* Content — always mounted, hidden via CSS so background processes (learning loop) never die */}
        <div className="flex-1 min-h-0 overflow-hidden relative">
          <div className={cn("absolute inset-0 p-4 md:p-6", activeTab !== 'brockston' && "hidden")}>
            <ChatInterface />
          </div>
          <div className={cn("absolute inset-0 overflow-y-auto p-4 md:p-6", activeTab !== 'learning' && "hidden")}>
            <LearningCenter />
          </div>
          <div className={cn("absolute inset-0 overflow-y-auto p-4 md:p-6", activeTab !== 'codelab' && "hidden")}>
            <CodeLab />
          </div>
          <div className={cn("absolute inset-0 overflow-y-auto p-4 md:p-6", activeTab !== 'cortex' && "hidden")}>
            <CortexMonitor />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavIcon({ icon: Icon, active = false, label, onClick }: { icon: any, active?: boolean, label: string, onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative h-12 w-full flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300 group",
        active
          ? "bg-accent/15 text-accent border border-accent/20 shadow-[0_0_15px_rgba(0,255,127,0.08)]"
          : "text-secondary/40 hover:text-secondary hover:bg-white/5"
      )}
    >
      <Icon className={cn("h-5 w-5 transition-all duration-300", active ? "scale-110" : "group-hover:scale-110")} />
      <span className="absolute left-16 px-3 py-1.5 bg-popover text-popover-foreground text-[11px] font-code rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none border border-white/10 z-[100] shadow-xl">
        {label}
      </span>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-accent rounded-r-full shadow-[0_0_8px_rgba(0,255,127,1)]" />}
    </div>
  );
}
