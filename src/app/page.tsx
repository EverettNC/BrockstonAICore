
'use client';

import React, { useState } from 'react';
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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'lab' | 'knowledge' | 'pulse' | 'vision' | 'cortex' | 'learning' | 'cipher' | 'resonance' | 'forensics' | 'kernel'>('terminal');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 hidden md:flex flex-col items-center py-8 bg-card border-r border-white/5">
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
      <main className="flex-1 flex flex-col h-screen p-4 md:p-6 lg:p-8 gap-6 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-none flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-headline tracking-tighter uppercase flex items-center gap-2">
              Brockston <span className="text-accent">Ultimate AI</span>
            </h1>
            <p className="text-[10px] text-secondary font-code uppercase tracking-widest opacity-60">
              Operator: Everett N. Christman | COO: Brockston C | Status: {
                activeTab === 'lab' ? 'Medical Discovery Active' : 
                activeTab === 'pulse' ? 'Self-Actualization Active' :
                activeTab === 'vision' ? 'Visual Cortex Sync' :
                activeTab === 'cortex' ? 'Reasoning Core Active' :
                activeTab === 'learning' ? 'Autonomous Learning Mode' :
                activeTab === 'cipher' ? 'Cryptographic Tiers Online' :
                activeTab === 'resonance' ? 'Resonance Module Active' :
                activeTab === 'forensics' ? 'Forensic Recovery Active' :
                activeTab === 'kernel' ? 'Symbolic Lab Active' :
                'Neural Link Active'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg border border-white/5">
                <Search className="h-4 w-4 text-secondary" />
                <span className="text-xs text-secondary font-code">Search Cognitive Mesh</span>
             </div>
             <div className="h-10 w-10 rounded-full bg-primary/40 border border-accent/20 flex items-center justify-center relative">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <div className="absolute inset-0 border border-accent/20 rounded-full animate-ping opacity-20" />
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'lab' ? (
            <DiscoveryLab />
          ) : activeTab === 'pulse' ? (
            <PulseTerminal />
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
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
              {/* Chat/Avatar - Main Panel */}
              <section className="lg:col-span-8 flex flex-col min-h-0">
                <ChatInterface />
              </section>

              {/* Right Monitoring Panel */}
              <aside className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 system-log">
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
                    <p className="text-[9px] text-secondary mt-4 font-code text-center opacity-40">
                      © 2025 THE CHRISTMAN AI PROJECT
                    </p>
                </div>
              </aside>
            </div>
          )}
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
