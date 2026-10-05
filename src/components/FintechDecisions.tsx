import React from 'react';
import { ShieldCheck, Scale, Lock, Cpu, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export const FintechDecisions: React.FC = () => {
  const decisions = [
    {
      title: '1. Strict Monetary Precision & Banker’s Rounding',
      icon: Scale,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      rule: 'NEVER use FLOAT or DOUBLE. Always DECIMAL(15,2) in MySQL and java.math.BigDecimal in Spring Boot.',
      rationale:
        'IEEE-754 binary floating-point numbers cannot represent decimal fractions (like 0.10 or 0.05) precisely, causing penny-leak drift over repeated aggregations. We mandate DECIMAL(15,2) with RoundingMode.HALF_EVEN (Banker\'s Rounding) for zero rounding bias.',
    },
    {
      title: '2. Dual Concurrency Locking Protocol',
      icon: Lock,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      rule: 'Optimistic Locking via @Version for single-entity edits; Pessimistic Locking (SELECT ... FOR UPDATE) for inter-account transfers.',
      rationale:
        'Single account balance increments use JPA @Version tokens to detect race conditions without lock overhead. However, atomic transfers between Account A and Account B employ deterministic ascending-ID pessimistic locking (PESSIMISTIC_WRITE) to prevent deadlock and negative-balance overdrafts under concurrent requests.',
    },
    {
      title: '3. SHA-256 Idempotency & Duplicate Rejection',
      icon: ShieldCheck,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      rule: 'Compute SHA-256(userId + accountId + date + amount + normalizedDescription) on statement ingestion.',
      rationale:
        'Users frequently upload bank statements with overlapping date ranges. Rather than naive string matches, FinWise normalizes whitespace, dates, and amounts into a canonical payload and checks the composite index idx_tx_checksum(user_id, checksum_hash) before insertion.',
    },
    {
      title: '4. Soft Deletes with Audit Immutability',
      icon: Database,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      rule: 'Financial records are never physically dropped; rows are flagged with is_deleted = TRUE and deleted_at.',
      rationale:
        'Fintech regulations (SOX, PCI-DSS) require permanent reconstructability of historical balances. Custom JPA Hibernate filters (@SQLDelete / @Where) hide deleted transactions from standard queries while preserving audit trail logs in audit_logs.',
    },
    {
      title: '5. High-Throughput Composite Indexing Strategy',
      icon: Cpu,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      rule: 'Covering composite indexes tailored to user-scoped time-series queries.',
      rationale:
        'Over 95% of queries filter by user_id and sort by transaction_date. A single-column index on transaction_date would require scanning multiple users. Our composite index idx_tx_user_date (user_id, transaction_date DESC) ensures zero filesorts and index-only range scans.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-white">Fintech Architectural Decision Records (ADR)</h2>
        <p className="text-slate-400 text-xs mt-1">
          Core engineering standards guaranteeing mathematical correctness, ACID compliance, zero concurrency race conditions, and auditability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decisions.map((dec, i) => {
          const Icon = dec.icon;
          return (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${dec.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white text-sm">{dec.title}</h3>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-amber-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{dec.rule}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{dec.rationale}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
