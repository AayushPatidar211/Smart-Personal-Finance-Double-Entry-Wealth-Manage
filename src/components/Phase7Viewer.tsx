import React, { useState } from 'react';
import {
  SAMPLE_HDFC_CSV,
  SAMPLE_ICICI_CSV,
  SAMPLE_SBI_CSV,
  BANK_STRATEGY_JAVA,
  BANK_FACTORY_JAVA,
  DEDUPLICATION_SERVICE_JAVA,
} from '../data/phase7Data';
import {
  FileSpreadsheet,
  Upload,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  Filter,
  Sparkles,
  Hash,
  Database,
} from 'lucide-react';

interface ParsedResult {
  line: number;
  date: string;
  description: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  category: string;
  checksum: string;
  isDuplicate: boolean;
}

export const Phase7Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import-lab' | 'sources'>('import-lab');
  const [selectedBank, setSelectedBank] = useState<'HDFC' | 'ICICI' | 'SBI'>('HDFC');
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_HDFC_CSV);
  const [selectedFile, setSelectedFile] = useState<'strategy' | 'factory' | 'dedup'>('factory');
  const [copied, setCopied] = useState<boolean>(false);

  // Import Results State
  const [parsedRows, setParsedRows] = useState<ParsedResult[] | null>(null);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    imported: number;
    duplicates: number;
    debitTotal: number;
    creditTotal: number;
  } | null>(null);

  const files = {
    strategy: { name: 'BankImportStrategy.java', path: 'src/main/java/com/finwise/importer/strategy/BankImportStrategy.java', code: BANK_STRATEGY_JAVA },
    factory: { name: 'BankImportStrategyFactory.java', path: 'src/main/java/com/finwise/importer/strategy/BankImportStrategyFactory.java', code: BANK_FACTORY_JAVA },
    dedup: { name: 'TransactionDeduplicationService.java', path: 'src/main/java/com/finwise/importer/deduplication/TransactionDeduplicationService.java', code: DEDUPLICATION_SERVICE_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBankChange = (bank: 'HDFC' | 'ICICI' | 'SBI') => {
    setSelectedBank(bank);
    setParsedRows(null);
    setImportSummary(null);
    if (bank === 'HDFC') setCsvContent(SAMPLE_HDFC_CSV);
    if (bank === 'ICICI') setCsvContent(SAMPLE_ICICI_CSV);
    if (bank === 'SBI') setCsvContent(SAMPLE_SBI_CSV);
  };

  const handleExecuteImport = () => {
    const lines = csvContent.trim().split('\n');
    if (lines.length <= 1) return;

    const seenChecksums = new Set<string>();
    const results: ParsedResult[] = [];
    let importedCount = 0;
    let dupCount = 0;
    let debits = 0;
    let credits = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = line.split(',');

      let date = parts[0];
      let desc = parts[1] || '';
      let amount = 0;
      let type: 'EXPENSE' | 'INCOME' = 'EXPENSE';

      if (selectedBank === 'HDFC') {
        const withdrawal = parseFloat(parts[4]) || 0;
        const deposit = parseFloat(parts[5]) || 0;
        if (withdrawal > 0) {
          amount = withdrawal;
          type = 'EXPENSE';
          debits += amount;
        } else {
          amount = deposit;
          type = 'INCOME';
          credits += amount;
        }
      } else if (selectedBank === 'ICICI') {
        desc = parts[2] || '';
        const debit = parseFloat(parts[3]) || 0;
        const credit = parseFloat(parts[4]) || 0;
        if (debit > 0) {
          amount = debit;
          type = 'EXPENSE';
          debits += amount;
        } else {
          amount = credit;
          type = 'INCOME';
          credits += amount;
        }
      } else if (selectedBank === 'SBI') {
        desc = parts[2] || '';
        const debit = parseFloat(parts[4]) || 0;
        const credit = parseFloat(parts[5]) || 0;
        if (debit > 0) {
          amount = debit;
          type = 'EXPENSE';
          debits += amount;
        } else {
          amount = credit;
          type = 'INCOME';
          credits += amount;
        }
      }

      // SHA-256 Simulation
      const normDesc = desc.toLowerCase().trim();
      const rawHashSeed = `101|${date}|${amount.toFixed(2)}|${normDesc}`;
      // Basic deterministic hash string for display
      let hash = 0;
      for (let c = 0; c < rawHashSeed.length; c++) {
        hash = (hash << 5) - hash + rawHashSeed.charCodeAt(c);
        hash |= 0;
      }
      const checksum = Math.abs(hash).toString(16).padStart(12, '0') + 'c94b7e8201a';

      // Auto-categorization
      let category = 'General Expense';
      if (normDesc.includes('swiggy') || normDesc.includes('zomato') || normDesc.includes('starbucks')) category = 'Food & Dining';
      else if (normDesc.includes('uber') || normDesc.includes('shell') || normDesc.includes('petrol')) category = 'Transportation';
      else if (normDesc.includes('salary') || normDesc.includes('dividend')) category = 'Income & Investments';
      else if (normDesc.includes('amazon') || normDesc.includes('flipkart')) category = 'Shopping';
      else if (normDesc.includes('netflix')) category = 'Entertainment';

      // Duplicate Check
      const isDuplicate = seenChecksums.has(checksum);
      if (isDuplicate) {
        dupCount++;
      } else {
        seenChecksums.add(checksum);
        importedCount++;
      }

      results.push({
        line: i + 1,
        date,
        description: desc,
        amount,
        type,
        category,
        checksum,
        isDuplicate,
      });
    }

    setParsedRows(results);
    setImportSummary({
      total: results.length,
      imported: importedCount,
      duplicates: dupCount,
      debitTotal: debits,
      creditTotal: credits,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-4 h-4" /> Phase 7: CSV Bank Statement Importer &amp; Strategy Pattern
            </div>
            <h2 className="text-xl font-bold text-white">Multi-Bank Statement Parser &amp; SHA-256 Deduplication</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Extensible Strategy Pattern for Indian &amp; Global banks (HDFC, ICICI, SBI, Chase), auto-categorization heuristics, and idempotent deduplication.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('import-lab')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'import-lab' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Statement Importer Lab
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

      {activeTab === 'import-lab' ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Select Bank Format Strategy:</span>
                <div className="flex gap-1.5">
                  {(['HDFC', 'ICICI', 'SBI'] as const).map((bank) => (
                    <button
                      key={bank}
                      onClick={() => handleBankChange(bank)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold font-mono transition-all ${
                        selectedBank === bank
                          ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {bank} Bank
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExecuteImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
                >
                  <Upload className="w-3.5 h-3.5" /> Execute Import &amp; Deduplication
                </button>
              </div>
            </div>

            {/* CSV Editor Area */}
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1.5">
                <span>Raw Bank CSV Data (Simulates multipart/form-data upload)</span>
                <span className="font-mono text-indigo-400">StrategyFactory.detectStrategy() → {selectedBank}BankImportStrategy</span>
              </div>
              <textarea
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                rows={7}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Stats Bar */}
          {importSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-[11px] block">Total Records in Statement</span>
                <span className="text-2xl font-bold font-mono text-white">{importSummary.total} rows</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-[11px] block">Imported to Ledger</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{importSummary.imported} rows</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-[11px] block">Duplicates Filtered (SHA-256)</span>
                <span className="text-2xl font-bold font-mono text-amber-400">{importSummary.duplicates} skipped</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <span className="text-slate-400 text-[11px] block">Total Net Volume</span>
                <span className="text-lg font-bold font-mono text-indigo-300">
                  +${importSummary.creditTotal.toFixed(2)} / -${importSummary.debitTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Parsed Transactions Table */}
          {parsedRows && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> Ingestion &amp; Deduplication Audit Results
                </h3>
                <span className="text-[11px] text-slate-400">Spring Data JPA batch_size: 25</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="p-3">Line</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Narration / Description</th>
                      <th className="p-3">Auto-Category</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">SHA-256 Checksum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedRows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={r.isDuplicate ? 'bg-amber-950/20 text-amber-300' : 'hover:bg-slate-800/40 text-slate-200'}
                      >
                        <td className="p-3 text-slate-500">#{r.line}</td>
                        <td className="p-3">
                          {r.isDuplicate ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> DUPLICATE_SKIPPED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> INGESTED
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">{r.date}</td>
                        <td className="p-3 font-sans font-medium">{r.description}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px] font-sans">
                            {r.category}
                          </span>
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            r.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                          }`}
                        >
                          {r.type === 'INCOME' ? '+' : '-'}${r.amount.toFixed(2)}
                        </td>
                        <td className="p-3 text-slate-500 text-[10px] truncate max-w-[140px]">
                          {r.checksum}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
