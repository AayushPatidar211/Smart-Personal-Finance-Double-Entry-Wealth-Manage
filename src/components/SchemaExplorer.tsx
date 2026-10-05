import React, { useState } from 'react';
import { TABLES_DATA } from '../data/schemaData';
import { Database, Search, Key, Shield, Layers, Copy, Check, Table, Info } from 'lucide-react';

export const SchemaExplorer: React.FC = () => {
  const [selectedTableName, setSelectedTableName] = useState<string>('transactions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedTable = TABLES_DATA.find((t) => t.name === selectedTableName) || TABLES_DATA[0];

  const filteredColumns = selectedTable.columns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyTableDdl = () => {
    const colStrings = selectedTable.columns
      .map((c) => `  \`${c.name}\` ${c.type} ${c.nullable ? 'NULL' : 'NOT NULL'}${c.defaultValue ? ` DEFAULT ${c.defaultValue}` : ''}`)
      .join(',\n');
    const indexStrings = selectedTable.indexes.map((idx) => `  ${idx}`).join(',\n');
    const ddl = `CREATE TABLE \`${selectedTable.name}\` (\n${colStrings},\n${indexStrings}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

    navigator.clipboard.writeText(ddl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Table className="w-4 h-4" /> 12 Normalized MySQL 8.0 Tables
            </div>
            <h2 className="text-xl font-bold text-white">Database Schema & Dictionary Inspector</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Review table schemas, data types, optimistic locking tokens, foreign keys, and index configurations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyTableDdl}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'DDL Copied!' : `Copy ${selectedTable.name} DDL`}
            </button>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {TABLES_DATA.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                setSelectedTableName(t.name);
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                selectedTableName === t.name
                  ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Table Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-white font-mono">{selectedTable.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {selectedTable.domain}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{selectedTable.description}</p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 shrink-0">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Concurrency:</span>
            <span className="text-slate-200 font-medium">{selectedTable.concurrencyStrategy}</span>
          </div>
        </div>

        {/* Filter Input */}
        <div className="my-4 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Search columns in ${selectedTable.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-200 w-full placeholder:text-slate-500"
          />
        </div>

        {/* Columns Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Column Name</th>
                <th className="py-2.5 px-4">Data Type</th>
                <th className="py-2.5 px-4">Nullable</th>
                <th className="py-2.5 px-4">Key / Attributes</th>
                <th className="py-2.5 px-4">Default Value</th>
                <th className="py-2.5 px-4">Fintech Description & Invariant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredColumns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-100 flex items-center gap-1.5">
                    {col.isPrimary && <Key className="w-3.5 h-3.5 text-amber-400" />}
                    {col.isForeign && <span className="text-indigo-400 font-bold">FK</span>}
                    <span>{col.name}</span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-indigo-300">
                    <span className={col.type.includes('DECIMAL') ? 'font-bold text-emerald-400' : ''}>
                      {col.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        col.nullable ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {col.nullable ? 'YES' : 'NO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    {col.isPrimary && <span className="text-amber-400">PRIMARY KEY</span>}
                    {col.isForeign && <span className="text-indigo-400">→ {col.foreignRef}</span>}
                    {col.name === 'version' && <span className="text-emerald-400 font-semibold">@Version JPA</span>}
                    {!col.isPrimary && !col.isForeign && col.name !== 'version' && <span className="text-slate-500">-</span>}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                    {col.defaultValue || '-'}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">
                    {col.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Indexes Section */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Indexes & Constraints Definition
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedTable.indexes.map((idx, i) => (
              <code key={i} className="text-[11px] bg-slate-950 text-indigo-300 px-2.5 py-1 rounded border border-slate-800 font-mono">
                {idx}
              </code>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
