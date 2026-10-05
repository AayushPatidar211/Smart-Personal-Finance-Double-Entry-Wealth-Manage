import React, { useState } from 'react';
import { Database, Copy, Check, ArrowRight, Code, Eye, ShieldCheck, Link2 } from 'lucide-react';

export const ErDiagramView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'mermaid'>('visual');

  const mermaidCode = `erDiagram
    USERS ||--o| USER_2FA : "has (1:1)"
    USERS ||--o{ REFRESH_TOKENS : "issues (1:N)"
    USERS ||--o{ ACCOUNTS : "owns (1:N)"
    USERS ||--o{ CATEGORIES : "defines (1:N)"
    USERS ||--o{ TRANSACTIONS : "records (1:N)"
    USERS ||--o{ BUDGETS : "allocates (1:N)"
    USERS ||--o{ RECURRING_RULES : "schedules (1:N)"
    USERS ||--o{ IMPORT_BATCHES : "uploads (1:N)"
    USERS ||--o{ AI_INSIGHTS : "receives (1:N)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:N)"

    ACCOUNTS ||--o{ TRANSACTIONS : "source_for (1:N)"
    ACCOUNTS ||--o{ TRANSACTIONS : "dest_for (1:N)"
    ACCOUNTS ||--o{ RECURRING_RULES : "targets (1:N)"
    ACCOUNTS ||--o{ IMPORT_BATCHES : "receives (1:N)"

    CATEGORIES ||--o{ CATEGORIES : "parent_of (1:N)"
    CATEGORIES ||--o{ TRANSACTIONS : "classifies (1:N)"
    CATEGORIES ||--o{ BUDGETS : "limits (1:N)"
    CATEGORIES ||--o{ RECURRING_RULES : "categorizes (1:N)"

    USERS {
        bigint id PK
        varchar email UK
        varchar password_hash
        varchar role
        varchar currency_code
        int failed_attempt_count
        timestamp locked_until
        bigint version
    }

    ACCOUNTS {
        bigint id PK
        bigint user_id FK
        varchar account_name
        varchar account_type
        decimal balance "DECIMAL(15,2)"
        bigint version "Optimistic Lock"
    }

    TRANSACTIONS {
        bigint id PK
        bigint user_id FK
        bigint account_id FK
        bigint destination_account_id FK
        bigint category_id FK
        decimal amount "DECIMAL(15,2)"
        date transaction_date
        varchar checksum_hash "SHA-256 Deduplication"
        varchar status
        bigint version
    }

    BUDGETS {
        bigint id PK
        bigint user_id FK
        bigint category_id FK
        decimal amount_limit "DECIMAL(15,2)"
        decimal spent_amount "DECIMAL(15,2)"
        int alert_threshold_pct "80% / 100%"
        boolean rollover_enabled
        bigint version
    }

    RECURRING_RULES {
        bigint id PK
        bigint user_id FK
        bigint account_id FK
        bigint category_id FK
        decimal amount "DECIMAL(15,2)"
        varchar frequency
        date next_run_date
        boolean is_paused
    }

    AI_INSIGHTS {
        bigint id PK
        bigint user_id FK
        varchar insight_type
        varchar period_month
        text summary
        json full_analysis_json
        int prompt_tokens
        int completion_tokens
    }

    AUDIT_LOGS {
        bigint id PK
        varchar entity_name
        bigint entity_id
        varchar action
        json old_state_json
        json new_state_json
        varchar correlation_id
    }`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relationships = [
    { from: 'USERS', to: 'USER_2FA', type: '1 : 1', desc: 'User to encrypted TOTP secret & backup recovery codes' },
    { from: 'USERS', to: 'ACCOUNTS', type: '1 : N', desc: 'User owns multiple checking, savings, credit cards, wallets' },
    { from: 'ACCOUNTS', to: 'TRANSACTIONS', type: '1 : N', desc: 'Dual-linked (Source Account + Optional Destination for Transfers)' },
    { from: 'CATEGORIES', to: 'TRANSACTIONS', type: '1 : N', desc: 'Category classification with parent-child hierarchy support' },
    { from: 'CATEGORIES', to: 'BUDGETS', type: '1 : N', desc: 'Monitored monthly caps with automated 80%/100% threshold alerts' },
    { from: 'USERS', to: 'RECURRING_RULES', type: '1 : N', desc: 'Scheduled transaction blueprints processed by Spring Batch' },
    { from: 'USERS', to: 'AI_INSIGHTS', type: '1 : N', desc: 'Gemini spending anomaly reports & savings opportunities' },
    { from: 'AUDIT_LOGS', to: 'ALL ENTITIES', type: 'AOP', desc: 'Regulatory audit trail with before/after JSON states and correlation IDs' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" /> 3NF Relational Data Model
          </div>
          <h2 className="text-xl font-bold text-white">Entity-Relationship (ER) Architecture</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Strict relational schema normalized to Third Normal Form (3NF) with foreign key constraints, composite indexes, and optimistic locking tokens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'visual' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Visual Model
            </button>
            <button
              onClick={() => setActiveTab('mermaid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                activeTab === 'mermaid' ? 'bg-indigo-600 text-white font-medium shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Mermaid Source
            </button>
          </div>

          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Mermaid'}
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className="space-y-6">
          {/* Key Entities High-Level Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'USERS & AUTH',
                badge: '1:1 to 2FA',
                color: 'border-indigo-500/30 bg-indigo-950/20',
                headerColor: 'text-indigo-400',
                fields: [
                  'id (BIGINT PK)',
                  'email (UNIQUE VARCHAR)',
                  'password_hash (BCrypt)',
                  'role (USER, PREMIUM, ADMIN)',
                  'failed_attempt_count (Lockout)',
                  'version (@Version)',
                ],
              },
              {
                title: 'ACCOUNTS & LEDGER',
                badge: 'DECIMAL(15,2)',
                color: 'border-emerald-500/30 bg-emerald-950/20',
                headerColor: 'text-emerald-400',
                fields: [
                  'id (BIGINT PK)',
                  'user_id (FK -> users.id)',
                  'account_type (CHECKING/SAVINGS)',
                  'balance (Optimistic Lock)',
                  'institution_name',
                  'version (BIGINT)',
                ],
              },
              {
                title: 'TRANSACTIONS',
                badge: 'SHA-256 Deduplication',
                color: 'border-blue-500/30 bg-blue-950/20',
                headerColor: 'text-blue-400',
                fields: [
                  'id (BIGINT PK)',
                  'user_id + account_id (FK)',
                  'destination_account_id (Transfers)',
                  'category_id (FK)',
                  'amount (DECIMAL 15,2)',
                  'checksum_hash (Idempotency)',
                ],
              },
              {
                title: 'BUDGETS & LIMITS',
                badge: '80% & 100% Alerts',
                color: 'border-amber-500/30 bg-amber-950/20',
                headerColor: 'text-amber-400',
                fields: [
                  'id (BIGINT PK)',
                  'category_id (FK)',
                  'amount_limit vs spent_amount',
                  'rollover_enabled & rollover_amount',
                  'alert_threshold_pct (80)',
                  'period (MONTHLY, etc.)',
                ],
              },
              {
                title: 'RECURRING & BATCH',
                badge: 'Spring Batch Job',
                color: 'border-purple-500/30 bg-purple-950/20',
                headerColor: 'text-purple-400',
                fields: [
                  'id (BIGINT PK)',
                  'next_run_date (Indexed)',
                  'frequency (DAILY/MONTHLY/CRON)',
                  'is_paused (Boolean)',
                  'total_executions (Counter)',
                  'failure_count (Retry Policy)',
                ],
              },
              {
                title: 'AI INSIGHTS & AUDIT',
                badge: 'Gemini + Regulatory',
                color: 'border-rose-500/30 bg-rose-950/20',
                headerColor: 'text-rose-400',
                fields: [
                  'ai_insights (JSON payload + tokens)',
                  'audit_logs (Old/New state JSON)',
                  'correlation_id (Distributed Trace)',
                  'notifications (In-app + Email)',
                  'import_batches (CSV duplicate stats)',
                ],
              },
            ].map((card, i) => (
              <div key={i} className={`border rounded-xl p-4 shadow-sm ${card.color}`}>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className={`text-xs font-bold tracking-wider ${card.headerColor}`}>{card.title}</span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                    {card.badge}
                  </span>
                </div>
                <div className="space-y-1.5 font-mono text-xs text-slate-300">
                  {card.fields.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Core Entity Relationships Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-indigo-400" /> Core Foreign Key Cardinalities & Constraints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {relationships.map((rel, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono font-semibold text-slate-200">
                      <span className="text-indigo-300">{rel.from}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-emerald-300">{rel.to}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{rel.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-700 text-indigo-300 rounded font-mono text-[10px] shrink-0 font-semibold">
                    {rel.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <pre className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-xs text-slate-200 font-mono overflow-x-auto leading-relaxed max-h-[600px]">
            {mermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
};
