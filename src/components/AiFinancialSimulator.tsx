import React, { useState } from 'react';
import { Sparkles, Send, AlertTriangle, ShieldCheck, CheckCircle2, TrendingUp, RefreshCw, Hash, ArrowUpRight } from 'lucide-react';

export const AiFinancialSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ask' | 'anomalies' | 'dedup'>('ask');

  // "Ask FinWise" state
  const [question, setQuestion] = useState('How can I optimize my food & dining spend this month to save $200?');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // "Anomaly Detection" state
  const [anomalyResult, setAnomalyResult] = useState<any | null>(null);
  const [loadingAnomaly, setLoadingAnomaly] = useState(false);

  // SHA-256 Deduplication state
  const [dedupForm, setDedupForm] = useState({
    userId: '1',
    accountId: '101',
    date: '2026-10-01',
    amount: '1750.00',
    description: 'October Apartment Rent Transfer',
  });
  const [computedHash, setComputedHash] = useState<string>('');

  const sampleTransactions = [
    { date: '2026-10-01', amount: 3750.00, category: 'Salary & Wages', merchant: 'TechCorp', type: 'INCOME' },
    { date: '2026-10-01', amount: 1750.00, category: 'Housing & Rent', merchant: 'Skyline Residences', type: 'EXPENSE' },
    { date: '2026-10-02', amount: 145.80, category: 'Groceries & Supermarket', merchant: 'Whole Foods Market', type: 'EXPENSE' },
    { date: '2026-10-03', amount: 165.20, category: 'Dining Out & Cafes', merchant: 'Nobu Downtown', type: 'EXPENSE' },
    { date: '2026-10-04', amount: 74.80, category: 'Dining Out & Cafes', merchant: 'Blue Bottle & Bistro', type: 'EXPENSE' },
    { date: '2026-10-04', amount: 88.50, category: 'Groceries & Supermarket', merchant: 'Trader Joe', type: 'EXPENSE' },
  ];

  const handleAskFinWise = async () => {
    if (!question.trim()) return;
    setLoadingAi(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          contextTransactions: sampleTransactions,
          accounts: [
            { name: 'Chase Checking', balance: 4325.50 },
            { name: 'Marcus Savings (4.4%)', balance: 18450.00 },
            { name: 'Amex Blue Cash', balance: 874.20 },
          ],
          budgets: [
            { category: 'Groceries', limit: 650.00, spent: 512.40 },
            { category: 'Dining Out', limit: 400.00, spent: 385.60 },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAiAnswer(data.answer);
    } catch (err: any) {
      setAiError(err.message || 'Failed to call FinWise AI service.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleRunAnomalyAnalysis = async () => {
    setLoadingAnomaly(true);
    try {
      const response = await fetch('/api/ai/analyze-anomalies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: sampleTransactions,
          monthlyBudgetTotal: 4500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setAnomalyResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAnomaly(false);
    }
  };

  const calculateHash = async () => {
    const raw = `${dedupForm.userId}|${dedupForm.accountId}|${dedupForm.date}|${dedupForm.amount}|${dedupForm.description.trim().toLowerCase()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    setComputedHash(hashHex);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Live AI Financial Subsystem
            </div>
            <h2 className="text-xl font-bold text-white">Google Gemini 3.8 Flash Financial Intelligence</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Live financial reasoning engine with prompt templates, anomaly detection, and cryptographic idempotency simulation.
            </p>
          </div>

          {/* Sub-Tabs */}
          <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
            <button
              onClick={() => setActiveTab('ask')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'ask' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ask FinWise (Chat)
            </button>
            <button
              onClick={() => setActiveTab('anomalies')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'anomalies' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Anomaly Detection
            </button>
            <button
              onClick={() => setActiveTab('dedup')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activeTab === 'dedup' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              SHA-256 Deduplication
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Ask FinWise */}
      {activeTab === 'ask' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" /> Financial Advisor Prompt & Query
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Queries the Gemini 3.8 Flash model armed with financial analyst system prompt and user ledger context.
              </p>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about spending trends, savings tips, debt repayment..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleAskFinWise()}
                  />
                  <button
                    onClick={handleAskFinWise}
                    disabled={loadingAi}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-900 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shrink-0"
                  >
                    {loadingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{loadingAi ? 'Analyzing...' : 'Ask AI'}</span>
                  </button>
                </div>

                {/* Preset Prompts */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  <span className="text-slate-500 py-1">Quick Prompts:</span>
                  {[
                    'Analyze my dining spending surge',
                    'Am I on track for 50/30/20 budgeting?',
                    'How much can I allocate to Marcus savings?',
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuestion(preset)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700/60"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 min-h-[220px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">FinWise AI Financial Analyst Output</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">model: gemini-3.8-flash</span>
              </div>

              {loadingAi && (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  <span>Synthesizing cash-flow ledger insights...</span>
                </div>
              )}

              {aiError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {!loadingAi && !aiError && aiAnswer && (
                <div className="prose prose-invert prose-xs text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {aiAnswer}
                </div>
              )}

              {!loadingAi && !aiError && !aiAnswer && (
                <div className="text-xs text-slate-500 italic text-center py-8">
                  Click "Ask AI" or select a preset prompt above to generate a live financial analysis from the Gemini API.
                </div>
              )}
            </div>
          </div>

          {/* User Context Preview */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              In-Memory Ledger Context Injected to Gemini
            </h4>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Accounts Balance State:</div>
                <div className="font-mono text-slate-200 space-y-0.5 text-[11px]">
                  <div>• Chase Checking: <span className="text-emerald-400">$4,325.50</span></div>
                  <div>• Marcus High Yield (4.4%): <span className="text-emerald-400">$18,450.00</span></div>
                  <div>• Amex Blue Cash: <span className="text-amber-400">$874.20</span></div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Active Budgets vs Spent:</div>
                <div className="font-mono text-slate-200 space-y-0.5 text-[11px]">
                  <div>• Groceries: $512.40 / $650.00 <span className="text-indigo-400">(78.8%)</span></div>
                  <div>• Dining Out: $385.60 / $400.00 <span className="text-rose-400 font-bold">(96.4% ALERT)</span></div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div className="text-slate-400 text-[11px] mb-1">Sample October Transactions:</div>
                <div className="space-y-1 text-[10px] font-mono text-slate-300">
                  <div>10/01: TechCorp Payroll (+$3,750.00)</div>
                  <div>10/01: Rent Transfer (-$1,750.00)</div>
                  <div>10/03: Nobu Sushi (-$165.20)</div>
                  <div>10/04: Blue Bottle (-$74.80)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Anomaly Detection */}
      {activeTab === 'anomalies' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-white">Automated Spending Anomaly & Runway Engine</h3>
              <p className="text-xs text-slate-400">
                Gemini processes the entire month's transaction stream and emits structured JSON containing flagged anomalies and savings opportunities.
              </p>
            </div>
            <button
              onClick={handleRunAnomalyAnalysis}
              disabled={loadingAnomaly}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
            >
              {loadingAnomaly ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>{loadingAnomaly ? 'Detecting Anomalies...' : 'Run Anomaly Scan'}</span>
            </button>
          </div>

          {anomalyResult ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400 uppercase font-semibold">Monthly Spending Digest</div>
                <p className="text-sm text-slate-200 mt-1 font-medium">{anomalyResult.monthlySummary}</p>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div>Total Spent: <span className="text-emerald-400 font-bold">${anomalyResult.totalSpent}</span></div>
                  <div>Top Category: <span className="text-indigo-400 font-bold">{anomalyResult.topCategory}</span></div>
                </div>
              </div>

              {/* Anomaly Cards */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Flagged Anomalies:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {anomalyResult.anomalies?.map((anom: any, idx: number) => (
                    <div key={idx} className="bg-rose-950/20 border border-rose-800/40 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-rose-300">{anom.category}</span>
                        <span className="px-2 py-0.5 bg-rose-900/60 text-rose-300 rounded text-[10px] font-bold">
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 text-[11px]">{anom.description}</p>
                      <div className="mt-2 text-[11px] text-slate-400">
                        <span className="text-slate-200 font-medium">Action: </span>
                        {anom.recommendedAction}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Saving Opportunities */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Identified Saving Opportunities:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {anomalyResult.savingOpportunities?.map((opp: any, idx: number) => (
                    <div key={idx} className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-emerald-300">{opp.title}</span>
                        <span className="text-emerald-400 font-mono font-bold">+${opp.potentialMonthlySavings}/mo</span>
                      </div>
                      <p className="text-slate-300 mt-1 text-[11px]">{opp.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-10 bg-slate-950 rounded-xl border border-slate-800">
              Click "Run Anomaly Scan" to prompt Gemini with structured JSON output schema for high-precision fintech anomaly detection.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Deduplication */}
      {activeTab === 'dedup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" /> SHA-256 Idempotent Duplicate Detection Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every bank import row generates a deterministic SHA-256 hash. If another statement row matches this hash within the same user ledger, it is rejected to prevent duplicate transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">User ID</label>
              <input
                type="text"
                value={dedupForm.userId}
                onChange={(e) => setDedupForm({ ...dedupForm, userId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Account ID</label>
              <input
                type="text"
                value={dedupForm.accountId}
                onChange={(e) => setDedupForm({ ...dedupForm, accountId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Date (YYYY-MM-DD)</label>
              <input
                type="text"
                value={dedupForm.date}
                onChange={(e) => setDedupForm({ ...dedupForm, date: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Amount (DECIMAL)</label>
              <input
                type="text"
                value={dedupForm.amount}
                onChange={(e) => setDedupForm({ ...dedupForm, amount: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Raw Description</label>
              <input
                type="text"
                value={dedupForm.description}
                onChange={(e) => setDedupForm({ ...dedupForm, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={calculateHash}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shadow"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Compute Idempotency Hash
            </button>
          </div>

          {computedHash && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-[11px] text-slate-400">Generated `checksum_hash` (Indexed UNIQUE candidate):</div>
              <div className="font-mono text-emerald-400 text-xs break-all bg-slate-900 p-2.5 rounded border border-slate-800">
                {computedHash}
              </div>
              <p className="text-[11px] text-slate-400">
                In Flyway V1 schema, <code className="text-indigo-400">KEY `idx_tx_checksum` (`user_id`, `checksum_hash`)</code> guarantees O(1) duplicate checks during multi-thousand row bank CSV statement imports.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
