import React, { useState } from 'react';
import { FileCode2, Copy, Check, Download, Search, Terminal } from 'lucide-react';

interface FlywayViewerProps {
  v1Sql: string;
  v2Sql: string;
}

export const FlywayViewer: React.FC<FlywayViewerProps> = ({ v1Sql, v2Sql }) => {
  const [activeTab, setActiveTab] = useState<'V1' | 'V2'>('V1');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentContent = activeTab === 'V1' ? v1Sql : v2Sql;
  const currentFileName = activeTab === 'V1' ? 'V1__init_schema.sql' : 'V2__seed_data.sql';

  const copyCode = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSql = () => {
    const blob = new Blob([currentContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLines = currentContent
    .split('\n')
    .filter((line) => !searchQuery || line.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <FileCode2 className="w-4 h-4" /> Flyway Database Migrations
            </div>
            <h2 className="text-xl font-bold text-white">Version-Controlled SQL Scripts</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Production Flyway migration files for schema bootstrapping (`V1__init_schema.sql`) and sample fintech dataset (`V2__seed_data.sql`).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => {
                  setActiveTab('V1');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-md font-mono transition-all ${
                  activeTab === 'V1' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                V1__init_schema.sql
              </button>
              <button
                onClick={() => {
                  setActiveTab('V2');
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-md font-mono transition-all ${
                  activeTab === 'V2' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                V2__seed_data.sql
              </button>
            </div>

            <button
              onClick={copyCode}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Script'}
            </button>

            <button
              onClick={downloadSql}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download .sql
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder={`Filter lines in ${currentFileName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-slate-200 w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>src/main/resources/db/migration/{currentFileName}</span>
          </div>
          <span>{filteredLines.length} lines</span>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[600px] leading-relaxed select-text">
          <code>{filteredLines.join('\n')}</code>
        </pre>
      </div>
    </div>
  );
};
