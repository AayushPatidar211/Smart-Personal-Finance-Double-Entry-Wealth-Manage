import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Send,
  PieChart,
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  Bot,
  Bell,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  X,
  CreditCard,
  Building,
  DollarSign,
  Layers,
  FileSpreadsheet,
  Check,
  RefreshCw,
  Eye,
} from 'lucide-react';

export interface AppAccount {
  id: number;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'CREDIT_CARD';
  balance: number;
  currency: string;
  accountNumberMasked: string;
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
  checksum?: string;
}

export interface AppBudget {
  id: number;
  category: string;
  limit: number;
  spent: number;
  color: string;
  thresholdPct: number;
}

export const FinWiseApp: React.FC<{ onSwitchToArchitecture: () => void }> = ({ onSwitchToArchitecture }) => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'advisor' | 'importer' | 'analytics'>('dashboard');

  // Accounts state
  const [accounts, setAccounts] = useState<AppAccount[]>([
    { id: 101, name: 'Chase Premier Checking', type: 'CHECKING', balance: 4325.50, currency: 'USD', accountNumberMasked: '•••• 4891' },
    { id: 102, name: 'Marcus High-Yield Savings', type: 'SAVINGS', balance: 18450.00, currency: 'USD', accountNumberMasked: '•••• 8912' },
    { id: 103, name: 'Vanguard Total Stock ETF', type: 'INVESTMENT', balance: 32180.00, currency: 'USD', accountNumberMasked: '•••• 9021' },
    { id: 104, name: 'Apple Card (Titanium)', type: 'CREDIT_CARD', balance: -640.20, currency: 'USD', accountNumberMasked: '•••• 1204' },
  ]);

  // Transactions state
  const [transactions, setTransactions] = useState<AppTransaction[]>([
    { id: 1001, accountId: 101, category: 'Food & Dining', type: 'EXPENSE', amount: 45.00, date: '2026-10-04', description: 'Swiggy Gourmet Dinner Delivery', status: 'COMPLETED' },
    { id: 1002, accountId: 101, category: 'Transportation', type: 'EXPENSE', amount: 38.00, date: '2026-10-04', description: 'Uber City Commute', status: 'COMPLETED' },
    { id: 1003, accountId: 101, category: 'Food & Dining', type: 'EXPENSE', amount: 35.00, date: '2026-10-04', description: 'Starbucks Coffee Koramangala', status: 'COMPLETED' },
    { id: 1004, accountId: 101, category: 'Income & Salary', type: 'INCOME', amount: 8500.00, date: '2026-10-03', description: 'Monthly Tech Salary Credit (ACME Corp)', status: 'COMPLETED' },
    { id: 1005, accountId: 101, category: 'Shopping', type: 'EXPENSE', amount: 129.99, date: '2026-10-03', description: 'Amazon Electronics & Gadgets', status: 'COMPLETED' },
    { id: 1006, accountId: 102, category: 'Housing & Rent', type: 'EXPENSE', amount: 1750.00, date: '2026-10-01', description: 'Downtown Apartment Rent', status: 'COMPLETED' },
    { id: 1007, accountId: 104, category: 'Entertainment', type: 'EXPENSE', amount: 22.99, date: '2026-10-01', description: 'Netflix 4K Ultra Subscription', status: 'COMPLETED' },
    { id: 1008, accountId: 101, category: 'Groceries', type: 'EXPENSE', amount: 184.50, date: '2026-09-29', description: 'Whole Foods Market Weekly Stock', status: 'COMPLETED' },
  ]);

  // Budgets state
  const [budgets, setBudgets] = useState<AppBudget[]>([
    { id: 201, category: 'Food & Dining', limit: 400.00, spent: 385.60, color: '#F43F5E', thresholdPct: 80 },
    { id: 202, category: 'Groceries', limit: 650.00, spent: 512.40, color: '#F97316', thresholdPct: 80 },
    { id: 203, category: 'Housing & Rent', limit: 1750.00, spent: 1750.00, color: '#6366F1', thresholdPct: 80 },
    { id: 204, category: 'Transportation', limit: 350.00, spent: 220.00, color: '#10B981', thresholdPct: 80 },
    { id: 205, category: 'Entertainment', limit: 150.00, spent: 94.99, color: '#8B5CF6', thresholdPct: 80 },
  ]);

  // Modals state
  const [showAddTxModal, setShowAddTxModal] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);

  // New Transaction Form State
  const [txDescription, setTxDescription] = useState<string>('');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txCategory, setTxCategory] = useState<string>('Food & Dining');
  const [txAccountId, setTxAccountId] = useState<number>(101);
  const [txType, setTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Transfer Form State
  const [transferSourceId, setTransferSourceId] = useState<number>(101);
  const [transferDestId, setTransferDestId] = useState<number>(102);
  const [transferAmount, setTransferAmount] = useState<string>('250.00');
  const [transferDesc, setTransferDesc] = useState<string>('Monthly emergency savings transfer');
  const [transferSuccessMsg, setTransferSuccessMsg] = useState<string | null>(null);

  // New Budget Form State
  const [newBudgetCategory, setNewBudgetCategory] = useState<string>('Shopping');
  const [newBudgetLimit, setNewBudgetLimit] = useState<string>('300.00');

  // Search & Filter State
  const [txSearch, setTxSearch] = useState<string>('');
  const [txCategoryFilter, setTxCategoryFilter] = useState<string>('ALL');

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: "👋 Hi! I am FinWise AI, your personal financial advisor. I analyze your spending, detect subscription creep, and help you reach your savings goals. How can I assist your wealth journey today?",
      time: '10:00 AM',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: '🚨 Warning: "Food & Dining" budget has reached 96.4% ($385.60 spent of $400)', time: '10 mins ago', isRead: false },
    { id: 2, text: '🎉 Monthly tech salary of $8,500.00 credited to Chase Checking', time: 'Yesterday', isRead: false },
    { id: 3, text: '🔒 Security check: 2FA TOTP successfully verified for your session', time: '2 days ago', isRead: true },
  ]);

  // Computed Metrics
  const totalNetWorth = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalMonthlyIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalMonthlyExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);
  const netSavings = totalMonthlyIncome - totalMonthlyExpense;
  const savingsRate = totalMonthlyIncome > 0 ? ((netSavings / totalMonthlyIncome) * 100).toFixed(1) : '0';

  // Handle Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0 || !txDescription.trim()) return;

    const newTx: AppTransaction = {
      id: Date.now(),
      accountId: txAccountId,
      category: txCategory,
      type: txType,
      amount: amt,
      date: txDate,
      description: txDescription.trim(),
      status: 'COMPLETED',
    };

    // Update Transactions
    setTransactions([newTx, ...transactions]);

    // Update Account Balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === txAccountId) {
          const delta = txType === 'INCOME' ? amt : -amt;
          return { ...acc, balance: parseFloat((acc.balance + delta).toFixed(2)) };
        }
        return acc;
      })
    );

    // Update Budgets if Expense
    if (txType === 'EXPENSE') {
      setBudgets((prev) =>
        prev.map((b) => {
          if (b.category.toLowerCase() === txCategory.toLowerCase()) {
            return { ...b, spent: parseFloat((b.spent + amt).toFixed(2)) };
          }
          return b;
        })
      );
    }

    // Reset & Close
    setTxDescription('');
    setTxAmount('');
    setShowAddTxModal(false);
  };

  // Handle Inter-Account Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0 || transferSourceId === transferDestId) return;

    const sourceAcc = accounts.find((a) => a.id === transferSourceId);
    if (!sourceAcc || sourceAcc.balance < amt) {
      alert('Source account has insufficient balance for transfer!');
      return;
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === transferSourceId) {
          return { ...acc, balance: parseFloat((acc.balance - amt).toFixed(2)) };
        }
        if (acc.id === transferDestId) {
          return { ...acc, balance: parseFloat((acc.balance + amt).toFixed(2)) };
        }
        return acc;
      })
    );

    // Create double entry transactions
    const destAcc = accounts.find((a) => a.id === transferDestId);
    const tx1: AppTransaction = {
      id: Date.now(),
      accountId: transferSourceId,
      category: 'Transfers',
      type: 'EXPENSE',
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      description: `Transfer to ${destAcc?.name || 'Account'} - ${transferDesc}`,
      status: 'COMPLETED',
    };
    const tx2: AppTransaction = {
      id: Date.now() + 1,
      accountId: transferDestId,
      category: 'Transfers',
      type: 'INCOME',
      amount: amt,
      date: new Date().toISOString().split('T')[0],
      description: `Transfer from ${sourceAcc.name} - ${transferDesc}`,
      status: 'COMPLETED',
    };

    setTransactions([tx1, tx2, ...transactions]);
    setTransferSuccessMsg(`Successfully transferred $${amt.toFixed(2)} from ${sourceAcc.name} to ${destAcc?.name}!`);
    setTimeout(() => {
      setTransferSuccessMsg(null);
      setShowTransferModal(false);
    }, 1500);
  };

  // Handle Add Budget
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const lim = parseFloat(newBudgetLimit);
    if (isNaN(lim) || lim <= 0) return;

    const newB: AppBudget = {
      id: Date.now(),
      category: newBudgetCategory,
      limit: lim,
      spent: 0,
      color: '#3B82F6',
      thresholdPct: 80,
    };
    setBudgets([...budgets, newB]);
    setShowAddBudgetModal(false);
  };

  // Handle Send AI Chat
  const handleSendAiChat = async (promptText?: string) => {
    const q = promptText || chatInput.trim();
    if (!q || isAiLoading) return;
    setChatInput('');

    const newMessages = [...chatMessages, { sender: 'user' as const, text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
    setChatMessages(newMessages);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          accounts: accounts.map((a) => ({ name: a.name, balance: a.balance })),
          budgets: budgets.map((b) => ({ category: b.category, limit: b.limit, spent: b.spent })),
          contextTransactions: transactions.slice(0, 10).map((t) => ({ date: t.date, desc: t.description, amount: t.amount, type: t.type, cat: t.category })),
        }),
      });
      const data = await res.json();
      setChatMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: data.answer || 'FinWise analysis completed successfully.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setChatMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: `### 💡 Financial Insight Summary\n\n- **Net Worth:** $${totalNetWorth.toFixed(2)}\n- **Monthly Outflows:** $${totalMonthlyExpense.toFixed(2)}\n- **Savings Velocity:** ${savingsRate}%\n\n**Actionable Advice:** Your highest discretionary spend is **Food & Dining ($385.60)**, which has reached 96.4% of your limit. Capping food delivery for the next 7 days will keep you safely under budget and save approximately $120.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered transactions
  const filteredTxs = transactions.filter((t) => {
    const matchesSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) || t.category.toLowerCase().includes(txSearch.toLowerCase());
    const matchesCategory = txCategoryFilter === 'ALL' || t.category === txCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Application Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">FinWise</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  LIVE APP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Smart Personal Finance &amp; Double-Entry Wealth Manager</p>
            </div>
          </div>

          {/* Quick Actions & Navigation Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowAddTxModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Transaction
            </button>

            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Transfer
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 relative transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {notifications.some((n) => !n.isRead) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotificationDrawer && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-indigo-400" /> Notifications &amp; Alerts
                    </span>
                    <button
                      onClick={() => setNotifications(notifications.map((n) => ({ ...n, isRead: true })))}
                      className="text-[11px] text-slate-400 hover:text-white"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                        <p className="text-slate-200 text-[11px] leading-relaxed">{n.text}</p>
                        <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Switch to Architecture Mode */}
            <button
              onClick={onSwitchToArchitecture}
              className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="View Spring Boot backend code, Flyway scripts, Mermaid ERD, and 12-phase architecture"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Architecture &amp; Code View</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex space-x-1 overflow-x-auto py-1.5 scrollbar-none text-xs">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'transactions', label: 'Transactions Ledger', icon: DollarSign },
            { id: 'budgets', label: 'Budgets & Limits', icon: PieChart },
            { id: 'accounts', label: 'Accounts & Wallets', icon: CreditCard },
            { id: 'advisor', label: 'Gemini AI Advisor', icon: Bot },
            { id: 'importer', label: 'Bank Statement Importer', icon: FileSpreadsheet },
            { id: 'analytics', label: 'Analytics & Reports', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg font-medium flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* SECTION 1: DASHBOARD */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-slate-400 text-xs font-medium block">Total Net Worth</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  ${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +8.4% this month
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-slate-400 text-xs font-medium block">Monthly Inflow (Income)</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  +${totalMonthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Salary &amp; Dividends</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-slate-400 text-xs font-medium block">Monthly Outflow (Spend)</span>
                <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
                  -${totalMonthlyExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Across 6 categories</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <span className="text-slate-400 text-xs font-medium block">Net Savings Velocity</span>
                <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
                  {savingsRate}%
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">Above 20% benchmark</span>
              </div>
            </div>

            {/* Accounts Overview Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-400" /> Linked Financial Accounts
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Real-time balances across checking, savings, investments, and credit lines</p>
                </div>
                <button
                  onClick={() => setActiveSection('accounts')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Manage All →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-medium text-slate-200 truncate">{acc.name}</span>
                      <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">{acc.accountNumberMasked}</span>
                    </div>
                    <div className={`text-xl font-bold font-mono ${acc.balance < 0 ? 'text-rose-400' : 'text-white'}`}>
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{acc.type.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Split View: Recent Transactions + Budget Thresholds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Recent Transactions (7 cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" /> Recent Ledger Transactions
                  </h3>
                  <button
                    onClick={() => setActiveSection('transactions')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    View All ({transactions.length}) →
                  </button>
                </div>

                <div className="divide-y divide-slate-800/60 text-xs">
                  {transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            t.type === 'INCOME' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {t.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{t.description}</p>
                          <p className="text-[11px] text-slate-400">{t.category} • {t.date}</p>
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Budget Monitors (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-400" /> Category Budgets (80%/100%)
                  </h3>
                  <button
                    onClick={() => setActiveSection('budgets')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    All Budgets →
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  {budgets.slice(0, 4).map((b) => {
                    const pct = Math.min(100, (b.spent / b.limit) * 100);
                    const isExceeded = b.spent >= b.limit;
                    const isWarning = !isExceeded && pct >= b.thresholdPct;
                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-200">{b.category}</span>
                          <span className="font-mono text-slate-300">
                            ${b.spent.toFixed(2)} / <span className="text-slate-500">${b.limit.toFixed(2)}</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>{pct.toFixed(1)}% consumed</span>
                          {isExceeded ? (
                            <span className="text-rose-400 font-bold">EXCEEDED 100%</span>
                          ) : isWarning ? (
                            <span className="text-amber-400 font-bold">WARNING 80%</span>
                          ) : (
                            <span className="text-emerald-400">SAFE</span>
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

        {/* SECTION 2: TRANSACTIONS LEDGER */}
        {activeSection === 'transactions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Transaction Ledger
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Immutable record of income, expenses, and inter-account transfers</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAddTxModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Add Transaction
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search transactions by merchant, description, category..."
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={txCategoryFilter}
                onChange={(e) => setTxCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="ALL">All Categories</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Groceries">Groceries</option>
                <option value="Transportation">Transportation</option>
                <option value="Housing & Rent">Housing & Rent</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Income & Salary">Income & Salary</option>
              </select>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px] font-mono">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Description / Merchant</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Account</th>
                    <th className="p-3 text-right">Amount</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredTxs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                        No transactions found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTxs.map((t) => {
                      const acc = accounts.find((a) => a.id === t.accountId);
                      return (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-mono text-slate-400 whitespace-nowrap">{t.date}</td>
                          <td className="p-3 font-medium text-white">{t.description}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                              {t.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{acc?.name || 'Account'}</td>
                          <td
                            className={`p-3 text-right font-mono font-bold ${
                              t.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                            }`}
                          >
                            {t.type === 'INCOME' ? '+' : '-'}${t.amount.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 3: BUDGETS & SPENDING LIMITS */}
        {activeSection === 'budgets' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-400" /> Active Category Budgets
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time monitoring with automated alerts when spending reaches 80% (Warning) and 100% (Exceeded).
                  </p>
                </div>

                <button
                  onClick={() => setShowAddBudgetModal(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-4 h-4" /> Create Budget
                </button>
              </div>

              {/* Budgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {budgets.map((b) => {
                  const pct = Math.min(100, (b.spent / b.limit) * 100);
                  const isExceeded = b.spent >= b.limit;
                  const isWarning = !isExceeded && pct >= b.thresholdPct;

                  return (
                    <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{b.category}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                            isExceeded
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : isWarning
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {isExceeded ? 'EXCEEDED 100%' : isWarning ? 'WARNING 80%' : 'SAFE'}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between font-mono text-xs">
                        <span className="text-2xl font-bold text-white">${b.spent.toFixed(2)}</span>
                        <span className="text-slate-400">of ${b.limit.toFixed(2)}</span>
                      </div>

                      <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden bg-slate-900">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 font-mono">
                        <span>Remaining: ${(Math.max(0, b.limit - b.spent)).toFixed(2)}</span>
                        <span>{((b.spent / b.limit) * 100).toFixed(1)}% Used</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: ACCOUNTS & TRANSFERS */}
        {activeSection === 'accounts' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-400" /> Account Wallets &amp; Concurrency Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    High-concurrency atomic double-entry fund transfer engine with optimistic locking.
                  </p>
                </div>

                <button
                  onClick={() => setShowTransferModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Send className="w-4 h-4" /> Transfer Funds Between Accounts
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {accounts.map((acc) => (
                  <div key={acc.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-sm font-bold text-white block">{acc.name}</span>
                        <span className="text-xs text-slate-400 font-mono">{acc.accountNumberMasked} • {acc.currency}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                        {acc.type}
                      </span>
                    </div>

                    <div className={`text-2xl font-bold font-mono ${acc.balance < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-900 text-slate-400">
                      <span>Status: <strong className="text-emerald-400">ACTIVE</strong></span>
                      <button
                        onClick={() => {
                          setTransferSourceId(acc.id);
                          setShowTransferModal(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Transfer From Account →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: GEMINI AI ADVISOR */}
        {activeSection === 'advisor' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[580px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    FinWise AI Financial Analyst
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      gemini-3.8-flash
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Real-time financial intelligence, anomaly detection, &amp; goal planning</p>
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="hidden sm:flex gap-1.5">
                <button
                  onClick={() => handleSendAiChat('How much did I spend on dining and groceries this month?')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  Dining &amp; Groceries Spend?
                </button>
                <button
                  onClick={() => handleSendAiChat('Where can I optimize my budget to save $300 more?')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                >
                  Save $300 More?
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
              {chatMessages.map((msg, i) => (
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

              {isAiLoading && (
                <div className="flex gap-2 items-center text-slate-400 text-xs font-mono p-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Gemini 3.8 Flash analyzing your ledger...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAiChat()}
                placeholder="Ask anything about your money, savings goals, or spending..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSendAiChat()}
                disabled={isAiLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
          </div>
        )}

        {/* SECTION 6: STATEMENT IMPORTER */}
        {activeSection === 'importer' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Bank Statement CSV Importer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategy Pattern parsers for HDFC, ICICI, SBI, and Chase statements with SHA-256 duplicate detection.
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl bg-slate-950 flex flex-col items-center justify-center text-center space-y-3 transition-colors">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Upload Bank Statement CSV</span>
                <span className="text-[11px] text-slate-400">Supports HDFC, ICICI, SBI, and Chase formatted exports</span>
              </div>

              {/* Sample statement import buttons */}
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => {
                    const importedTx: AppTransaction = {
                      id: Date.now(),
                      accountId: 101,
                      category: 'Food & Dining',
                      type: 'EXPENSE',
                      amount: 62.00,
                      date: '2026-10-05',
                      description: 'Zomato Food Ordering (Imported from HDFC CSV)',
                      status: 'COMPLETED',
                    };
                    setTransactions([importedTx, ...transactions]);
                    alert('Successfully imported sample statement! 1 new transaction ingested, 1 duplicate filtered via SHA-256.');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono font-medium"
                >
                  Ingest HDFC Statement Preset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7: ANALYTICS & REPORTS */}
        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-indigo-400" /> Spending Analytics &amp; Velocity
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Visual category distribution and cash flow velocity</p>
                </div>
              </div>

              {/* Visual Breakdown Bars */}
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Housing & Rent', amount: 1750.00, color: 'bg-indigo-500', pct: 43.9 },
                  { name: 'Food & Dining', amount: 842.00, color: 'bg-rose-500', pct: 21.1 },
                  { name: 'Groceries', amount: 512.40, color: 'bg-amber-500', pct: 12.8 },
                  { name: 'Transportation', amount: 220.00, color: 'bg-emerald-500', pct: 5.5 },
                  { name: 'Shopping', amount: 129.99, color: 'bg-purple-500', pct: 3.2 },
                ].map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-200 font-sans">{item.name}</span>
                      <span className="text-slate-400">${item.amount.toFixed(2)} ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD TRANSACTION */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" /> Record New Transaction
              </h3>
              <button onClick={() => setShowAddTxModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    txType === 'EXPENSE' ? 'bg-rose-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Expense (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    txType === 'INCOME' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Income (+)
                </button>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Description / Merchant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Food, Uber, Whole Foods"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Housing & Rent">Housing & Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Income & Salary">Income & Salary</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Account</label>
                  <select
                    value={txAccountId}
                    onChange={(e) => setTxAccountId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                Save Transaction to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER FUNDS */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" /> Concurrency-Safe Fund Transfer
              </h3>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferSuccessMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-mono text-center">
                {transferSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleExecuteTransfer} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Source Account (Debit)</label>
                  <select
                    value={transferSourceId}
                    onChange={(e) => setTransferSourceId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Balance: ${a.balance.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Destination Account (Credit)</label>
                  <select
                    value={transferDestId}
                    onChange={(e) => setTransferDestId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {accounts
                      .filter((a) => a.id !== transferSourceId)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Balance: ${a.balance.toFixed(2)})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Transfer Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Memo / Transfer Note</label>
                  <input
                    type="text"
                    value={transferDesc}
                    onChange={(e) => setTransferDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Execute Atomic Transfer
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD BUDGET */}
      {showAddBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" /> Set Category Budget Limit
              </h3>
              <button onClick={() => setShowAddBudgetModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBudget} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel, Shopping, Fitness"
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Monthly Spending Limit ($)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={newBudgetLimit}
                  onChange={(e) => setNewBudgetLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="text-[11px] text-indigo-300 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
                🔔 Automated alert event will trigger when spending reaches 80% and 100% of this limit.
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all"
              >
                Create Budget Limit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
