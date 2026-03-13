'use client';

import React, { useState, use } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SecurityPanel } from '@/components/SecurityPanel';
import { CognitiveStats } from '@/components/CognitiveStats';
import { DiscoveryLab } from '@/components/DiscoveryLab';
import { PulseTerminal } from '@/components/PulseTerminal';
import { VisionFeed } from '@/components/VisionFeed';
import { CortexMonitor } from '@/components/CortexMonitor';
import { LearningCenter } from '@/components/LearningCenter';
import { CipherLab } from '@/components/CipherLab';
import { HapticPanel } from '@/components/HapticPanel';
import { AlphaVoxMoments } from '@/components/AlphaVoxMoments';
import { TemporalDecoder } from '@/components/TemporalDecoder';
import { KernelLab } from '@/components/KernelLab';
import { ResonanceCapacitor } from '@/components/ResonanceCapacitor';
import { TheTether } from '@/components/TheTether';
import { OpenSmell } from '@/components/OpenSmell';
import { CodeLab } from '@/components/CodeLab';
import { EvolutionLab } from '@/components/EvolutionLab';
import { SpamUp } from '@/components/SpamUp';
import { 
  Terminal, 
  Cpu, 
  Database, 
  Search,
  Settings,
  Microscope,
  Heart,
  Eye,
  BrainCircuit,
  GraduationCap,
  ShieldAlert,
  Radio,
  Infinity,
  Lock,
  ScrollText,
  SearchCode,
  Zap,
  Droplets,
  ShieldCheck,
  FlaskConical,
  CircleDashed,
  CodeXml,
  Dna,
  User,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';

type PageProps = {
  params: Promise<{ [key: string]: string | string[] | undefined }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default function Home(props: PageProps) {
  // Correctly unwrap Next.js 15 dynamic APIs using React.use()
  const _params = use(props.params);
  const _searchParams = use(props.searchParams);

  const [activeTab, setActiveTab] = useState<'terminal' | 'lab' | 'knowledge' | 'pulse' | 'vision' | 'cortex' | 'learning' | 'cipher' | 'resonance' | 'forensics' | 'kernel' | 'capacitor' | 'tether' | 'opensmell' | 'codelab' | 'evolution' | 'speed'>('terminal');

  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 flex-none hidden md:flex flex-col items-center py-8 bg-card border-r border-white/5 z-50">
        <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center mb-12 shadow-[0_0_20px_rgba(0,255,127,0.3)] group cursor-pointer">
          <Cpu className="text-accent-foreground h-6 w-6 group-hover:scale-110 transition-transform" />
        </div>
        
        <nav className="flex flex-col gap-6 flex-1">
          <NavIcon 
            icon={Terminal} 
            active={activeTab === 'terminal'} 
            onClick={() => setActiveTab('terminal')} 
            label="Terminal"
          />
          <NavIcon 
            icon={Gauge} 
            active={activeTab === 'speed'} 
            onClick={() => setActiveTab('speed')} 
            label="Spam Up"
          />
          <NavIcon 
            icon={CodeXml} 
            active={activeTab === 'codelab'} 
            onClick={() => setActiveTab('codelab')} 
            label="Code Lab"
          />
          <NavIcon 
            icon={Dna} 
            active={activeTab === 'evolution'} 
            onClick={() => setActiveTab('evolution')} 
            label="Evolution Lab"
          />
          <NavIcon 
            icon={Infinity} 
            active={activeTab === 'tether'} 
            onClick={() => setActiveTab('tether')} 
            label="The Tether"
          />
          <NavIcon 
            icon={FlaskConical} 
            active={activeTab === 'opensmell'} 
            onClick={() => setActiveTab('opensmell')} 
            label="OpenSmell"
          />
          <NavIcon 
            icon={Droplets} 
            active={activeTab === 'capacitor'} 
            onClick={() => setActiveTab('capacitor')} 
            label="Capacitor"
          />
          <NavIcon 
            icon={Heart} 
            active={activeTab === 'resonance'} 
            onClick={() => setActiveTab('resonance')} 
            label="Resonance"
          />
          <NavIcon 
            icon={SearchCode} 
            active={activeTab === 'forensics'} 
            onClick={() => setActiveTab('forensics')} 
            label="Forensics"
          />
          <NavIcon 
            icon={Zap} 
            active={activeTab === 'kernel'} 
            onClick={() => setActiveTab('kernel')} 
            label="Kernel"
          />
          <NavIcon 
            icon={Eye} 
            active={activeTab === 'vision'} 
            onClick={() => setActiveTab('vision')} 
            label="Vision"
          />
          <NavIcon 
            icon={Lock} 
            active={activeTab === 'cipher'} 
            onClick={() => setActiveTab('cipher')} 
            label="Cipher"
          />
          <NavIcon 
            icon={GraduationCap} 
            active={activeTab === 'learning'} 
            onClick={() => setActiveTab('learning')} 
            label="Learning"
          />
          <NavIcon 
            icon={BrainCircuit} 
            active={activeTab === 'cortex'} 
            onClick={() => setActiveTab('cortex')} 
            label="Cortex"
          />
          <NavIcon 
            icon={Microscope} 
            active={activeTab === 'lab'} 
            onClick={() => setActiveTab('lab')} 
            label="Discovery"
          />
        </nav>

        <div className="mt-auto">
          <NavIcon icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Top Header Bar */}
        <header className="flex-none flex items-center justify-between p-4 md:p-6 border-b border-white/5 bg-card/30 backdrop-blur-md z-40">
          <div>
            <h1 className="text-xl md:text-2xl font-headline tracking-tighter uppercase flex items-center gap-2">
              Brockston <span className="text-accent">Ultimate AI</span>
            </h1>
            <p className="text-[10px] text-secondary font-code uppercase tracking-widest opacity-60 flex items-center gap-2">
              Architect: Everett N. Christman | 
              <span className="text-accent animate-pulse flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> CSS Axiom v1.0 Active
              </span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg border border-white/5">
                <User className="h-4 w-4 text-secondary" />
                <span className="text-xs text-secondary font-code">Lead: Everett Nathaniel Christman</span>
             </div>
             <div className="h-10 w-10 rounded-full bg-primary/40 border border-accent/20 flex items-center justify-center relative">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <div className="absolute inset-0 border border-accent/20 rounded-full animate-ping opacity-20" />
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto system-log p-4 md:p-6 lg:p-8">
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
            ) : activeTab === 'cipher' ? (
              <CipherLab />
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
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-full">
                {/* Chat/Avatar - Main Panel */}
                <section className="lg:col-span-8 flex flex-col min-h-[800px]">
                  <ChatInterface />
                </section>

                {/* Right Monitoring Panel */}
                <aside className="lg:col-span-4 flex flex-col gap-6">
                  <CognitiveStats />
                  <HapticPanel />
                  <SecurityPanel />
                  
                  {/* Mission Statement */}
                  <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 backdrop-blur-md relative overflow-hidden group">
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Infinity className="h-24 w-24 text-accent" />
                      </div>
                      <h3 className="text-xs font-headline text-accent uppercase tracking-wider flex items-center gap-2 mb-3">
                        <ShieldAlert className="h-3 w-3" /> Core Protocol
                      </h3>
                      <div className="space-y-2 relative z-10">
                        <ProtocolItem label="Truth" active />
                        <ProtocolItem label="Dignity" active />
                        <ProtocolItem label="Protection" active />
                        <ProtocolItem label="Transparency" active />
                        <ProtocolItem label="No Erasure" active />
                      </div>
                      <p className="text-[9px] text-secondary mt-4 font-code text-center opacity-40 uppercase">
                        "Nothing Vital Lives Below Root"
                      </p>
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
        "relative h-12 w-12 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300 group",
        active ? "bg-accent/10 text-accent shadow-[0_0_15px_rgba(0,255,127,0.1)]" : "text-secondary/50 hover:text-secondary hover:bg-white/5"
      )}
    >
      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
      <span className="absolute left-16 px-2 py-1 bg-popover text-popover-foreground text-[10px] font-code rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-50">
        {label}
      </span>
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-accent rounded-r-full" />}
    </div>
  );
}

function ProtocolItem({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between text-[10px] font-code">
      <span className={cn(active ? "text-foreground" : "text-secondary/40")}>{label}</span>
      <div className={cn("h-1 w-1 rounded-full", active ? "bg-accent shadow-[0_0_5px_rgba(0,255,127,0.8)]" : "bg-white/10")} />
    </div>
  );
}