import React, { useState } from 'react';
import {
  USER_JAVA,
  ACCOUNT_JAVA,
  TRANSACTION_JAVA,
  ACCOUNT_REPOSITORY_JAVA,
  TRANSACTION_REPOSITORY_JAVA,
} from '../data/phase3Data';
import {
  Layers,
  Copy,
  Check,
  Download,
  Terminal,
  Lock,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Database,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Phase3Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entity' | 'repo' | 'locking-sim'>('entity');
  const [selectedEntity, setSelectedEntity] = useState<'user' | 'account' | 'transaction'>('account');
  const [selectedRepo, setSelectedRepo] = useState<'accountRepo' | 'transactionRepo'>('accountRepo');
  const [copied, setCopied] = useState<boolean>(false);

  // Concurrency simulator state
  const [concurrencyMode, setConcurrencyMode] = useState<'pessimistic' | 'naive'>('pessimistic');
  const [simStep, setSimStep] = useState<number>(0);

  const entityFiles = {
    user: { name: 'User.java', path: 'src/main/java/com/finwise/entity/User.java', code: USER_JAVA },
    account: { name: 'Account.java', path: 'src/main/java/com/finwise/entity/Account.java', code: ACCOUNT_JAVA },
    transaction: { name: 'Transaction.java', path: 'src/main/java/com/finwise/entity/Transaction.java', code: TRANSACTION_JAVA },
  };

  const repoFiles = {
    accountRepo: { name: 'AccountRepository.java', path: 'src/main/java/com/finwise/repository/AccountRepository.java', code: ACCOUNT_REPOSITORY_JAVA },
    transactionRepo: { name: 'TransactionRepository.java', path: 'src/main/java/com/finwise/repository/TransactionRepository.java', code: TRANSACTION_REPOSITORY_JAVA },
  };

  const currentFile = activeTab === 'entity' ? entityFiles[selectedEntity] : repoFiles[selectedRepo];

  const copyContent = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" /> Phase 3: Domain Entities & Repository Architecture
            </div>
            <h2 className="text-xl font-bold text-white">JPA Entities & Pessimistic Concurrency Repositories</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Production Spring Data JPA entities with BigDecimal scale-2 guarantees, and repositories with pessimistic write locking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('entity')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'entity' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                JPA Entities
              </button>
              <button
                onClick={() => setActiveTab('repo')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'repo' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Repositories &amp; Queries
              </button>
              <button
                onClick={() => setActiveTab('locking-sim')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'locking-sim' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Locking Concurrency Lab
              </button>
            </div>

            {activeTab !== 'locking-sim' && (
              <button
                onClick={copyContent}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            )}
          </div>
        </div>

        {/* Sub-selector pills */}
        {activeTab === 'entity' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
            {Object.entries(entityFiles).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedEntity(key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedEntity === key ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'repo' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
            {Object.entries(repoFiles).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedRepo(key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedRepo === key ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Code Viewer */}
      {activeTab !== 'locking-sim' ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentFile.path}</span>
            </div>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded uppercase">Java 17</span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[520px] leading-relaxed select-text">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      ) : (
        /* Concurrency & Pessimistic Locking Simulator */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" /> Pessimistic Write Lock (SELECT ... FOR UPDATE) Visualizer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate two concurrent threads attempting to withdraw/transfer $3,000 from an account with $4,000 balance.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => {
                  setConcurrencyMode('pessimistic');
                  setSimStep(0);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  concurrencyMode === 'pessimistic' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                FinWise: Pessimistic Lock
              </button>
              <button
                onClick={() => {
                  setConcurrencyMode('naive');
                  setSimStep(0);
                }}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  concurrencyMode === 'naive' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Naive (Race Condition)
              </button>
            </div>
          </div>

          {/* Steps visualizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Thread 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-indigo-400 font-mono">Thread 1: Transfer $3,000</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">HTTP Request #1</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className={`p-2 rounded ${simStep >= 1 ? 'bg-indigo-950/60 border border-indigo-700/50 text-indigo-200' : 'text-slate-600'}`}>
                  1. Executes: {concurrencyMode === 'pessimistic' ? 'findByIdForUpdate(101)' : 'findById(101)'}
                </div>
                <div className={`p-2 rounded ${simStep >= 2 ? 'bg-indigo-950/60 border border-indigo-700/50 text-indigo-200' : 'text-slate-600'}`}>
                  2. Reads Balance: $4,000.00 {concurrencyMode === 'pessimistic' && <span className="text-emerald-400">(LOCK ACQUIRED)</span>}
                </div>
                <div className={`p-2 rounded ${simStep >= 3 ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-200' : 'text-slate-600'}`}>
                  3. Debits $3,000 → New Balance: $1,000.00. Commits &amp; Releases Lock.
                </div>
              </div>
            </div>

            {/* Thread 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-purple-400 font-mono">Thread 2: Transfer $3,000</span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">HTTP Request #2 (Concurrent)</span>
              </div>
              <div className="space-y-2 font-mono text-[11px]">
                <div className={`p-2 rounded ${simStep >= 1 ? 'bg-purple-950/60 border border-purple-700/50 text-purple-200' : 'text-slate-600'}`}>
                  1. Executes: {concurrencyMode === 'pessimistic' ? 'findByIdForUpdate(101)' : 'findById(101)'}
                </div>
                <div className={`p-2 rounded ${simStep >= 2 ? (concurrencyMode === 'pessimistic' ? 'bg-amber-950/60 border border-amber-700/50 text-amber-200' : 'bg-rose-950/60 border border-rose-700/50 text-rose-200') : 'text-slate-600'}`}>
                  2. {concurrencyMode === 'pessimistic'
                    ? 'BLOCKED WAITING FOR THREAD 1 LOCK RELEASE...'
                    : 'Dirty Read! Reads stale balance $4,000.00!'}
                </div>
                <div className={`p-2 rounded ${simStep >= 3 ? (concurrencyMode === 'pessimistic' ? 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-200' : 'bg-rose-950 border border-rose-600 text-rose-300 font-bold') : 'text-slate-600'}`}>
                  3. {concurrencyMode === 'pessimistic'
                    ? 'Lock Granted! Reads real balance $1,000.00 → Throws InsufficientFundsException (Safe!)'
                    : 'Overdraft Bug! Debits $3,000 → Account Balance drops to -$2,000.00 (FINANCIAL LOSS!)'}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Control */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              Simulation Stage: <span className="text-white font-bold">{simStep}/3</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSimStep((prev) => Math.max(0, prev - 1))}
                disabled={simStep === 0}
                className="px-3 py-1.5 bg-slate-800 disabled:opacity-40 text-slate-300 rounded text-xs font-medium"
              >
                Previous Step
              </button>
              <button
                onClick={() => setSimStep((prev) => Math.min(3, prev + 1))}
                disabled={simStep === 3}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded text-xs font-medium shadow"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
