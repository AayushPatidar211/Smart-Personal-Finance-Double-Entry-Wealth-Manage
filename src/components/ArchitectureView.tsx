import React, { useState } from 'react';
import { Layers, Shield, Database, Cpu, Sparkles, RefreshCw, Clock, Bell, CheckCircle2, ChevronRight, Server } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedLayer, setSelectedLayer] = useState<'all' | 'security' | 'core' | 'ai' | 'batch' | 'storage'>('all');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" /> Clean Modular Monolith Architecture
            </div>
            <h2 className="text-2xl font-bold tracking-tight">FinWise AI System Architecture Blueprint</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Spring Boot 3.2.x enterprise personal finance core with domain-driven modularity, strict concurrency guarantees, Redis 7 caching, and Google Gemini financial intelligence.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Spring Boot 3.2.x
            </span>
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> MySQL 8.0 + Flyway
            </span>
            <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full text-xs font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800 text-xs">
          {[
            { id: 'all', label: 'Complete System Map' },
            { id: 'security', label: '1. Security & Edge Filter' },
            { id: 'core', label: '2. Clean Core Services' },
            { id: 'batch', label: '3. Batch & Schedulers' },
            { id: 'ai', label: '4. AI & Gemini Engine' },
            { id: 'storage', label: '5. Persistence & Cache' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedLayer(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                selectedLayer === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Diagram Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Layer 1: Client & Security Filter Chain */}
        {(selectedLayer === 'all' || selectedLayer === 'security') && (
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Layer 1: Security & Edge Filter Chain</h3>
                  <p className="text-xs text-slate-400">Spring Security 6, JWT Filter, TOTP 2FA, Bucket4j Rate Limiting</p>
                </div>
              </div>
              <span className="text-xs bg-indigo-900/40 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-700/50">
                Stateless / HttpOnly Cookies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3">
                <div className="font-medium text-slate-200 mb-1 flex items-center justify-between">
                  <span>JwtAuthenticationFilter</span>
                  <span className="text-[10px] text-indigo-400">Every Request</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Extracts Bearer token or HttpOnly cookie, validates signature with HMAC-SHA256, populates SecurityContext.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3">
                <div className="font-medium text-slate-200 mb-1 flex items-center justify-between">
                  <span>TwoFactorAuthFilter</span>
                  <span className="text-[10px] text-amber-400">TOTP (RFC 6238)</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Verifies 6-digit TOTP codes or emergency recovery hashes. Enforces pre-auth state for 2FA-enabled accounts.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3">
                <div className="font-medium text-slate-200 mb-1 flex items-center justify-between">
                  <span>RateLimitingFilter (Bucket4j)</span>
                  <span className="text-[10px] text-rose-400">Redis-backed</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Limits login attempts (5/min per IP), AI requests (10/min per user), and sensitive financial exports.
                </p>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/50 rounded-lg p-3">
                <div className="font-medium text-slate-200 mb-1 flex items-center justify-between">
                  <span>CorrelationIdFilter & Mapped MDC</span>
                  <span className="text-[10px] text-emerald-400">Observability</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Injects `X-Correlation-ID` into Logback MDC for distributed tracing across services, audit logs, and async jobs.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Layer 2: API & Controller Layer */}
        {(selectedLayer === 'all' || selectedLayer === 'core') && (
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Layer 2: Clean Architecture Domain Services (Controller → Service → Repository)</h3>
                  <p className="text-xs text-slate-400">Modular Monolith with strict DTO mapping (MapStruct) and Jakarta Bean Validation</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-900/40 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-700/50">
                12 Distinct Sub-Domains
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
              {[
                { name: 'Auth & Profile', route: '/api/v1/auth', desc: 'Login, Refresh, 2FA setup, Logout' },
                { name: 'Accounts & Wallets', route: '/api/v1/accounts', desc: 'Balances, reconciliation, ledger' },
                { name: 'Transactions', route: '/api/v1/transactions', desc: 'Income, expense, intra-account transfers' },
                { name: 'Categories & Budgets', route: '/api/v1/budgets', desc: 'Threshold alerts, rollovers, limits' },
                { name: 'Statement Importer', route: '/api/v1/imports', desc: 'HDFC, ICICI, SBI, Chase CSV parser' },
                { name: 'AI Financial Insights', route: '/api/v1/ai', desc: 'Gemini anomaly detection & RAG chat' },
              ].map((m, idx) => (
                <div key={idx} className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3 hover:border-slate-600 transition-colors">
                  <div className="font-semibold text-slate-200">{m.name}</div>
                  <div className="text-[10px] font-mono text-indigo-400 my-1">{m.route}</div>
                  <div className="text-[11px] text-slate-400">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Layer 3: Batch, Scheduler & Messaging */}
        {(selectedLayer === 'all' || selectedLayer === 'batch') && (
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Layer 3A: Batch & Schedulers</h3>
                  <p className="text-xs text-slate-400">Spring Batch 5 + Quartz Scheduler Cluster</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-between text-slate-200 font-medium">
                  <span>Spring Batch RecurringJob</span>
                  <span className="text-[10px] text-amber-400">Chunk Size = 10</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Runs daily at midnight. Reader streams pending recurring rules, Processor checks next run date & generates transaction entity, Writer persists batch with retry policy.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-between text-slate-200 font-medium">
                  <span>Quartz BudgetBreachJob</span>
                  <span className="text-[10px] text-amber-400">Cron: Hourly / Event</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Computes aggregate spent amount vs threshold. Dispatches alert notifications when budget reaches 80% and 100% caps.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Layer 4: AI Insights Subsystem */}
        {(selectedLayer === 'all' || selectedLayer === 'ai') && (
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Layer 3B: AI Engine (Google Gemini 3.8 Flash)</h3>
                  <p className="text-xs text-slate-400">Financial Analyst Persona, Prompt Templates & Caching</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-between text-slate-200 font-medium">
                  <span>Gemini Financial Analyst Persona</span>
                  <span className="text-[10px] text-purple-400">Structured JSON</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  System prompt enforces strict financial domain reasoning (50/30/20 rule, burn rate, runway). Structured output parses anomaly flags and saving recommendations.
                </p>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/40">
                <div className="flex items-center justify-between text-slate-200 font-medium">
                  <span>Redis AI Cache (24h TTL) + RabbitMQ</span>
                  <span className="text-[10px] text-purple-400">Cost & Rate Control</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Keyed by <code>ai:insight:user:&#123;id&#125;:&#123;month&#125;</code>. Offloads heavy multi-month trend computation to asynchronous RabbitMQ worker queues.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Layer 5: Data & Persistence Tier */}
        {(selectedLayer === 'all' || selectedLayer === 'storage') && (
          <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Layer 4: Persistence, Caching & Audit Infrastructure</h3>
                  <p className="text-xs text-slate-400">MySQL 8.0 InnoDB + Redis 7.0 Cluster + Flyway Migration Versioning</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3">
                <div className="font-medium text-slate-200 flex items-center justify-between mb-1">
                  <span>MySQL 8.0 (InnoDB)</span>
                  <span className="text-[10px] text-blue-400">ACID + 3NF</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  12 normalized tables with strict `DECIMAL(15,2)`, composite indexes `(user_id, transaction_date DESC)`, foreign keys, and soft deletes.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3">
                <div className="font-medium text-slate-200 flex items-center justify-between mb-1">
                  <span>Redis 7.0 In-Memory Store</span>
                  <span className="text-[10px] text-rose-400">Sub-millisecond</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Caches computed account balances, dashboard aggregate summaries, active user JWT blacklist, and Bucket4j rate limiting tokens.
                </p>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3">
                <div className="font-medium text-slate-200 flex items-center justify-between mb-1">
                  <span>Audit Trail & Flyway</span>
                  <span className="text-[10px] text-emerald-400">Regulatory Ready</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  `audit_logs` records old and new JSON states via AOP `@Auditable`. Flyway guarantees idempotent versioned database schema rollouts.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean Architecture Callout */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-md shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-white">Fintech Separation of Concerns: </span>
          Controllers receive validated DTOs only; business logic, double-entry ledger bookkeeping, and locking invariants live exclusively in `@Transactional` service implementations. Repositories handle optimized JPA queries, while entities are never leaked past the Service boundary.
        </div>
      </div>
    </div>
  );
};
