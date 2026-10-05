import React, { useState } from 'react';
import { FinWiseApp } from './components/FinWiseApp';
import { ArchitectureView } from './components/ArchitectureView';
import { ErDiagramView } from './components/ErDiagramView';
import { SchemaExplorer } from './components/SchemaExplorer';
import { FlywayViewer } from './components/FlywayViewer';
import { FintechDecisions } from './components/FintechDecisions';
import { AiFinancialSimulator } from './components/AiFinancialSimulator';
import { Phase2Viewer } from './components/Phase2Viewer';
import { Phase3Viewer } from './components/Phase3Viewer';
import { Phase4Viewer } from './components/Phase4Viewer';
import { Phase5Viewer } from './components/Phase5Viewer';
import { Phase6Viewer } from './components/Phase6Viewer';
import { Phase7Viewer } from './components/Phase7Viewer';
import { Phase8Viewer } from './components/Phase8Viewer';
import { Phase9Viewer } from './components/Phase9Viewer';
import { Phase10Viewer } from './components/Phase10Viewer';
import { Phase11Viewer } from './components/Phase11Viewer';
import { Phase12Viewer } from './components/Phase12Viewer';
import { V1_INIT_SCHEMA_SQL, V2_SEED_DATA_SQL } from './data/flywayScripts';
import {
  Layers,
  Database,
  Table,
  FileCode2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Github,
  Award,
  ChevronRight,
  FileBox,
  Binary,
  KeyRound,
  Wallet,
  CalendarClock,
  FileSpreadsheet,
  Bot,
  BarChart3,
  Radio,
  Boxes,
  ArrowLeft,
} from 'lucide-react';

export default function App() {
  const [appMode, setAppMode] = useState<'app' | 'architecture'>('app');
  const [activeTab, setActiveTab] = useState<'arch' | 'erd' | 'schema' | 'flyway' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'phase6' | 'phase7' | 'phase8' | 'phase9' | 'phase10' | 'phase11' | 'phase12' | 'adr' | 'ai'>('phase12');

  const phases = [
    { num: 1, name: 'Architecture & Schema', status: 'COMPLETED' },
    { num: 2, name: 'POM & Core Infra', status: 'COMPLETED' },
    { num: 3, name: 'Entities & Repos', status: 'COMPLETED' },
    { num: 4, name: 'Security & 2FA', status: 'COMPLETED' },
    { num: 5, name: 'Accounts & Ledger', status: 'COMPLETED' },
    { num: 6, name: 'Budget & Batch', status: 'COMPLETED' },
    { num: 7, name: 'CSV Bank Importer', status: 'COMPLETED' },
    { num: 8, name: 'Gemini AI Insights', status: 'COMPLETED' },
    { num: 9, name: 'Reports & Analytics', status: 'COMPLETED' },
    { num: 10, name: 'Quartz & RabbitMQ', status: 'COMPLETED' },
    { num: 11, name: 'Docker & Tests', status: 'COMPLETED' },
    { num: 12, name: 'Swagger & Resume', status: 'COMPLETED' },
  ];

  if (appMode === 'app') {
    return <FinWiseApp onSwitchToArchitecture={() => setAppMode('architecture')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAppMode('app')}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Live App
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold tracking-tight">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">FinWise AI</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30">
                  SYSTEM DESIGN &amp; CODE (12 PHASES)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Spring Boot 3.2.x • MySQL 8.0 • Gemini 3.8 Flash • Redis 7</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">All 12 Phases Implemented</span>
            </div>
            <div className="flex items-center gap-1.5 bg-indigo-600/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" />
              <span>Resume Flagship</span>
            </div>
          </div>
        </div>
      </header>

      {/* Phase Roadmap Stepper */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 py-2.5 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs min-w-max">
          <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mr-1">Phases:</span>
          {phases.map((p) => (
            <div
              key={p.num}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                p.status === 'ACTIVE'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : p.status === 'NEXT'
                  ? 'bg-slate-800 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900/60 text-slate-500'
              }`}
            >
              <span>P{p.num}</span>
              <span className="text-[10px] font-sans font-normal opacity-90">{p.name}</span>
              {p.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3 text-white" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'phase12', label: 'Phase 12: Swagger & Resume', icon: Award },
            { id: 'phase11', label: 'Phase 11: Docker & Tests', icon: Boxes },
            { id: 'phase10', label: 'Phase 10: Quartz & RabbitMQ', icon: Radio },
            { id: 'phase9', label: 'Phase 9: Reports & Analytics', icon: BarChart3 },
            { id: 'phase8', label: 'Phase 8: Gemini AI Insights', icon: Bot },
            { id: 'phase7', label: 'Phase 7: CSV Bank Importer', icon: FileSpreadsheet },
            { id: 'phase6', label: 'Phase 6: Budget & Batch', icon: CalendarClock },
            { id: 'phase5', label: 'Phase 5: Accounts & Ledger', icon: Wallet },
            { id: 'phase4', label: 'Phase 4: Security & 2FA', icon: KeyRound },
            { id: 'phase3', label: 'Phase 3: Entities & Repos', icon: Binary },
            { id: 'phase2', label: 'Phase 2: POM & Core Infra', icon: FileBox },
            { id: 'arch', label: 'System Architecture', icon: Layers },
            { id: 'erd', label: 'ER Diagram (Mermaid)', icon: Database },
            { id: 'schema', label: 'Schema & Tables (12)', icon: Table },
            { id: 'flyway', label: 'Flyway SQL (V1 & V2)', icon: FileCode2 },
            { id: 'adr', label: 'Fintech ADR Decisions', icon: ShieldCheck },
            { id: 'ai', label: 'Live AI Simulator & Deduplication', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-400'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Views */}
        {activeTab === 'phase12' && <Phase12Viewer />}
        {activeTab === 'phase11' && <Phase11Viewer />}
        {activeTab === 'phase10' && <Phase10Viewer />}
        {activeTab === 'phase9' && <Phase9Viewer />}
        {activeTab === 'phase8' && <Phase8Viewer />}
        {activeTab === 'phase7' && <Phase7Viewer />}
        {activeTab === 'phase6' && <Phase6Viewer />}
        {activeTab === 'phase5' && <Phase5Viewer />}
        {activeTab === 'phase4' && <Phase4Viewer />}
        {activeTab === 'phase3' && <Phase3Viewer />}
        {activeTab === 'phase2' && <Phase2Viewer />}
        {activeTab === 'arch' && <ArchitectureView />}
        {activeTab === 'erd' && <ErDiagramView />}
        {activeTab === 'schema' && <SchemaExplorer />}
        {activeTab === 'flyway' && <FlywayViewer v1Sql={V1_INIT_SCHEMA_SQL} v2Sql={V2_SEED_DATA_SQL} />}
        {activeTab === 'adr' && <FintechDecisions />}
        {activeTab === 'ai' && <AiFinancialSimulator />}
      </main>

      {/* Footer & Next Phase Callout */}
      <footer className="border-t border-slate-800/80 bg-slate-900/80 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-200">FinWise AI</span> — Smart Personal Finance & Expense Tracker
            <span className="mx-2">•</span>
            Designed for High-Concurrency Fintech Reliability
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> All 12 Architectural Phases Complete!
            </span>
            <span className="px-3 py-1 bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg font-mono font-medium">
              100% PRODUCTION READY
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
