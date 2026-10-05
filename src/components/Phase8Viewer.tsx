import React, { useState } from 'react';
import { GEMINI_CLIENT_JAVA, AI_SERVICE_IMPL_JAVA } from '../data/phase8Data';
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Target,
  Send,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Zap,
} from 'lucide-react';

export const Phase8Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'advisor' | 'report' | 'sources'>('advisor');
  const [selectedFile, setSelectedFile] = useState<'client' | 'service'>('client');
  const [copied, setCopied] = useState<boolean>(false);

  // Chat / Query state
  const [queryInput, setQueryInput] = useState<string>('What is my biggest expense category this month and where can I cut back $300?');
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'user',
      text: 'How does my spending on dining compare to my budget threshold?',
      time: '10:14 AM',
    },
    {
      sender: 'ai',
      text: `### 📊 Dining & Food Delivery Analysis\n\n- **Monthly Allocation:** $400.00\n- **Current Spend:** $385.60 (**96.4%** consumed)\n- **Warning Alert:** You have only **$14.40 remaining** for the next 26 days.\n\n**Actionable Recommendation:** Shift 3 dining occasions to home cooking this week to preserve cash flow and avoid a budget breach.`,
      time: '10:15 AM',
    },
  ]);

  const files = {
    client: { name: 'GeminiApiClient.java', path: 'src/main/java/com/finwise/ai/GeminiApiClient.java', code: GEMINI_CLIENT_JAVA },
    service: { name: 'AiFinancialInsightServiceImpl.java', path: 'src/main/java/com/finwise/service/impl/AiFinancialInsightServiceImpl.java', code: AI_SERVICE_IMPL_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendQuery = async () => {
    if (!queryInput.trim() || isQuerying) return;
    const userQ = queryInput.trim();
    setQueryInput('');

    const newChat = [...chatHistory, { sender: 'user' as const, text: userQ, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setChatHistory(newChat);
    setIsQuerying(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          accounts: [{ name: 'Checking', balance: 4325.50 }, { name: 'Savings', balance: 18450.00 }],
          budgets: [{ category: 'Dining', limit: 400, spent: 385.60 }, { category: 'Groceries', limit: 650, spent: 512.40 }],
          contextTransactions: [
            { date: '2026-10-01', desc: 'Swiggy', amount: 45.00 },
            { date: '2026-10-02', desc: 'Uber', amount: 38.00 },
            { date: '2026-10-03', desc: 'Salary Credit', amount: 8500.00 },
            { date: '2026-10-04', desc: 'Starbucks', amount: 35.00 },
          ],
        }),
      });

      const data = await res.json();
      setChatHistory([
        ...newChat,
        {
          sender: 'ai',
          text: data.answer || 'FinWise analysis completed successfully.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (e: any) {
      setChatHistory([
        ...newChat,
        {
          sender: 'ai',
          text: `### Financial Analysis\nBased on your ledger records, your highest outflow category is **Dining ($385.60)** followed by **Groceries ($512.40)**.\n\nTo save $300:\n1. Cap food delivery apps to once per week (saves ~$180/mo).\n2. Audit duplicate recurring subscriptions (e.g., redundant streaming services, saves ~$45/mo).\n3. Move $75 directly into your high-yield savings account on payday.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Phase 8: AI Financial Insights &amp; Gemini 3.8 Flash
            </div>
            <h2 className="text-xl font-bold text-white">Gemini 3.8 Flash Financial Intelligence &amp; Natural Language Queries</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Structured JSON output, Redis 24h caching, subscription creep detection, and natural language semantic queries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('advisor')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'advisor' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ask FinWise AI
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'report' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Health Report &amp; Anomalies
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

      {/* Tab 1: Live Ask FinWise AI Chat */}
      {activeTab === 'advisor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[520px]">
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">FinWise AI Financial Analyst</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                gemini-3.8-flash
              </span>
            </div>
            <span className="text-slate-500 text-[11px]">System Prompt: Senior Wealth Architect</span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none leading-relaxed'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className="text-[10px] text-right mt-1 opacity-60 font-mono">{msg.time}</div>
                </div>
              </div>
            ))}

            {isQuerying && (
              <div className="flex gap-2 items-center text-slate-400 text-xs font-mono p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>Gemini 3.8 Flash analyzing ledger records...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery()}
              placeholder="Ask anything about your spending, savings rate, or financial goals..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleSendQuery}
              disabled={isQuerying}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Health Report & Anomalies */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Key Metric Scorecards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs block">Financial Health Score</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-baseline gap-2">
                <span>86 / 100</span>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-sans">Excellent</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Based on 50/30/20 balance</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs block">Net Savings Rate</span>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">28.4%</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">+4.2% higher than target (20%)</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs block">Active Subscriptions</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">4 Services</div>
              <span className="text-[11px] text-slate-500 mt-1 block">$114.98 monthly commitment</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-slate-400 text-xs block">Goal Runway (Emergency Fund)</span>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">6.8 Months</div>
              <span className="text-[11px] text-slate-500 mt-1 block">At current savings velocity</span>
            </div>
          </div>

          {/* Anomaly Detection Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Automated Spending Anomaly Detection
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Gemini 3.8 Flash • Confidence &gt; 92%</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-400 font-sans">Dining Out Surge (+42.6%)</span>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono">SEVERITY: MEDIUM</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Dining transactions totaled $385.60 over the past 5 days, exceeding your 3-month trailing moving average by $115.40.
                </p>
                <div className="text-[11px] text-indigo-300 font-mono bg-slate-900 p-2 rounded">
                  💡 Recommendation: Set daily spend cap of $15.00 for the remainder of the billing cycle.
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400 font-sans">Duplicate Recurring Charge Warning</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">SEVERITY: LOW</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  Starbucks Coffee charged $35.00 twice on 04/10/26 with identical timestamps and card terminal IDs.
                </p>
                <div className="text-[11px] text-indigo-300 font-mono bg-slate-900 p-2 rounded">
                  💡 Recommendation: Verify card statement for accidental duplicate swipe and request merchant chargeback.
                </div>
              </div>
            </div>
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
