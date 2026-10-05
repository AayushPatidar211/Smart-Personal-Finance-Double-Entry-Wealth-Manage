import React, { useState } from 'react';
import {
  BATCH_CONFIG_JAVA,
  BATCH_PROCESSOR_JAVA,
  BUDGET_SERVICE_IMPL_JAVA,
} from '../data/phase6Data';
import {
  PieChart,
  CalendarClock,
  Play,
  Copy,
  Check,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BellRing,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MockBudget {
  id: number;
  category: string;
  color: string;
  limit: number;
  spent: number;
  threshold: number;
}

export const Phase6Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'budgets' | 'batch-sim' | 'sources'>('batch-sim');
  const [selectedFile, setSelectedFile] = useState<'config' | 'processor' | 'budgetService'>('config');
  const [copied, setCopied] = useState<boolean>(false);

  // Budget alert testing state
  const [budgets, setBudgets] = useState<MockBudget[]>([
    { id: 201, category: 'Groceries & Supermarket', color: '#F97316', limit: 650.00, spent: 512.40, threshold: 80 },
    { id: 202, category: 'Dining Out & Cafes', color: '#F43F5E', limit: 400.00, spent: 385.60, threshold: 80 },
    { id: 203, category: 'Entertainment & Subscriptions', color: '#8B5CF6', limit: 120.00, spent: 84.97, threshold: 80 },
  ]);

  const [addExpenseAmount, setAddExpenseAmount] = useState<string>('30.00');
  const [expenseAlertMsg, setExpenseAlertMsg] = useState<string | null>(null);

  // Batch simulation state
  const [batchRunning, setBatchRunning] = useState<boolean>(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([
    '[INIT] Spring Batch 5 engine loaded. Chunk size: 50. Skip/Retry configured.',
    '[IDLE] Job "recurringTransactionJob" awaiting schedule trigger (0 0 2 * * ?)',
  ]);
  const [batchStats, setBatchStats] = useState<{ processed: number; skipped: number; committed: number }>({
    processed: 0,
    skipped: 0,
    committed: 0,
  });

  const files = {
    config: { name: 'RecurringTransactionBatchConfig.java', path: 'src/main/java/com/finwise/config/RecurringTransactionBatchConfig.java', code: BATCH_CONFIG_JAVA },
    processor: { name: 'RecurringRuleItemProcessor.java', path: 'src/main/java/com/finwise/batch/recurring/RecurringRuleItemProcessor.java', code: BATCH_PROCESSOR_JAVA },
    budgetService: { name: 'BudgetServiceImpl.java', path: 'src/main/java/com/finwise/service/impl/BudgetServiceImpl.java', code: BUDGET_SERVICE_IMPL_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateExpense = (budgetId: number) => {
    const amt = parseFloat(addExpenseAmount);
    if (isNaN(amt) || amt <= 0) return;

    setBudgets((prev) =>
      prev.map((b) => {
        if (b.id === budgetId) {
          const newSpent = parseFloat((b.spent + amt).toFixed(2));
          const pct = (newSpent / b.limit) * 100;
          if (pct >= 100) {
            setExpenseAlertMsg(`🚨 CRITICAL ALERT (RabbitMQ event sent): Budget for "${b.category}" exceeded 100% (Spent: $${newSpent} / Limit: $${b.limit})`);
          } else if (pct >= b.threshold) {
            setExpenseAlertMsg(`⚠️ WARNING ALERT (RabbitMQ event sent): Budget for "${b.category}" reached ${pct.toFixed(1)}% of limit.`);
          } else {
            setExpenseAlertMsg(`Expense of $${amt} recorded successfully. Category is within budget.`);
          }
          return { ...b, spent: newSpent };
        }
        return b;
      })
    );
  };

  const runBatchJob = () => {
    setBatchRunning(true);
    setBatchLogs([
      `[JOB_STARTED] Launching recurringTransactionJob (JobInstanceId: 489, Params: {timestamp=${Date.now()}})`,
      `[STEP_STARTED] Step "recurringTransactionStep" initialized with ChunkSize=50`,
    ]);

    setTimeout(() => {
      setBatchLogs((prev) => [
        ...prev,
        `[READER] RepositoryItemReader executed "findDueRulesForExecution". Found 2 due rules:`,
        `  -> Rule #301: Apartment Rent ($1,750.00, Account #101)`,
        `  -> Rule #302: Netflix Subscription ($22.99, Account #103)`,
      ]);
    }, 600);

    setTimeout(() => {
      setBatchLogs((prev) => [
        ...prev,
        `[PROCESSOR] Checking SHA-256 Idempotency for Rule #301 (Hash: e3b0c442...) -> PASS (Not yet executed today)`,
        `[PROCESSOR] Rule #301 nextRunDate advanced to 2026-11-01. Account #101 debited $1,750.00`,
        `[PROCESSOR] Checking SHA-256 Idempotency for Rule #302 (Hash: a1b2c3d4...) -> PASS (Not yet executed today)`,
        `[PROCESSOR] Rule #302 nextRunDate advanced to 2026-11-02. Account #103 debited $22.99`,
      ]);
    }, 1300);

    setTimeout(() => {
      setBatchLogs((prev) => [
        ...prev,
        `[WRITER] Chunk of 2 items received. Executing atomic InnoDB batch commit:`,
        `  -> INSERT INTO transactions (id, user_id, amount, is_recurring...) VALUES (1006, 1, 1750.00, true), (1007, 1, 22.99, true)`,
        `  -> UPDATE accounts SET balance = balance - 1750.00, version = version + 1 WHERE id = 101`,
        `  -> UPDATE accounts SET balance = balance - 22.99, version = version + 1 WHERE id = 103`,
        `  -> UPDATE recurring_rules SET last_run_date = '2026-10-05', next_run_date = ... WHERE id IN (301, 302)`,
        `[STEP_COMPLETED] Step "recurringTransactionStep" finished with ExitStatus=COMPLETED (Read: 2, Write: 2, Commit: 1)`,
        `[JOB_COMPLETED] Job "recurringTransactionJob" status: COMPLETED in 1.82s`,
      ]);
      setBatchStats({ processed: 2, skipped: 0, committed: 2 });
      setBatchRunning(false);
    }, 2100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CalendarClock className="w-4 h-4" /> Phase 6: Budget Monitoring &amp; Spring Batch 5 Recurring Engine
            </div>
            <h2 className="text-xl font-bold text-white">Automated Transaction Batch Pipeline &amp; 80%/100% Alert Thresholds</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Chunk-oriented (size 50) batch processing with SHA-256 idempotency checks and real-time category budget threshold alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('batch-sim')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'batch-sim' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Spring Batch Lab
              </button>
              <button
                onClick={() => setActiveTab('budgets')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'budgets' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Budget Alerts
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'sources' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Java Sources
              </button>
            </div>

            {activeTab === 'sources' && (
              <button
                onClick={copyCode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            )}
          </div>
        </div>

        {activeTab === 'sources' && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-800">
            {Object.entries(files).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  selectedFile === key ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {val.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Spring Batch Simulator */}
      {activeTab === 'batch-sim' && (
        <div className="space-y-6">
          {/* Top Bar with Launch Button and Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" /> Spring Batch 5 Execution Runner
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Reader (`findDueRulesForExecution`) → Processor (Idempotency SHA-256 + Advance Next Run) → Writer (Chunk Persist 50)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={runBatchJob}
                  disabled={batchRunning}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${batchRunning ? 'animate-spin' : ''}`} />
                  {batchRunning ? 'Executing Chunk Step...' : 'Launch Batch Job Now'}
                </button>
              </div>
            </div>

            {/* Metrics pills */}
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Items Read / Processed</span>
                <span className="text-indigo-400 font-bold text-base">{batchStats.processed} items</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Duplicate Skipped (Idempotent)</span>
                <span className="text-amber-400 font-bold text-base">{batchStats.skipped} items</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Transactions Committed</span>
                <span className="text-emerald-400 font-bold text-base">{batchStats.committed} items</span>
              </div>
            </div>
          </div>

          {/* Terminal Logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spring Batch Execution Log — recurringTransactionJob</span>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">ChunkSize=50</span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-[360px] overflow-y-auto">
              {batchLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.includes('CRITICAL') || log.includes('🚨')
                      ? 'text-rose-400'
                      : log.includes('COMPLETED') || log.includes('PASS')
                      ? 'text-emerald-400'
                      : log.includes('PROCESSOR') || log.includes('READER')
                      ? 'text-indigo-300'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Budget Alerts */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" /> Active Budgets &amp; 80%/100% Alert Thresholds
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulate spending against a category to trigger the warning or exceeded alert events.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {budgets.map((b) => {
                const pct = Math.min(100, (b.spent / b.limit) * 100);
                const isOver = b.spent >= b.limit;
                const isWarning = !isOver && (b.spent / b.limit) * 100 >= b.threshold;

                return (
                  <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate max-w-[180px]">{b.category}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          isOver
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isOver ? 'EXCEEDED 100%' : isWarning ? 'WARNING 80%' : 'SAFE'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className="text-lg font-bold text-white">${b.spent.toFixed(2)}</span>
                      <span className="text-slate-500">of ${b.limit.toFixed(2)}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Threshold: {b.threshold}%</span>
                      <span>{((b.spent / b.limit) * 100).toFixed(1)}% Used</span>
                    </div>

                    <button
                      onClick={() => handleSimulateExpense(b.id)}
                      className="w-full mt-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-all"
                    >
                      + Add $30 Expense
                    </button>
                  </div>
                );
              })}
            </div>

            {expenseAlertMsg && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-300">
                {expenseAlertMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Sources View */}
      {activeTab === 'sources' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>{currentFile.path}</span>
            </div>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded uppercase">Java 17</span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-text">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
