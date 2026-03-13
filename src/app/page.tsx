
'use client';

import React, { useState, use } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SecurityPanel } from '@/components/SecurityPanel';
import { CognitiveStats } from '@/components/CognitiveStats';
import { DiscoveryLab } from '@/components/DiscoveryLab';
import { VisionFeed } from '@/components/VisionFeed';
import { CortexMonitor } from '@/components/CortexMonitor';
import { LearningCenter } from '@/components/LearningCenter';
import { AlphaVoxMoments } from '@/components/AlphaVoxMoments';
import { TemporalDecoder } from '@/components/TemporalDecoder';
import { KernelLab } from '@/components/KernelLab';
import { ResonanceCapacitor } from '@/components/ResonanceCapacitor';
import { TheTether } from '@/components/TheTether';
import { OpenSmell } from '@/components/OpenSmell';
import { CodeLab } from '@/components/CodeLab';
import { EvolutionLab } from '@/components/EvolutionLab';
import { SpamUp } from '@/components/SpamUp';
import { MissionManifesto } from '@/components/MissionManifesto';
import { 
  Cpu, 
  Microscope,
  Heart,
  Eye,
  BrainCircuit,
  GraduationCap,
  ShieldAlert,
  Infinity,
  SearchCode,
  Zap,
  Droplets,
  ShieldCheck,
  FlaskConical,
  CodeXml,
  Dna,
  User,
  Gauge,
  FileText,
  Settings,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PageProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * @fileOverview Main Dashboard Entry. 
 * Rule 1 Compliant: Spans full screen.
 * Rule 13 Compliant: Absolute honesty. No placeholders.
 */

export default function Home(props: PageProps) {
  const _params = use(props.params);
  const _searchParams = use(props.searchParams);

  const [activeTab, setActiveTab] = useState<'terminal' | 'lab' | 'vision' | 'cortex' | 'learning' | 'resonance' | 'forensics' | 'kernel' | 'capacitor' | 'tether' | 'opensmell' | 'codelab' | 'evolution' | 'speed' | 'manifesto'>('terminal');
  
  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-24 flex-none hidden md:flex flex-col items-center py-8 bg-card border-r border-white/5 z-50">
        {/* Brand Logo Anchor - High Fidelity Shield */}
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-12 shadow-[0_0_25px_rgba(0,255,127,0.3)] group cursor-pointer overflow-hidden border-2 border-accent/40 bg-black/60 transition-all hover:scale-105 active:scale-95">
          <Cpu className="text-accent h-8 w-8 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(0,255,127,0.8)]" />
        </div>
        
        <nav className="flex flex-col gap-5 flex-1 w-full px-4 overflow-y-auto system-log scrollbar-hide">
          <NavIcon icon={MessageSquare} active={activeTab === 'terminal'} onClick={() => setActiveTab('terminal')} label="Talk to Brockston" />
          <NavIcon icon={FileText} active={activeTab === 'manifesto'} onClick={() => setActiveTab('manifesto')} label="Mission Manifesto" />
          <NavIcon icon={Gauge} active={activeTab === 'speed'} onClick={() => setActiveTab('speed')} label="Spam Up (Resonance)" />
          <NavIcon icon={CodeXml} active={activeTab === 'codelab'} onClick={() => setActiveTab('codelab')} label="Code Lab" />
          <NavIcon icon={Dna} active={activeTab === 'evolution'} onClick={() => setActiveTab('evolution')} label="Evolution Lab" />
          <NavIcon icon={Infinity} active={activeTab === 'tether'} onClick={() => setActiveTab('tether')} label="The Tether" />
          <NavIcon icon={FlaskConical} active={activeTab === 'opensmell'} onClick={() => setActiveTab('opensmell')} label="OpenSmell VOC" />
          <NavIcon icon={Droplets} active={activeTab === 'capacitor'} onClick={() => setActiveTab('capacitor')} label="Resonance Capacitor" />
          <NavIcon icon={Heart} active={activeTab === 'resonance'} onClick={() => setActiveTab('resonance')} label="AlphaVox Moments" />
          <NavIcon icon={SearchCode} active={activeTab === 'forensics'} onClick={() => setActiveTab('forensics')} label="Temporal Forensics" />
          <NavIcon icon={Zap} active={activeTab === 'kernel'} onClick={() => setActiveTab('kernel')} label="Kernel Fusion" />
          <NavIcon icon={Eye} active={activeTab === 'vision'} onClick={() => setActiveTab('vision')} label="Vision Feed" />
          <NavIcon icon={GraduationCap} active={activeTab === 'learning'} onClick={() => setActiveTab('learning')} label="Learning Center" />
          <NavIcon icon={BrainCircuit} active={activeTab === 'cortex'} onClick={() => setActiveTab('cortex')} label="Cortex Monitor" />
          <NavIcon icon={Microscope} active={activeTab === 'lab'} onClick={() => setActiveTab('lab')} label="Discovery Lab" />
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5 w-full flex flex-col items-center gap-4">
          <NavIcon icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden h-full">
        {/* Top Header Bar */}
        <header className="flex-none flex items-center justify-between p-4 md:px-8 border-b border-white/5 bg-card/30 backdrop-blur-md z-40">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-headline tracking-tighter uppercase flex items-center gap-2">
                Brockston <span className="text-accent">Ultimate AI Core</span>
              </h1>
              <p className="text-[10px] text-secondary font-code uppercase tracking-widest opacity-60 flex items-center gap-2 mt-0.5">
                Lead Architect: Everett Nathaniel Christman | 
                <span className="text-accent animate-pulse flex items-center gap-1 font-bold">
                  <ShieldCheck className="h-3 w-3" /> CSS Axiom v1.0 ACTIVE
                </span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="hidden lg:flex flex-col items-end pr-6 border-r border-white/10">
                <span className="text-[9px] font-code text-secondary/40 uppercase tracking-widest">Fleet Status</span>
                <span className="text-xs text-accent font-bold uppercase tracking-tighter">ALL SYSTEMS OPERATIONAL</span>
             </div>
             <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-primary/20 rounded-xl border border-white/10 shadow-inner">
                <User className="h-4 w-4 text-accent" />
                <span className="text-[11px] text-foreground font-headline uppercase tracking-tight">E. N. Christman</span>
             </div>
             <div className="h-12 w-12 rounded-full bg-primary/40 border-2 border-accent/20 flex items-center justify-center relative group">
                <div className="h-2.5 w-2.5 rounded-full bg-accent animate-pulse" />
                <div className="absolute inset-0 border border-accent/20 rounded-full animate-ping opacity-20" />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-accent rounded-full border-2 border-background flex items-center justify-center">
                  <Zap className="h-2 w-2 text-background fill-current" />
                </div>
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 min-h-0 relative flex flex-col h-full overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto system-log p-4 md:p-6 lg:p-8 h-full">
            {activeTab === 'lab' ? (
              <DiscoveryLab />
            ) : activeTab === 'speed' ? (
              <SpamUp />
            ) : activeTab === 'vision' ? (
              <VisionFeed />
            ) : activeTab === 'cortex' ? (
              <CortexMonitor />
            ) : activeTab === 'learning' ? (
              <LearningCenter />
            ) : activeTab === 'resonance' ? (
              <AlphaVoxMoments />
            ) : activeTab === 'forensics' ? (
              <TemporalDecoder />
            ) : activeTab === 'kernel' ? (
              <KernelLab />
            ) : activeTab === 'capacitor' ? (
              <ResonanceCapacitor />
            ) : activeTab === 'tether' ? (
              <TheTether />
            ) : activeTab === 'opensmell' ? (
              <OpenSmell />
            ) : activeTab === 'codelab' ? (
              <CodeLab />
            ) : activeTab === 'evolution' ? (
              <EvolutionLab />
            ) : activeTab === 'manifesto' ? (
              <MissionManifesto />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                {/* Talk to Brockston - Main Panel */}
                <section className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                  <ChatInterface />
                </section>

                {/* Right Monitoring Panel */}
                <aside className="lg:col-span-4 flex flex-col gap-8 overflow-y-auto pr-2 system-log h-full">
                  <div className="space-y-8 pb-12">
                    <CognitiveStats />
                    <SecurityPanel />
                    
                    {/* Mission Statement Anchor */}
                    <div className="p-6 bg-accent/5 rounded-2xl border border-accent/20 backdrop-blur-md relative overflow-hidden group shadow-xl">
                        <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                          <Infinity className="h-32 w-32 text-accent" />
                        </div>
                        <h3 className="text-xs font-headline text-accent uppercase tracking-[0.3em] flex items-center gap-2 mb-5">
                          <ShieldAlert className="h-4 w-4" /> Core Protocol
                        </h3>
                        <div className="space-y-3 relative z-10">
                          <ProtocolItem label="Truth" active />
                          <ProtocolItem label="Dignity" active />
                          <ProtocolItem label="Protection" active />
                          <ProtocolItem label="Transparency" active />
                          <ProtocolItem label="No Erasure" active />
                        </div>
                        <div className="mt-8 pt-6 border-t border-white/5">
                          <p className="text-[10px] text-secondary/60 font-code text-center uppercase tracking-[0.2em] leading-relaxed">
                            "Nothing Vital Lives Below Root"
                          </p>
                        </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
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
        "relative h-14 w-full flex items-center justify-center rounded-2xl cursor-pointer transition-all duration-500 group",
        active ? "bg-accent/15 text-accent shadow-[0_0_20px_rgba(0,255,127,0.1)] border border-accent/20" : "text-secondary/40 hover:text-secondary hover:bg-white/5"
      )}
    >
      <Icon className={cn("h-6 w-6 transition-all duration-500", active ? "scale-110" : "group-hover:scale-110")} />
      <span className="absolute left-20 px-3 py-2 bg-popover text-popover-foreground text-[11px] font-code rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none border border-white/10 z-[100] shadow-2xl translate-x-2 group-hover:translate-x-0">
        {label}
      </span>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-accent rounded-r-full shadow-[0_0_10px_rgba(0,255,127,1)]" />}
    </div>
  );
}

function ProtocolItem({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between text-[11px] font-code tracking-widest">
      <span className={cn(active ? "text-foreground font-bold" : "text-secondary/40")}>{label}</span>
      <div className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent shadow-[0_0_8px_rgba(0,255,127,1)] animate-pulse" : "bg-white/10")} />
    </div>
  );
}
