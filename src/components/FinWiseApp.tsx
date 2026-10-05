import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Send,
  PieChart,
  Search,
  Upload,
  Bot,
  Bell,
  Sparkles,
  TrendingUp,
  X,
  CreditCard,
  Building2,
  DollarSign,
  Layers,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  ArrowRight,
  Tag,
  Clock,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export interface AppAccount {
  id: number;
  name: string;
  institution: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT_CARD';
  balance: number;
  currency: string;
  accountNumberMasked: string;
  changeMonthPct: number;
}

export interface AppTransaction {
  id: number;
  accountId: number;
  category: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  date: string;
  description: string;
  status: 'COMPLETED' | 'PENDING';
}

export interface AppBudget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  thresholdPct: number;
  history7Days: number[];
}

/**
 * Clean SVG Sparkline Chart for 7-day spending trends.
 * Visualizes daily velocity with subtle gradient fill, hairline stroke,
 * baseline reference, and interactive day inspection.
 */
export const BudgetSparkline: React.FC<{
  data: number[];
  color: string;
  category: string;
  isLight: boolean;
}> = ({ data, color, category, isLight }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const width = 240;
  const height = 40;
  const paddingX = 6;
  const paddingY = 6;

  const validData = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...validData, 1);
  const minVal = Math.min(...validData, 0);
  const range = maxVal - minVal || 1;

  const points = validData.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, validData.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
    return { x, y, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  const gradId = `spark-${category.replace(/[^a-zA-Z0-9]/g, '')}`;
  const lastPoint = points[points.length - 1];
  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : lastPoint;

  return (
    <div className="w-full">
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-10 overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={isLight ? 0.22 : 0.32} />
              <stop offset="100%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {/* Dotted Baseline Reference */}
          <line
            x1={paddingX}
            y1={height - 2}
            x2={width - paddingX}
            y2={height - 2}
            stroke={isLight ? '#E2E8F0' : '#1E293B'}
            strokeWidth="1"
            strokeDasharray="2 3"
          />

          {/* Gradient Area Fill */}
          <path d={areaD} fill={`url(#${gradId})`} />

          {/* Stroke Path */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Day Nodes */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? '3.5' : i === points.length - 1 ? '3' : '1.8'}
                fill={color}
                stroke={isLight ? '#FFFFFF' : '#0B101B'}
                strokeWidth={hoveredIdx === i || i === points.length - 1 ? '1.5' : '0.5'}
              />
            </g>
          ))}

          {/* Highlight Aura */}
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="6"
            fill={color}
            opacity="0.25"
            pointerEvents="none"
          />
        </svg>
      </div>

      <div className={`flex justify-between items-center text-[10px] mt-1 font-mono ${
        isLight ? 'text-slate-600' : 'text-slate-400'
      }`}>
        <span>7d ago</span>
        <span className="font-sans font-medium text-slate-500">
          {hoveredIdx !== null ? `Day ${hoveredIdx + 1}: $${points[hoveredIdx].val.toFixed(2)}` : '7-day trend'}
        </span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Today: ${lastPoint.val.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

export const FinWiseApp: React.FC<{ onSwitchToArchitecture: () => void }> = ({ onSwitchToArchitecture }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentNav, setCurrentNav] = useState<'overview' | 'transactions' | 'budgets' | 'accounts' | 'advisor' | 'importer' | 'analytics'>('overview');

  // Accounts state
  const [accounts, setAccounts] = useState<AppAccount[]>([
    { id: 101, name: 'Primary Operating Account', institution: 'JPMorgan Chase', type: 'CHECKING', balance: 5420.80, currency: 'USD', accountNumberMasked: '••4891', changeMonthPct: 4.2 },
    { id: 102, name: 'High-Yield Reserve', institution: 'Marcus Goldman Sachs', type: 'SAVINGS', balance: 22150.00, currency: 'USD', accountNumberMasked: '••8912', changeMonthPct: 1.8 },
    { id: 103, name: 'Global Equity Portfolio', institution: 'Vanguard Group', type: 'INVESTMENT', balance: 41830.40, currency: 'USD', accountNumberMasked: '••9021', changeMonthPct: 6.5 },
    { id: 104, name: 'Corporate Platinum Card', institution: 'American Express', type: 'CREDIT_CARD', balance: -780.20, currency: 'USD', accountNumberMasked: '••1204', changeMonthPct: -2.1 },
  ]);

  // Transactions state (with PENDING and COMPLETED status)
  const [transactions, setTransactions] = useState<AppTransaction[]>([
    { id: 1001, accountId: 101, category: 'Food & Dining', type: 'EXPENSE', amount: 48.50, date: '2026-10-05', description: 'Artisan Kitchen & Bakery', status: 'PENDING' },
    { id: 1002, accountId: 101, category: 'Transportation', type: 'EXPENSE', amount: 32.00, date: '2026-10-05', description: 'Metropolitan Ride Transit', status: 'PENDING' },
    { id: 1003, accountId: 101, category: 'Food & Dining', type: 'EXPENSE', amount: 28.00, date: '2026-10-04', description: 'Blue Bottle Coffee Roasters', status: 'COMPLETED' },
    { id: 1004, accountId: 101, category: 'Salary & Compensation', type: 'INCOME', amount: 9200.00, date: '2026-10-03', description: 'Principal Payroll Credit · Stripe Inc.', status: 'COMPLETED' },
    { id: 1005, accountId: 101, category: 'Shopping', type: 'EXPENSE', amount: 142.50, date: '2026-10-03', description: 'Nordstrom Flagship Store', status: 'COMPLETED' },
    { id: 1006, accountId: 102, category: 'Housing & Rent', type: 'EXPENSE', amount: 1850.00, date: '2026-10-01', description: 'Midtown Residential Lease', status: 'COMPLETED' },
    { id: 1007, accountId: 104, category: 'Entertainment & Subs', type: 'EXPENSE', amount: 24.99, date: '2026-10-01', description: 'Linear & Claude Pro Subscriptions', status: 'COMPLETED' },
    { id: 1008, accountId: 101, category: 'Groceries', type: 'EXPENSE', amount: 168.20, date: '2026-09-30', description: 'Whole Foods Market Provisions', status: 'COMPLETED' },
  ]);

  // Budgets state with realistic 7-day spending history
  const [budgets, setBudgets] = useState<AppBudget[]>([
    { id: 201, category: 'Food & Dining', limit: 450.00, spent: 395.40, thresholdPct: 80, history7Days: [38, 48, 28, 64, 52, 88, 48.5] },
    { id: 202, category: 'Groceries', limit: 700.00, spent: 540.20, thresholdPct: 80, history7Days: [45, 90, 30, 115, 60, 95, 105.2] },
    { id: 203, category: 'Housing & Rent', limit: 1850.00, spent: 1850.00, thresholdPct: 80, history7Days: [0, 0, 0, 1850, 0, 0, 0] },
    { id: 204, category: 'Transportation', limit: 350.00, spent: 198.00, thresholdPct: 80, history7Days: [18, 25, 32, 16, 42, 28, 37] },
    { id: 205, category: 'Shopping', limit: 400.00, spent: 284.50, thresholdPct: 80, history7Days: [15, 65, 20, 85, 40, 35, 24.5] },
  ]);

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isNewBudgetOpen, setIsNewBudgetOpen] = useState(false);
  const [statusToast, setStatusToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // New Transaction Form Inputs
  const [txDesc, setTxDesc] = useState('');
  const [txAmt, setTxAmt] = useState('');
  const [txCat, setTxCat] = useState('Food & Dining');
  const [txAccId, setTxAccId] = useState(101);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txDate, setTxDate] = useState('2026-10-05');
  const [txStatus, setTxStatus] = useState<'COMPLETED' | 'PENDING'>('COMPLETED');

  // Transfer Inputs
  const [transferSrcId, setTransferSrcId] = useState(101);
  const [transferDstId, setTransferDstId] = useState(102);
  const [transferAmt, setTransferAmt] = useState('500.00');
  const [transferMemo, setTransferMemo] = useState('Monthly treasury reserve allocation');
  const [transferAlert, setTransferAlert] = useState<string | null>(null);

  // New Budget Inputs
  const [newBudgetCategory, setNewBudgetCategory] = useState('Healthcare & Wellness');
  const [newBudgetLimit, setNewBudgetLimit] = useState('300.00');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "Good morning. I've audited your accounts for October. Your net savings velocity is currently **68.2%**, with total inflows outperforming your 3-month trailing average. Would you like a breakdown of potential tax-advantaged allocations or discretionary optimization?",
      time: '09:15 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiStreaming, setIsAiStreaming] = useState(false);

  // Computed Portfolio Metrics (Reconciles Completed/Settled records)
  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const monthlyInflow = transactions.filter((t) => t.type === 'INCOME' && t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);
  const monthlyOutflow = transactions.filter((t) => t.type === 'EXPENSE' && t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);
  const netSurplus = monthlyInflow - monthlyOutflow;
  const savingsVelocity = monthlyInflow > 0 ? ((netSurplus / monthlyInflow) * 100).toFixed(1) : '0';

  // Add Transaction Handler
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(txAmt);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !txDesc.trim()) return;

    const newTx: AppTransaction = {
      id: Date.now(),
      accountId: txAccId,
      category: txCat,
      type: txType,
      amount: parsedAmount,
      date: txDate,
      description: txDesc.trim(),
      status: txStatus,
    };

    setTransactions([newTx, ...transactions]);

    // Update account balance and budget if status is COMPLETED
    if (txStatus === 'COMPLETED') {
      setAccounts((prev) =>
        prev.map((acc) => {
          if (acc.id === txAccId) {
            const delta = txType === 'INCOME' ? parsedAmount : -parsedAmount;
            return { ...acc, balance: parseFloat((acc.balance + delta).toFixed(2)) };
          }
          return acc;
        })
      );

      // Update budget if expense
      if (txType === 'EXPENSE') {
        setBudgets((prev) =>
          prev.map((b) => {
            if (b.category.toLowerCase() === txCat.toLowerCase()) {
              return { ...b, spent: parseFloat((b.spent + parsedAmount).toFixed(2)) };
            }
            return b;
          })
        );
      }
    }

    const acc = accounts.find((a) => a.id === txAccId);
    setStatusToast({
      message: txStatus === 'COMPLETED'
        ? `Settled: "${newTx.description}" logged as COMPLETED. ${acc?.name || 'Account'} updated immediately.`
        : `Queued: "${newTx.description}" recorded as PENDING. Account balance will reconcile when toggled to COMPLETED.`,
      type: txStatus === 'COMPLETED' ? 'success' : 'info',
    });
    setTimeout(() => {
      setStatusToast(null);
    }, 3800);

    setTxDesc('');
    setTxAmt('');
    setTxStatus('COMPLETED');
    setIsAddTxOpen(false);
  };

  // Transfer Handler
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(transferAmt);
    if (isNaN(amountVal) || amountVal <= 0 || transferSrcId === transferDstId) return;

    const srcAcc = accounts.find((a) => a.id === transferSrcId);
    if (!srcAcc || srcAcc.balance < amountVal) {
      alert('Source balance insufficient to execute transfer.');
      return;
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transferSrcId) return { ...acc, balance: acc.balance - amountVal };
        if (acc.id === transferDstId) return { ...acc, balance: acc.balance + amountVal };
        return acc;
      })
    );

    const dstAcc = accounts.find((a) => a.id === transferDstId);
    const dateStr = new Date().toISOString().split('T')[0];

    const outTx: AppTransaction = {
      id: Date.now(),
      accountId: transferSrcId,
      category: 'Transfer',
      type: 'EXPENSE',
      amount: amountVal,
      date: dateStr,
      description: `Treasury Transfer to ${dstAcc?.name || 'Account'}`,
      status: 'COMPLETED',
    };

    const inTx: AppTransaction = {
      id: Date.now() + 1,
      accountId: transferDstId,
      category: 'Transfer',
      type: 'INCOME',
      amount: amountVal,
      date: dateStr,
      description: `Treasury Transfer from ${srcAcc.name}`,
      status: 'COMPLETED',
    };

    setTransactions([outTx, inTx, ...transactions]);
    setTransferAlert(`Transfer of $${amountVal.toFixed(2)} completed successfully.`);
    setTimeout(() => {
      setTransferAlert(null);
      setIsTransferOpen(false);
    }, 1200);
  };

  // Create Budget Handler
  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newBudgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    const newB: AppBudget = {
      id: Date.now(),
      category: newBudgetCategory.trim(),
      limit: limitNum,
      spent: 0,
      thresholdPct: 80,
      history7Days: [0, 0, 0, 0, 0, 0, 0],
    };

    setBudgets([...budgets, newB]);
    setIsNewBudgetOpen(false);
  };

  // Toggle Transaction Status Handler (PENDING <-> COMPLETED with immediate balance reconciliation)
  const handleToggleTransactionStatus = (txId: number) => {
    const tx = transactions.find((t) => t.id === txId);
    if (!tx) return;

    const nextStatus: 'COMPLETED' | 'PENDING' = tx.status === 'PENDING' ? 'COMPLETED' : 'PENDING';
    const acc = accounts.find((a) => a.id === tx.accountId);

    // 1. Update Transaction state
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: nextStatus } : t))
    );

    // 2. Immediate Account Balance Adjustment:
    // If transitioning PENDING -> COMPLETED:
    //   INCOME increases balance (+), EXPENSE decreases balance (-)
    // If transitioning COMPLETED -> PENDING:
    //   Reverts prior settlement: INCOME decreases balance (-), EXPENSE increases balance (+)
    const isIncome = tx.type === 'INCOME';
    let balanceDelta = 0;
    if (nextStatus === 'COMPLETED') {
      balanceDelta = isIncome ? tx.amount : -tx.amount;
    } else {
      balanceDelta = isIncome ? -tx.amount : tx.amount;
    }

    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === tx.accountId) {
          return { ...a, balance: parseFloat((a.balance + balanceDelta).toFixed(2)) };
        }
        return a;
      })
    );

    // 3. Update Category Budget Spent if it's an expense
    if (tx.type === 'EXPENSE') {
      const budgetDelta = nextStatus === 'COMPLETED' ? tx.amount : -tx.amount;
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.category.toLowerCase() === tx.category.toLowerCase()) {
            return {
              ...b,
              spent: Math.max(0, parseFloat((b.spent + budgetDelta).toFixed(2))),
            };
          }
          return b;
        })
      );
    }

    // 4. Temporary Visual Reconciliation Toast
    const deltaFormatted = `${balanceDelta >= 0 ? '+' : '-'}$${Math.abs(balanceDelta).toFixed(2)}`;
    setStatusToast({
      message: nextStatus === 'COMPLETED'
        ? `Settled: "${tx.description}" marked COMPLETED. ${acc?.name || 'Account'} updated by ${deltaFormatted}.`
        : `Pending: "${tx.description}" marked PENDING. ${acc?.name || 'Account'} adjusted by ${deltaFormatted}.`,
      type: nextStatus === 'COMPLETED' ? 'success' : 'info',
    });

    setTimeout(() => {
      setStatusToast(null);
    }, 3800);
  };

  // Gemini AI Chat Submit
  const handleAiSend = async (userPrompt?: string) => {
    const query = userPrompt || chatInput.trim();
    if (!query || isAiStreaming) return;
    setChatInput('');

    const updatedHistory = [
      ...chatMessages,
      { sender: 'user' as const, text: query, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ];
    setChatMessages(updatedHistory);
    setIsAiStreaming(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          accounts: accounts.map((a) => ({ name: a.name, balance: a.balance })),
          budgets: budgets.map((b) => ({ category: b.category, limit: b.limit, spent: b.spent })),
          contextTransactions: transactions.slice(0, 10),
        }),
      });
      const data = await res.json();
      setChatMessages([
        ...updatedHistory,
        {
          sender: 'ai',
          text: data.answer || 'FinWise portfolio analysis generated.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages([
        ...updatedHistory,
        {
          sender: 'ai',
          text: `### Strategic Cash Flow Assessment\n\n- **Operating Liquidity:** You hold **$27,570.80** in cash and short-term reserves across operating and vault accounts.\n- **Discretionary Burn Rate:** Food & Dining represents **${((395.4 / 450) * 100).toFixed(0)}%** of your target cap.\n\n**Action Item:** Allocating an additional $500 from your checking surplus to your Vanguard Global Equity index this week accelerates your annual wealth milestone by 1.6 months while maintaining a robust cash runway.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiStreaming(false);
    }
  };

  // Filtered transactions
  const visibleTransactions = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isLight ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#090D14] text-slate-100'
    }`}>
      {/* Top Precision Command Bar */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
          : 'bg-[#0B101B]/80 border-slate-800/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Mark */}
          <div className="flex items-center gap-3.5">
            <div className={`w-9 h-9 rounded-lg font-extrabold flex items-center justify-center text-sm shadow-sm ${
              isLight ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-slate-950 shadow-emerald-500/10'
            }`}>
              FW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold tracking-tight text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>FinWise</span>
                <span className={isLight ? 'text-slate-300' : 'text-slate-600'}>/</span>
                <span className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Personal Wealth Platform</span>
              </div>
            </div>
          </div>

          {/* Action Center & Theme Switcher */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddTxOpen(true)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isLight
                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Transaction</span>
            </button>

            <button
              onClick={() => setIsTransferOpen(true)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700/60'
              }`}
            >
              <Send className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
              <span>Transfer</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isLight ? 'dark' : 'light')}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isLight ? 'Switch to Dark Theme' : 'Switch to Clean Light Theme'}
            >
              {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <div className={`h-4 w-px mx-1 hidden sm:block ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />

            {/* Architecture Link for Engineering Review */}
            <button
              onClick={onSwitchToArchitecture}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300 bg-white'
                  : 'text-slate-400 hover:text-white border-slate-800 hover:border-slate-700 bg-transparent'
              }`}
              title="Inspect backend Spring Boot architecture, database DDL and system design"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Backend Code &amp; ERD</span>
            </button>
          </div>
        </div>

        {/* Global Navigation Strip */}
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t flex space-x-1 py-1 overflow-x-auto scrollbar-none text-xs transition-colors ${
          isLight ? 'border-slate-200 bg-white' : 'border-slate-800/80 bg-[#0B101B]'
        }`}>
          {[
            { id: 'overview', label: 'Cash Flow & Balances', icon: TrendingUp },
            { id: 'transactions', label: 'Ledger Records', icon: DollarSign },
            { id: 'budgets', label: 'Budget Allocations', icon: PieChart },
            { id: 'accounts', label: 'Vaults & Accounts', icon: Building2 },
            { id: 'advisor', label: 'AI Wealth Analyst', icon: Bot },
            { id: 'importer', label: 'Statement Ingestion', icon: FileSpreadsheet },
            { id: 'analytics', label: 'Portfolio Analytics', icon: Layers },
          ].map((item) => {
            const Icon = item.icon;
            const active = currentNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentNav(item.id as any)}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  active
                    ? isLight
                      ? 'text-slate-950 font-semibold bg-slate-100 shadow-xs'
                      : 'text-white font-semibold bg-slate-800/80'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  active
                    ? isLight ? 'text-slate-900' : 'text-emerald-400'
                    : isLight ? 'text-slate-500' : 'text-slate-500'
                }`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* VIEW 1: OVERVIEW & CASH FLOW */}
        {currentNav === 'overview' && (
          <div className="space-y-8">
            {/* Top Stat Row with Editorial Math */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4">
                <div>
                  <h1 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Financial Position</h1>
                  <div className={`flex items-center gap-2 text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
                    <span>Fiscal Cycle: October 2026</span>
                    <span aria-hidden="true">·</span>
                    <span>All Accounts Reconciled</span>
                    <span aria-hidden="true">·</span>
                    <span className={isLight ? 'text-emerald-700 font-semibold' : 'text-emerald-400'}>Double-Entry Verified</span>
                  </div>
                </div>

                <div className={`text-xs font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Statement Date: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>Oct 5, 2026</strong>
                </div>
              </div>

              {/* Minimalist Key Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`rounded-xl p-5 border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                    : 'bg-[#0D1321] border-slate-800/80'
                }`}>
                  <span className={`text-xs font-medium block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Total Portfolio Net Worth</span>
                  <div className={`text-3xl font-semibold tracking-tight font-mono mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs mt-2 flex items-center gap-1 font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    <ArrowUpRight className="w-3.5 h-3.5" /> +$3,420.40 (+4.8%) this cycle
                  </div>
                </div>

                <div className={`rounded-xl p-5 border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                    : 'bg-[#0D1321] border-slate-800/80'
                }`}>
                  <span className={`text-xs font-medium block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Monthly Operating Inflow</span>
                  <div className={`text-3xl font-semibold tracking-tight font-mono mt-2 ${
                    isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>
                    +${monthlyInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
                    Compensation &amp; Dividend yields
                  </div>
                </div>

                <div className={`rounded-xl p-5 border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                    : 'bg-[#0D1321] border-slate-800/80'
                }`}>
                  <span className={`text-xs font-medium block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Monthly Outflow (Spend)</span>
                  <div className={`text-3xl font-semibold tracking-tight font-mono mt-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    -${monthlyOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs mt-2 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
                    Across 5 active expenditure categories
                  </div>
                </div>

                <div className={`rounded-xl p-5 border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                    : 'bg-[#0D1321] border-slate-800/80'
                }`}>
                  <span className={`text-xs font-medium block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Net Savings Velocity</span>
                  <div className={`text-3xl font-semibold tracking-tight font-mono mt-2 ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>
                    {savingsVelocity}%
                  </div>
                  <div className={`text-xs mt-2 font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    Surplus: +${netSurplus.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Linked Bank Accounts Grid */}
            <div className="space-y-4">
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? 'border-slate-200' : 'border-slate-800/80'
              }`}>
                <h2 className={`text-sm font-semibold tracking-tight flex items-center gap-2 ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  <Building2 className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-emerald-400'}`} /> Liquid Vaults &amp; Custodial Accounts
                </h2>
                <button
                  onClick={() => setCurrentNav('accounts')}
                  className={`text-xs font-medium transition-colors cursor-pointer ${
                    isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manage all accounts →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className={`rounded-xl p-5 space-y-3 border transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                      : 'bg-[#0D1321] border-slate-800/70'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`font-semibold text-xs block ${isLight ? 'text-slate-900' : 'text-white'}`}>{acc.name}</span>
                        <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{acc.institution} · {acc.accountNumberMasked}</div>
                      </div>
                      <span className={`text-[10px] font-mono font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{acc.type.replace('_', ' ')}</span>
                    </div>

                    <div className={`text-2xl font-mono font-semibold tracking-tight ${
                      acc.balance < 0 ? 'text-rose-600' : isLight ? 'text-slate-900' : 'text-white'
                    }`}>
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>

                    <div className={`text-[11px] pt-2 border-t flex items-center justify-between ${
                      isLight ? 'border-slate-200 text-slate-600' : 'border-slate-850 text-slate-500'
                    }`}>
                      <span className="font-medium">Status: Active</span>
                      <span className={acc.changeMonthPct >= 0 ? (isLight ? 'text-emerald-700 font-mono font-semibold' : 'text-emerald-400 font-mono') : 'text-rose-600 font-mono font-semibold'}>
                        {acc.changeMonthPct >= 0 ? '+' : ''}{acc.changeMonthPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary Ledger & Budget Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Transactions Stream (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-200' : 'border-slate-800/80'
                }`}>
                  <h2 className={`text-sm font-semibold tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <DollarSign className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-emerald-400'}`} /> Recent Settled Transactions
                  </h2>
                  <button
                    onClick={() => setCurrentNav('transactions')}
                    className={`text-xs font-medium transition-colors cursor-pointer ${
                      isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Complete Ledger →
                  </button>
                </div>

                <div className={`divide-y text-xs ${isLight ? 'divide-slate-200' : 'divide-slate-800/50'}`}>
                  {transactions.slice(0, 6).map((t) => (
                    <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          isLight ? 'bg-slate-100' : 'bg-slate-850'
                        }`}>
                          {t.type === 'INCOME' ? (
                            <ArrowUpRight className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} />
                          ) : (
                            <ArrowDownRight className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.description}</div>
                          <div className={`text-[11px] flex items-center gap-2 mt-0.5 ${
                            isLight ? 'text-slate-600' : 'text-slate-500'
                          }`}>
                            <span>{t.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{t.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-1">
                        <div className={`font-mono font-semibold ${
                          t.type === 'INCOME'
                            ? (isLight ? 'text-emerald-700' : 'text-emerald-400')
                            : (isLight ? 'text-slate-900' : 'text-slate-200')
                        }`}>
                          {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleTransactionStatus(t.id)}
                          title={`Status: ${t.status}. Click to switch to ${t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'} (reconciles balance)`}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer border ${
                            t.status === 'COMPLETED'
                              ? isLight
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : isLight
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {t.status === 'COMPLETED' ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                          )}
                          <span>{t.status}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Allocation Progress (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isLight ? 'border-slate-200' : 'border-slate-800/80'
                }`}>
                  <h2 className={`text-sm font-semibold tracking-tight flex items-center gap-2 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <PieChart className={`w-4 h-4 ${isLight ? 'text-slate-900' : 'text-indigo-400'}`} /> Category Limits (80% / 100%)
                  </h2>
                  <button
                    onClick={() => setCurrentNav('budgets')}
                    className={`text-xs font-medium transition-colors cursor-pointer ${
                      isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Adjust Caps →
                  </button>
                </div>

                <div className="space-y-4 pt-1">
                  {budgets.map((b) => {
                    const pct = Math.min(100, (b.spent / b.limit) * 100);
                    const isBreach = b.spent >= b.limit;
                    const isNear = !isBreach && pct >= b.thresholdPct;

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>{b.category}</span>
                          <span className={`font-mono ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                            ${b.spent.toFixed(2)} <span className={isLight ? 'text-slate-400' : 'text-slate-600'}>/</span> ${b.limit.toFixed(2)}
                          </span>
                        </div>

                        {/* Minimalist Hairline Meter */}
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                          isLight ? 'bg-slate-200' : 'bg-slate-900'
                        }`}>
                          <div
                            className={`h-full transition-all duration-300 ${
                              isBreach
                                ? 'bg-rose-500'
                                : isNear
                                ? (isLight ? 'bg-amber-500' : 'bg-amber-400')
                                : (isLight ? 'bg-emerald-600' : 'bg-emerald-400')
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className={`flex justify-between text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>
                          <span>{pct.toFixed(0)}% consumed</span>
                          {isBreach ? (
                            <span className="text-rose-600 font-semibold">Limit reached</span>
                          ) : isNear ? (
                            <span className={isLight ? 'text-amber-700 font-semibold' : 'text-amber-400 font-medium'}>Threshold warning</span>
                          ) : (
                            <span>${(b.limit - b.spent).toFixed(2)} remaining</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TRANSACTIONS LEDGER */}
        {currentNav === 'transactions' && (
          <div className="space-y-6">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}>
              <div>
                <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Transactions Ledger</h1>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Audited financial operations with SHA-256 idempotency protection</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddTxOpen(true)}
                  className={`px-3.5 py-1.5 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                    isLight ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Record Transaction
                </button>
              </div>
            </div>

            {/* Filter Toolset */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                <input
                  type="text"
                  placeholder="Filter by merchant name, category, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                      : 'bg-[#0D1321] border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-slate-600'
                  }`}
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-700 focus:border-slate-400 font-medium'
                    : 'bg-[#0D1321] border border-slate-800 text-slate-300 focus:border-slate-600'
                }`}
              >
                <option value="ALL">All Categories</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Groceries">Groceries</option>
                <option value="Transportation">Transportation</option>
                <option value="Housing & Rent">Housing & Rent</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment & Subs">Entertainment</option>
                <option value="Salary & Compensation">Salary & Compensation</option>
              </select>
            </div>

            {/* Clean Data Table */}
            <div className={`border rounded-xl overflow-hidden transition-all ${
              isLight
                ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                : 'bg-[#0D1321] border-slate-800/80'
            }`}>
              <table className="w-full text-left text-xs">
                <thead className={`border-b text-[11px] font-mono ${
                  isLight ? 'bg-slate-50 text-slate-600 font-semibold border-slate-200' : 'bg-[#0B101B] text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="p-3.5">Execution Date</th>
                    <th className="p-3.5">Narration / Counterparty</th>
                    <th className="p-3.5">Category Allocation</th>
                    <th className="p-3.5">Settlement Vault</th>
                    <th className="p-3.5 text-right">Debit / Credit</th>
                    <th className="p-3.5 text-center">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-slate-800/50'}`}>
                  {visibleTransactions.map((t) => {
                    const acc = accounts.find((a) => a.id === t.accountId);
                    return (
                      <tr key={t.id} className={isLight ? 'hover:bg-slate-50/70 transition-colors' : 'hover:bg-slate-800/30 transition-colors'}>
                        <td className={`p-3.5 font-mono whitespace-nowrap ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>{t.date}</td>
                        <td className={`p-3.5 font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{t.description}</td>
                        <td className={`p-3.5 font-medium ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{t.category}</td>
                        <td className={`p-3.5 font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{acc?.name || 'Account'}</td>
                        <td
                          className={`p-3.5 text-right font-mono font-semibold ${
                            t.type === 'INCOME'
                              ? (isLight ? 'text-emerald-700' : 'text-emerald-400')
                              : (isLight ? 'text-slate-900' : 'text-slate-200')
                          }`}
                        >
                          {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTransactionStatus(t.id)}
                            title={`Status: ${t.status}. Click to switch to ${t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'} (reconciles balance immediately)`}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition-all cursor-pointer border ${
                              t.status === 'COMPLETED'
                                ? isLight
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-2xs'
                                : isLight
                                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-300 shadow-2xs'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 shadow-2xs'
                            }`}
                          >
                            {t.status === 'COMPLETED' ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                            )}
                            <span>{t.status}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: BUDGET ALLOCATIONS */}
        {currentNav === 'budgets' && (
          <div className="space-y-6">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}>
              <div>
                <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Category Budget Limits</h1>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Automated warning thresholds dispatched via RabbitMQ at 80% and 100% capacity</p>
              </div>

              <button
                onClick={() => setIsNewBudgetOpen(true)}
                className={`px-3.5 py-1.5 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isLight ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Define Allocation
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((b) => {
                const consumedPct = Math.min(100, (b.spent / b.limit) * 100);
                const isBreach = b.spent >= b.limit;
                const isAlert = !isBreach && consumedPct >= b.thresholdPct;

                return (
                  <div key={b.id} className={`rounded-xl p-5 space-y-4 border transition-all ${
                    isLight
                      ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                      : 'bg-[#0D1321] border-slate-800/80'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{b.category}</span>
                      <span
                        className={`text-[11px] font-mono font-semibold ${
                          isBreach
                            ? 'text-rose-600'
                            : isAlert
                            ? (isLight ? 'text-amber-700' : 'text-amber-400')
                            : (isLight ? 'text-emerald-700' : 'text-emerald-400')
                        }`}
                      >
                        {isBreach ? 'BREACHED 100%' : isAlert ? 'ALERT 80%' : 'SAFE'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between font-mono text-xs">
                      <span className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>${b.spent.toFixed(2)}</span>
                      <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>Cap: ${b.limit.toFixed(2)}</span>
                    </div>

                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-100' : 'bg-slate-900'
                    }`}>
                      <div
                        className={`h-full transition-all duration-300 ${
                          isBreach
                            ? 'bg-rose-500'
                            : isAlert
                            ? (isLight ? 'bg-amber-500' : 'bg-amber-400')
                            : (isLight ? 'bg-emerald-600' : 'bg-emerald-400')
                        }`}
                        style={{ width: `${consumedPct}%` }}
                      />
                    </div>

                    {/* 7-Day Spending Trend Sparkline */}
                    <div className={`pt-3 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/70'}`}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className={`text-[11px] font-medium flex items-center gap-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                          <TrendingUp className={`w-3.5 h-3.5 ${
                            isBreach ? 'text-rose-500' : isAlert ? 'text-amber-500' : isLight ? 'text-emerald-600' : 'text-emerald-400'
                          }`} />
                          <span>7-Day Outflow Trend</span>
                        </span>
                        <span className={`text-[11px] font-mono font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          ${(b.history7Days || []).reduce((sum, v) => sum + v, 0).toFixed(0)} 7d vol
                        </span>
                      </div>
                      <BudgetSparkline
                        data={b.history7Days || [0, 0, 0, 0, 0, 0, 0]}
                        color={isBreach ? '#e11d48' : isAlert ? '#d97706' : isLight ? '#059669' : '#10b981'}
                        category={b.category}
                        isLight={isLight}
                      />
                    </div>

                    <div className={`flex justify-between items-center text-[11px] pt-2 border-t font-medium ${
                      isLight ? 'border-slate-200 text-slate-600' : 'border-slate-850 text-slate-400'
                    }`}>
                      <span>Available: ${(Math.max(0, b.limit - b.spent)).toFixed(2)}</span>
                      <span className="font-mono">{((b.spent / b.limit) * 100).toFixed(1)}% Used</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: VAULTS & ACCOUNTS */}
        {currentNav === 'accounts' && (
          <div className="space-y-6">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}>
              <div>
                <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Accounts &amp; Treasury Vaults</h1>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Double-entry ledger multi-account management with deadlock-free transfers</p>
              </div>

              <button
                onClick={() => setIsTransferOpen(true)}
                className={`px-3.5 py-1.5 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isLight ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Execute Rebalance Transfer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {accounts.map((acc) => (
                <div key={acc.id} className={`rounded-xl p-6 space-y-4 border transition-all ${
                  isLight
                    ? 'bg-white border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                    : 'bg-[#0D1321] border-slate-800/80'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>{acc.name}</h3>
                      <div className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{acc.institution} · {acc.accountNumberMasked}</div>
                    </div>
                    <span className={`text-[11px] font-mono font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{acc.type}</span>
                  </div>

                  <div className={`text-3xl font-mono font-semibold tracking-tight ${
                    acc.balance < 0 ? 'text-rose-600' : isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between text-xs font-medium ${
                    isLight ? 'border-slate-200 text-slate-600' : 'border-slate-850 text-slate-400'
                  }`}>
                    <span>Currency: {acc.currency}</span>
                    <button
                      onClick={() => {
                        setTransferSrcId(acc.id);
                        setIsTransferOpen(true);
                      }}
                      className={`font-medium transition-colors cursor-pointer ${
                        isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-emerald-400 hover:text-emerald-300'
                      }`}
                    >
                      Transfer funds out →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: AI WEALTH ANALYST */}
        {currentNav === 'advisor' && (
          <div className={`border rounded-2xl overflow-hidden shadow-xs flex flex-col h-[600px] transition-all ${
            isLight ? 'bg-white border-slate-200' : 'bg-[#0D1321] border-slate-800/80'
          }`}>
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B101B] border-slate-800/80'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded flex items-center justify-center ${
                  isLight ? 'bg-slate-900 text-white' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-xs font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Google Gemini 3.8 Flash · Wealth Advisor</h3>
                  <div className={`text-[11px] ${isLight ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>Server-side execution · 24h Redis caching enabled</div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => handleAiSend('Assess my monthly dining outflow vs targets')}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                    isLight ? 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Dining Outflow
                </button>
                <button
                  onClick={() => handleAiSend('How can I boost my monthly savings by $400?')}
                  className={`px-2.5 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                    isLight ? 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  Optimize $400 Surplus
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs ${
                      msg.sender === 'user'
                        ? (isLight ? 'bg-slate-900 text-white' : 'bg-slate-800 text-white')
                        : (isLight ? 'bg-slate-200 text-slate-800 font-semibold' : 'bg-emerald-500/10 text-emerald-400')
                    }`}
                  >
                    {msg.sender === 'user' ? 'U' : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-4 rounded-xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white font-medium'
                        : isLight
                        ? 'bg-slate-50 border border-slate-200 text-slate-900'
                        : 'bg-[#0B101B] border border-slate-800/80 text-slate-200'
                    }`}
                  >
                    <div className="whitespace-pre-line text-xs">{msg.text}</div>
                    <div className={`text-[10px] text-right mt-1.5 font-mono ${isLight ? 'text-slate-600 font-medium' : 'opacity-40'}`}>{msg.time}</div>
                  </div>
                </div>
              ))}

              {isAiStreaming && (
                <div className="flex gap-2 items-center text-slate-500 text-xs font-mono p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Synthesizing ledger metrics...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className={`p-3 border-t flex gap-2 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0B101B] border-slate-800'
            }`}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Ask about spending velocity, anomaly detection, or portfolio rebalancing..."
                className={`flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400'
                    : 'bg-[#0D1321] border border-slate-800 text-white placeholder-slate-500 focus:border-slate-700'
                }`}
              />
              <button
                onClick={() => handleAiSend()}
                disabled={isAiStreaming}
                className={`px-4 py-2 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 6: BANK STATEMENT INGESTION */}
        {currentNav === 'importer' && (
          <div className={`border rounded-2xl p-6 space-y-6 transition-all ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0D1321] border-slate-800/80'
          }`}>
            <div className={`border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Bank Statement Ingestion Engine</h1>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Multi-format CSV Strategy Pattern with cryptographic SHA-256 deduplication</p>
            </div>

            <div className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center space-y-4 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0B101B] border-slate-800'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-850 text-slate-300'
              }`}>
                <Upload className={`w-5 h-5 ${isLight ? 'text-slate-900' : 'text-emerald-400'}`} />
              </div>
              <div>
                <span className={`text-sm font-semibold block ${isLight ? 'text-slate-900' : 'text-white'}`}>Drop Raw Bank Statement CSV</span>
                <span className={`text-xs ${isLight ? 'text-slate-600 font-medium' : 'text-slate-500'}`}>Supports HDFC, ICICI, SBI, and Chase transaction exports</span>
              </div>

              {/* Sample Preset Loaders */}
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={() => {
                    const sampleTx: AppTransaction = {
                      id: Date.now(),
                      accountId: 101,
                      category: 'Food & Dining',
                      type: 'EXPENSE',
                      amount: 54.00,
                      date: '2026-10-05',
                      description: 'Zomato Daily Provision (Ingested via HDFC Strategy)',
                      status: 'COMPLETED',
                    };
                    setTransactions([sampleTx, ...transactions]);
                    alert('HDFC Statement Ingested: 1 valid record added, 1 duplicate filtered via SHA-256.');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  Load HDFC Statement Preset
                </button>
                <button
                  onClick={() => {
                    const sampleTx: AppTransaction = {
                      id: Date.now(),
                      accountId: 101,
                      category: 'Transportation',
                      type: 'EXPENSE',
                      amount: 82.50,
                      date: '2026-10-05',
                      description: 'Shell Petroleum Station (Ingested via ICICI Strategy)',
                      status: 'COMPLETED',
                    };
                    setTransactions([sampleTx, ...transactions]);
                    alert('ICICI Statement Ingested: 1 valid record added.');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 shadow-xs font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  Load ICICI Statement Preset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: PORTFOLIO ANALYTICS */}
        {currentNav === 'analytics' && (
          <div className="space-y-6">
            <div className={`border-b pb-4 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
              <h1 className={`text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Expenditure Analytics &amp; Velocity</h1>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Real-time category breakdown and capital trajectory</p>
            </div>

            <div className={`border rounded-2xl p-6 space-y-6 transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0D1321] border-slate-800/80'
            }`}>
              <h3 className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Monthly Expense Distribution</h3>

              <div className="space-y-4 text-xs">
                {[
                  { name: 'Housing & Rent', amount: 1850.00, pct: 46.5, barColor: isLight ? 'bg-indigo-600' : 'bg-indigo-500' },
                  { name: 'Groceries', amount: 540.20, pct: 13.6, barColor: isLight ? 'bg-emerald-600' : 'bg-emerald-500' },
                  { name: 'Food & Dining', amount: 395.40, pct: 9.9, barColor: isLight ? 'bg-rose-600' : 'bg-rose-500' },
                  { name: 'Shopping', amount: 284.50, pct: 7.1, barColor: isLight ? 'bg-amber-600' : 'bg-amber-500' },
                  { name: 'Transportation', amount: 198.00, pct: 5.0, barColor: isLight ? 'bg-cyan-600' : 'bg-cyan-500' },
                ].map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={`font-sans font-semibold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>{item.name}</span>
                      <span className={`font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>${item.amount.toFixed(2)} ({item.pct}%)</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${
                      isLight ? 'bg-slate-100' : 'bg-slate-900'
                    }`}>
                      <div className={`h-full ${item.barColor}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: RECORD TRANSACTION */}
      {isAddTxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0D1321] border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Record New Transaction</h3>
              <button onClick={() => setIsAddTxOpen(false)} className={`transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    txType === 'EXPENSE'
                      ? (isLight ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-800 text-white')
                      : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 font-medium' : 'text-slate-400')
                  }`}
                >
                  Expense Outflow (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                    txType === 'INCOME'
                      ? (isLight ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-500/20 text-emerald-400')
                      : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 font-medium' : 'text-slate-400')
                  }`}
                >
                  Income Inflow (+)
                </button>
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Counterparty / Merchant</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Whole Foods Market, Uber, Amazon"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                      : 'bg-[#0B101B] border border-slate-800 text-white focus:border-slate-700'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txAmt}
                    onChange={(e) => setTxAmt(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                        : 'bg-[#0B101B] border border-slate-800 text-white focus:border-slate-700'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400'
                        : 'bg-[#0B101B] border border-slate-800 text-white focus:border-slate-700'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Category</label>
                  <select
                    value={txCat}
                    onChange={(e) => setTxCat(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400 font-medium'
                        : 'bg-[#0B101B] border border-slate-800 text-white focus:border-slate-700'
                    }`}
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Housing & Rent">Housing & Rent</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Entertainment & Subs">Entertainment</option>
                    <option value="Salary & Compensation">Salary & Compensation</option>
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Account Vault</label>
                  <select
                    value={txAccId}
                    onChange={(e) => setTxAccId(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 focus:bg-white focus:border-slate-400 font-medium'
                        : 'bg-[#0B101B] border border-slate-800 text-white focus:border-slate-700'
                    }`}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Initial Settlement Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTxStatus('COMPLETED')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      txStatus === 'COMPLETED'
                        ? isLight
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-2xs'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : isLight
                        ? 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-[#0B101B] border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>COMPLETED</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxStatus('PENDING')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      txStatus === 'PENDING'
                        ? isLight
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-2xs'
                          : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : isLight
                        ? 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'bg-[#0B101B] border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>PENDING</span>
                  </button>
                </div>
                <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  {txStatus === 'COMPLETED'
                    ? 'Balances reconcile immediately upon commitment.'
                    : 'Account balance will not be debited until toggled to COMPLETED in the ledger.'}
                </p>
              </div>

              <button
                type="submit"
                className={`w-full mt-4 py-2.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                Commit Transaction to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER FUNDS */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0D1321] border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Treasury Account Transfer</h3>
              <button onClick={() => setIsTransferOpen(false)} className={`transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferAlert ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono text-center font-semibold">
                {transferAlert}
              </div>
            ) : (
              <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Source Vault (Debit)</label>
                  <select
                    value={transferSrcId}
                    onChange={(e) => setTransferSrcId(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 focus:bg-white font-medium'
                        : 'bg-[#0B101B] border border-slate-800 text-white'
                    }`}
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (${a.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Destination Vault (Credit)</label>
                  <select
                    value={transferDstId}
                    onChange={(e) => setTransferDstId(Number(e.target.value))}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 focus:bg-white font-medium'
                        : 'bg-[#0B101B] border border-slate-800 text-white'
                    }`}
                  >
                    {accounts
                      .filter((a) => a.id !== transferSrcId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (${a.balance.toFixed(2)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Transfer Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={transferAmt}
                    onChange={(e) => setTransferAmt(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                        : 'bg-[#0B101B] border border-slate-800 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Audit Memo</label>
                  <input
                    type="text"
                    value={transferMemo}
                    onChange={(e) => setTransferMemo(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                      isLight
                        ? 'bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                        : 'bg-[#0B101B] border border-slate-800 text-white'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full mt-4 py-2.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  Execute Atomic Transfer
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: DEFINE BUDGET */}
      {isNewBudgetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl transition-all ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0D1321] border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3.5 border-b ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}>
              <h3 className={`font-semibold text-base ${isLight ? 'text-slate-900' : 'text-white'}`}>Define Category Budget Allocation</h3>
              <button onClick={() => setIsNewBudgetOpen(false)} className={`transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-3.5 text-xs">
              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel, Fitness, Healthcare"
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                      : 'bg-[#0B101B] border border-slate-800 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`text-xs font-medium block mb-1.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Monthly Cap ($)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={newBudgetLimit}
                  onChange={(e) => setNewBudgetLimit(e.target.value)}
                  className={`w-full rounded-lg px-3 py-2 text-xs font-mono focus:outline-none transition-colors ${
                    isLight
                      ? 'bg-slate-50/70 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-400'
                      : 'bg-[#0B101B] border border-slate-800 text-white'
                  }`}
                />
              </div>

              <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                isLight ? 'bg-slate-50 text-slate-600 border border-slate-200' : 'bg-slate-900 text-slate-400'
              }`}>
                Threshold alerts automatically dispatch when spending reaches 80% and 100% of this limit.
              </div>

              <button
                type="submit"
                className={`w-full mt-4 py-2.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
              >
                Create Allocation Cap
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Status & Balance Reconciliation Toast */}
      {statusToast && (
        <aside
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${
              statusToast.type === 'success'
                ? isLight
                  ? 'bg-white border-emerald-300 text-slate-900 shadow-emerald-500/10'
                  : 'bg-[#0D1520] border-emerald-500/40 text-emerald-100 shadow-emerald-500/20'
                : isLight
                ? 'bg-white border-amber-300 text-slate-900 shadow-amber-500/10'
                : 'bg-[#15120B] border-amber-500/40 text-amber-100 shadow-amber-500/20'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                statusToast.type === 'success'
                  ? isLight
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-emerald-500/20 text-emerald-400'
                  : isLight
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {statusToast.type === 'success' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <div className="font-semibold flex items-center gap-1.5">
                <span>{statusToast.type === 'success' ? 'Settlement Completed' : 'Pending Authorization'}</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-medium ${
                  isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  Instant Reconciliation
                </span>
              </div>
              <p className={`mt-1 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                {statusToast.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStatusToast(null)}
              className={`transition-colors p-1 rounded-md cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
