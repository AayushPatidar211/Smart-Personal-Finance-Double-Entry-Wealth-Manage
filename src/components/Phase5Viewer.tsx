import React, { useState } from 'react';
import {
  ACCOUNT_SERVICE_JAVA,
  ACCOUNT_SERVICE_IMPL_JAVA,
  WALLET_CONTROLLER_JAVA,
} from '../data/phase5Data';
import {
  Wallet,
  ArrowRightLeft,
  Copy,
  Check,
  TrendingUp,
  Building,
  CreditCard,
  Banknote,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface MockAccount {
  id: number;
  name: string;
  type: string;
  institution: string;
  balance: number;
  version: number;
  icon: any;
}

export const Phase5Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'transfer-lab' | 'sources'>('transfer-lab');
  const [selectedFile, setSelectedFile] = useState<'service' | 'serviceImpl' | 'controller'>('serviceImpl');
  const [copied, setCopied] = useState<boolean>(false);

  // Transfer Lab State
  const [accounts, setAccounts] = useState<MockAccount[]>([
    { id: 101, name: 'Chase Checking', type: 'CHECKING', institution: 'Chase Bank', balance: 4325.50, version: 3, icon: Building },
    { id: 102, name: 'Marcus High-Yield (4.4%)', type: 'SAVINGS', institution: 'Goldman Sachs', balance: 18450.00, version: 1, icon: TrendingUp },
    { id: 103, name: 'Amex Blue Cash', type: 'CREDIT_CARD', institution: 'American Express', balance: 874.20, version: 5, icon: CreditCard },
    { id: 104, name: 'Physical Cash Wallet', type: 'CASH', institution: 'Cash on Hand', balance: 180.00, version: 0, icon: Banknote },
  ]);

  const [sourceAccountId, setSourceAccountId] = useState<number>(101);
  const [destAccountId, setDestAccountId] = useState<number>(102);
  const [transferAmount, setTransferAmount] = useState<string>('500.00');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('idemp-tx-491029');
  const [transferStatus, setTransferStatus] = useState<{ success: boolean; msg: string; tx?: any } | null>(null);

  const files = {
    service: { name: 'AccountService.java', path: 'src/main/java/com/finwise/service/AccountService.java', code: ACCOUNT_SERVICE_JAVA },
    serviceImpl: { name: 'AccountServiceImpl.java', path: 'src/main/java/com/finwise/service/impl/AccountServiceImpl.java', code: ACCOUNT_SERVICE_IMPL_JAVA },
    controller: { name: 'WalletController.java', path: 'src/main/java/com/finwise/controller/WalletController.java', code: WALLET_CONTROLLER_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteTransfer = () => {
    const amountNum = parseFloat(transferAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setTransferStatus({ success: false, msg: 'Transfer amount must be greater than $0.00' });
      return;
    }
    if (sourceAccountId === destAccountId) {
      setTransferStatus({ success: false, msg: 'Source and destination accounts must be different.' });
      return;
    }

    const sourceAcc = accounts.find((a) => a.id === sourceAccountId);
    const destAcc = accounts.find((a) => a.id === destAccountId);

    if (!sourceAcc || !destAcc) {
      setTransferStatus({ success: false, msg: 'Selected account not found.' });
      return;
    }

    if (sourceAcc.type !== 'CREDIT_CARD' && sourceAcc.balance < amountNum) {
      setTransferStatus({
        success: false,
        msg: `Insufficient Funds: ${sourceAcc.name} has available $${sourceAcc.balance.toFixed(2)}, cannot transfer $${amountNum.toFixed(2)}.`,
      });
      return;
    }

    // Execute atomic balance update & increment @Version tokens
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === sourceAccountId) {
        return {
          ...acc,
          balance: parseFloat((acc.balance - amountNum).toFixed(2)),
          version: acc.version + 1,
        };
      }
      if (acc.id === destAccountId) {
        return {
          ...acc,
          balance: parseFloat((acc.balance + amountNum).toFixed(2)),
          version: acc.version + 1,
        };
      }
      return acc;
    });

    setAccounts(updatedAccounts);

    const txRecord = {
      txId: Math.floor(1000 + Math.random() * 9000),
      source: sourceAcc.name,
      dest: destAcc.name,
      amount: amountNum.toFixed(2),
      idempotency: idempotencyKey,
      timestamp: new Date().toLocaleTimeString(),
      sourceNewBal: (sourceAcc.balance - amountNum).toFixed(2),
      destNewBal: (destAcc.balance + amountNum).toFixed(2),
    };

    setTransferStatus({
      success: true,
      msg: `Successfully transferred $${amountNum.toFixed(2)} from ${sourceAcc.name} to ${destAcc.name}. Optimistic locking version incremented for both accounts!`,
      tx: txRecord,
    });

    // Refresh idempotency key for next run
    setIdempotencyKey(`idemp-tx-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4" /> Phase 5: Account &amp; Wallet Ledger Engine
            </div>
            <h2 className="text-xl font-bold text-white">Multi-Account Balance Tracking &amp; Concurrency-Safe Transfers</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Strict BigDecimal balances, atomic inter-account transfer execution, Redis cache invalidation, and JPA @Version protection.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('transfer-lab')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'transfer-lab' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Transfer &amp; Ledger Lab
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

      {activeTab === 'transfer-lab' ? (
        <div className="space-y-6">
          {/* Live Accounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <div key={acc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {acc.name}
                    </span>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">
                      @Version: {acc.version}
                    </span>
                  </div>

                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>

                  <div className="text-[11px] text-slate-500 mt-2 flex justify-between">
                    <span>{acc.institution}</span>
                    <span className="uppercase font-mono text-[10px] text-slate-400">{acc.type}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Transfer Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Execute Atomic Intra-Account Transfer (POST /api/v1/wallet/transfer)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Source Account (Debit)</label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (${a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Destination Account (Credit)</label>
                <select
                  value={destAccountId}
                  onChange={(e) => setDestAccountId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (${a.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Transfer Amount (DECIMAL 15,2)</label>
                <input
                  type="text"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Idempotency Key (Redis Protected)</label>
                <input
                  type="text"
                  value={idempotencyKey}
                  onChange={(e) => setIdempotencyKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-indigo-300 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                Pessimistic lock order: Account {Math.min(sourceAccountId, destAccountId)} then Account {Math.max(sourceAccountId, destAccountId)}
              </span>

              <button
                onClick={handleExecuteTransfer}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Execute Atomic Transfer
              </button>
            </div>

            {/* Status output */}
            {transferStatus && (
              <div
                className={`p-4 rounded-xl text-xs space-y-2 ${
                  transferStatus.success
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {transferStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
                  <span>{transferStatus.msg}</span>
                </div>

                {transferStatus.tx && (
                  <div className="font-mono text-[11px] bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
                    <div>Transaction ID: <span className="text-indigo-400">#{transferStatus.tx.txId}</span> | Time: {transferStatus.tx.timestamp}</div>
                    <div className="mt-1">
                      {transferStatus.tx.source} Balance: <span className="text-emerald-400">${transferStatus.tx.sourceNewBal}</span> • {transferStatus.tx.dest} Balance: <span className="text-emerald-400">${transferStatus.tx.destNewBal}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Source viewer */
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
