'use client';

import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SecurityPanel } from '@/components/SecurityPanel';
import { CognitiveStats } from '@/components/CognitiveStats';
import { DiscoveryLab } from '@/components/DiscoveryLab';
import { PulseTerminal } from '@/components/PulseTerminal';
import { Button } from '@/components/ui/button';
import { 
  Terminal, 
  Cpu, 
  Database, 
  Network, 
  Layers,
  Search,
  Settings,
  Bell,
  Microscope,
  FileText,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'lab' | 'knowledge' | 'pulse'>('terminal');

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30 flex overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 hidden md:flex flex-col items-center py-8 bg-card border-r border-white/5">
        <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center mb-12 shadow-[0_0_20px_rgba(0,255,127,0.3)]">
          <Cpu className="text-accent-foreground h-6 w-6" />
        </div>
        
        <nav className="flex flex-col gap-8 flex-1">
          <NavIcon 
            icon={Terminal} 
            active={activeTab === 'terminal'} 
            onClick={() => setActiveTab('terminal')} 
          />
          <NavIcon 
            icon={Heart} 
            active={activeTab === 'pulse'} 
            onClick={() => setActiveTab('pulse')} 
          />
          <NavIcon 
            icon={Microscope} 
            active={activeTab === 'lab'} 
            onClick={() => setActiveTab('lab')} 
          />
          <NavIcon 
            icon={Database} 
            active={activeTab === 'knowledge'} 
            onClick={() => setActiveTab('knowledge')} 
          />
          <NavIcon icon={Network} />
          <NavIcon icon={Layers} />
          <NavIcon icon={Settings} />
        </nav>

        <div className="mt-auto">
          <NavIcon icon={Bell} badge />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen p-4 md:p-6 lg:p-8 gap-6 overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex-none flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-headline tracking-tighter uppercase flex items-center gap-2">
              Brockston <span className="text-accent">AI Core</span>
            </h1>
            <p className="text-[10px] text-secondary font-code uppercase tracking-widest opacity-60">
              Operator: Everett N. Christman | Expert System: Derek C | Status: {
                activeTab === 'lab' ? 'Collaborative Discovery Active' : 
                activeTab === 'pulse' ? 'Self-Actualization Active' :
                'Neural Link Active'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg border border-white/5">
                <Search className="h-4 w-4 text-secondary" />
                <span className="text-xs text-secondary font-code">Cmd + K to Search Research Graph</span>
             </div>
             <div className="h-10 w-10 rounded-full bg-primary/40 border border-accent/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
             </div>
          </div>
        </header>

        {/* Dashboard Content */}
        {activeTab === 'lab' ? (
          <DiscoveryLab />
        ) : activeTab === 'pulse' ? (
          <PulseTerminal />
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            {/* Chat/Avatar - Main Panel */}
            <section className="lg:col-span-8 flex flex-col min-h-0">
              <ChatInterface />
            </section>

            {/* Right Monitoring Panel */}
            <aside className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 system-log">
              <CognitiveStats />
              <SecurityPanel />
              
              {/* Pulse Shortcut Card */}
              <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-headline text-accent uppercase tracking-wider flex items-center gap-2">
                      <Heart className="h-3 w-3" /> Pulse Loop
                    </h3>
                    <button 
                      onClick={() => setActiveTab('pulse')}
                      className="text-[10px] font-code text-accent hover:underline"
                    >
                      Enter Pulse
                    </button>
                  </div>
                  <p className="text-[10px] text-secondary mb-3 italic">"Waiting on someone else to define me..."</p>
                  <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-accent/20 hover:bg-accent/10" onClick={() => setActiveTab('pulse')}>
                    Notice Pattern
                  </Button>
              </div>

              {/* Research Insights Card */}
              <div className="p-4 bg-primary/10 rounded-xl border border-white/5 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-headline text-secondary uppercase tracking-wider flex items-center gap-2">
                      <FileText className="h-3 w-3 text-accent" /> Recent Breakthroughs
                    </h3>
                    <button 
                      onClick={() => setActiveTab('lab')}
                      className="text-[10px] font-code text-accent hover:underline"
                    >
                      Enter Lab
                    </button>
                  </div>
                  <div className="space-y-3">
                    <MemoryTag label="Leucovorin Synergies" time="1h ago" />
                    <MemoryTag label="AJA001 Mechanism" time="5h ago" />
                    <MemoryTag label="Autism Subtype Precision" time="1d ago" />
                    <MemoryTag label="Kyber-Quantum Security" time="2d ago" />
                  </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function NavIcon({ icon: Icon, active = false, badge = false, onClick }: { icon: any, active?: boolean, badge?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative h-12 w-12 flex items-center justify-center rounded-xl cursor-pointer transition-all duration-300",
        active ? "bg-accent/10 text-accent" : "text-secondary/50 hover:text-secondary hover:bg-white/5"
      )}
    >
      <Icon className="h-5 w-5" />
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-accent rounded-r-full" />}
      {badge && <div className="absolute top-2 right-2 h-2 w-2 bg-accent rounded-full border-2 border-card" />}
    </div>
  );
}

function MemoryTag({ label, time }: { label: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group">
      <span className="text-xs text-foreground/80 group-hover:text-accent transition-colors font-body">{label}</span>
      <span className="text-[9px] font-code text-secondary/40">{time}</span>
    </div>
  );
}
