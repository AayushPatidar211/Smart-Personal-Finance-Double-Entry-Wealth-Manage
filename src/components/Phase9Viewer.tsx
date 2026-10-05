import React, { useState } from 'react';
import {
  REPORT_SERVICE_JAVA,
  REPORT_SERVICE_IMPL_JAVA,
  REPORT_CONTROLLER_JAVA,
} from '../data/phase9Data';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  FileText,
  Copy,
  Check,
  Terminal,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Phase9Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'budget-variance' | 'sources'>('analytics');
  const [selectedFile, setSelectedFile] = useState<'service' | 'serviceImpl' | 'controller'>('serviceImpl');
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const files = {
    service: { name: 'ReportService.java', path: 'src/main/java/com/finwise/service/ReportService.java', code: REPORT_SERVICE_JAVA },
    serviceImpl: { name: 'ReportServiceImpl.java', path: 'src/main/java/com/finwise/service/impl/ReportServiceImpl.java', code: REPORT_SERVICE_IMPL_JAVA },
    controller: { name: 'ReportController.java', path: 'src/main/java/com/finwise/controller/ReportController.java', code: REPORT_CONTROLLER_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    // Generate text/pdf simulation download
    const element = document.createElement('a');
    const file = new Blob(
      [
        `FinWise AI — Financial Summary Report\nPeriod: October 2026\nTotal Income: $8,500.00\nTotal Expenses: $3,982.50\nNet Savings: $4,517.50 (53.1%)\n\nCategories:\n- Housing: $1,750.00\n- Food & Dining: $842.00\n- Transportation: $380.00\n- Utilities: $220.00\n- Shopping: $415.00\n- Entertainment: $375.50\n\nGenerated with iText 7 PDF Engine.`,
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'FinWise_Financial_Report_Oct2026.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloadSuccess('PDF Report exported successfully (iText 7 format generated).');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadCsv = () => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `Transaction ID,Date,Type,Category,Account,Amount,Currency,Description\n1001,2026-10-01,EXPENSE,Food & Dining,Chase Checking,45.00,USD,Swiggy Delivery\n1002,2026-10-02,EXPENSE,Transportation,Chase Checking,38.00,USD,Uber Trip\n1003,2026-10-03,INCOME,Salary,Chase Checking,8500.00,USD,Monthly Salary Credit\n1004,2026-10-04,EXPENSE,Housing,Marcus Savings,1750.00,USD,Apartment Rent`,
      ],
      { type: 'text/csv' }
    );
    element.href = URL.createObjectURL(file);
    element.download = 'FinWise_Transactions_Ledger.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setDownloadSuccess('CSV Ledger exported successfully.');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" /> Phase 9: Reports &amp; Analytics Engine
            </div>
            <h2 className="text-xl font-bold text-white">Financial Analytics, Chart.js Structures &amp; iText 7 PDF Export</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Aggregated monthly/quarterly KPIs, interactive Chart.js JSON generation, cash flow velocity, and server-side PDF reporting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Analytics Dashboard
              </button>
              <button
                onClick={() => setActiveTab('budget-variance')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'budget-variance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Budget vs Actual
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

            {activeTab === 'sources' ? (
              <button
                onClick={copyCode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
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

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      {/* Tab 1: Analytics Dashboard */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-slate-400 text-xs block">Total Inflow (Income)</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                <ArrowUpRight className="w-5 h-5" /> $8,500.00
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Monthly Salary + Dividends</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-slate-400 text-xs block">Total Outflow (Expenses)</span>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1 flex items-center gap-1.5">
                <ArrowDownRight className="w-5 h-5" /> $3,982.50
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Across 6 active categories</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-slate-400 text-xs block">Net Monthly Savings</span>
              <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">+$4,517.50</div>
              <span className="text-[11px] text-emerald-400 mt-1 block">+12.8% vs last month</span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
              <span className="text-slate-400 text-xs block">Savings Rate Percentage</span>
              <div className="text-2xl font-bold font-mono text-white mt-1">53.1%</div>
              <span className="text-[11px] text-indigo-400 mt-1 block">Exceeds 20% benchmark</span>
            </div>
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Expense Breakdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-indigo-400" /> Category Breakdown (Chart.js Pie Dataset)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">Total: $3,982.50</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Housing & Rent', amount: 1750.00, pct: 43.9, color: 'bg-indigo-500' },
                  { name: 'Food & Dining Out', amount: 842.00, pct: 21.1, color: 'bg-rose-500' },
                  { name: 'Shopping & Retail', amount: 415.00, pct: 10.4, color: 'bg-amber-500' },
                  { name: 'Transportation & Fuel', amount: 380.00, pct: 9.5, color: 'bg-emerald-500' },
                  { name: 'Entertainment & Subs', amount: 375.50, pct: 9.4, color: 'bg-purple-500' },
                  { name: 'Utilities & Bills', amount: 220.00, pct: 5.5, color: 'bg-cyan-500' },
                ].map((c) => (
                  <div key={c.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-sans">{c.name}</span>
                      <span className="text-slate-400">
                        ${c.amount.toFixed(2)} ({c.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${c.color}`} style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cash Flow Income vs Expense Bar Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" /> Weekly Cash Flow (Income vs Expense)
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">October 2026</span>
              </div>

              <div className="grid grid-cols-4 gap-4 h-56 pt-8 pb-4 items-end">
                {[
                  { week: 'Week 1', income: 5100, expense: 995 },
                  { week: 'Week 2', income: 850, expense: 1195 },
                  { week: 'Week 3', income: 1700, expense: 995 },
                  { week: 'Week 4', income: 850, expense: 797.5 },
                ].map((w) => (
                  <div key={w.week} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="flex gap-1.5 items-end h-44">
                      {/* Income Bar */}
                      <div
                        className="w-5 bg-emerald-500 rounded-t"
                        style={{ height: `${(w.income / 5500) * 100}%` }}
                        title={`Income: $${w.income}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-5 bg-rose-500 rounded-t"
                        style={{ height: `${(w.expense / 5500) * 100}%` }}
                        title={`Expense: $${w.expense}`}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{w.week}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-6 pt-2 border-t border-slate-800 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm inline-block" /> Inflow (Income)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400 font-mono">
                  <span className="w-3 h-3 bg-rose-500 rounded-sm inline-block" /> Outflow (Expense)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Budget vs Actual Variance Table */}
      {activeTab === 'budget-variance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" /> Budget vs. Actual Variance Report
            </h3>
            <span className="text-xs text-slate-400">Current Period: Oct 1 - Oct 31, 2026</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Budget Limit</th>
                  <th className="p-3 text-right">Actual Spent</th>
                  <th className="p-3 text-right">Variance (Remaining)</th>
                  <th className="p-3 text-right">% Consumed</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {[
                  { cat: 'Housing & Rent', limit: 1750.00, actual: 1750.00, var: 0.00, pct: 100.0, status: 'AT_LIMIT' },
                  { cat: 'Food & Dining Out', limit: 400.00, actual: 385.60, var: 14.40, pct: 96.4, status: 'NEAR_LIMIT' },
                  { cat: 'Groceries & Household', limit: 650.00, actual: 512.40, var: 137.60, pct: 78.8, status: 'SAFE' },
                  { cat: 'Transportation & Fuel', limit: 450.00, actual: 380.00, var: 70.00, pct: 84.4, status: 'NEAR_LIMIT' },
                  { cat: 'Entertainment & Subs', limit: 120.00, actual: 84.97, var: 35.03, pct: 70.8, status: 'SAFE' },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-sans font-medium">{row.cat}</td>
                    <td className="p-3 text-right">${row.limit.toFixed(2)}</td>
                    <td className="p-3 text-right font-bold">${row.actual.toFixed(2)}</td>
                    <td className="p-3 text-right text-emerald-400">${row.var.toFixed(2)}</td>
                    <td className="p-3 text-right">{row.pct}%</td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          row.status === 'AT_LIMIT'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : row.status === 'NEAR_LIMIT'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
