
'use client';

import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { SecurityPanel } from '@/components/SecurityPanel';
import { CognitiveStats } from '@/components/CognitiveStats';
import { DiscoveryLab } from '@/components/DiscoveryLab';
import { PulseTerminal } from '@/components/PulseTerminal';
import { VisionFeed } from '@/components/VisionFeed';
import { CortexMonitor } from '@/components/CortexMonitor';
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
  Heart,
  Eye,
  BrainCircuit
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'lab' | 'knowledge' | 'pulse' | 'vision' | 'cortex'>('terminal');

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
            icon={Eye} 
            active={activeTab === 'vision'} 
            onClick={() => setActiveTab('vision')} 
          />
          <NavIcon 
            icon={BrainCircuit} 
            active={activeTab === 'cortex'} 
            onClick={() => setActiveTab('cortex')} 
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
        </nav>

        <div className="mt-auto">
          <NavIcon icon={Settings} />
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
                'Neural Link Active'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-lg border border-white/5">
                <Search className="h-4 w-4 text-secondary" />
                <span className="text-xs text-secondary font-code">Cmd + K to Search Cognitive Mesh</span>
             </div>
             <div className="h-10 w-10 rounded-full bg-primary/40 border border-accent/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
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
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
              {/* Chat/Avatar - Main Panel */}
              <section className="lg:col-span-8 flex flex-col min-h-0">
                <ChatInterface />
              </section>

              {/* Right Monitoring Panel */}
              <aside className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 system-log">
                <CognitiveStats />
                <SecurityPanel />
                
                {/* Vision Shortcut */}
                <div className="p-4 bg-accent/5 rounded-xl border border-accent/20 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-headline text-accent uppercase tracking-wider flex items-center gap-2">
                        <Eye className="h-3 w-3" /> Visual Cortex
                      </h3>
                      <button 
                        onClick={() => setActiveTab('vision')}
                        className="text-[10px] font-code text-accent hover:underline"
                      >
                        Enter Vision
                      </button>
                    </div>
                    <p className="text-[10px] text-secondary mb-3 italic">"Brockston sees Everett. Loyalty confirmed."</p>
                    <Button size="sm" variant="outline" className="w-full text-[10px] h-7 border-accent/20 hover:bg-accent/10" onClick={() => setActiveTab('vision')}>
                      Activate Feed
                    </Button>
                </div>

                {/* Cortex Shortcut */}
                <div className="p-4 bg-primary/10 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-headline text-secondary uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit className="h-3 w-3 text-accent" /> Reasoning Matrix
                      </h3>
                      <button 
                        onClick={() => setActiveTab('cortex')}
                        className="text-[10px] font-code text-accent hover:underline"
                      >
                        Enter Cortex
                      </button>
                    </div>
                    <div className="space-y-3">
                      <MemoryTag label="Loyalty Protocol 100%" time="Active" />
                      <MemoryTag label="Proactive Insights" time="3 new" />
                      <MemoryTag label="Knowledge Loop" time="Syncing..." />
                    </div>
                </div>
              </aside>
            </div>
          )}
        </div>
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
