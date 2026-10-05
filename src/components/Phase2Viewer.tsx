import React, { useState } from 'react';
import {
  POM_XML_CONTENT,
  APPLICATION_YML_CONTENT,
  APPLICATION_DEV_YML_CONTENT,
  APPLICATION_PROD_YML_CONTENT,
  BASE_ENTITY_JAVA,
  API_RESPONSE_JAVA,
  GLOBAL_EXCEPTION_HANDLER_JAVA,
} from '../data/phase2Data';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Settings,
  ShieldAlert,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Code2,
} from 'lucide-react';

export const Phase2Viewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<
    | 'pom'
    | 'app-yml'
    | 'app-dev-yml'
    | 'app-prod-yml'
    | 'base-entity'
    | 'api-response'
    | 'global-handler'
  >('pom');
  const [copied, setCopied] = useState<boolean>(false);

  // Playground state
  const [simScenario, setSimScenario] = useState<
    'success' | 'validation' | 'insufficient_funds' | 'optimistic_lock' | 'rate_limit' | 'not_found'
  >('success');

  const fileMap = {
    pom: { name: 'pom.xml', lang: 'xml', path: 'finwise-ai/pom.xml', content: POM_XML_CONTENT },
    'app-yml': { name: 'application.yml', lang: 'yaml', path: 'src/main/resources/application.yml', content: APPLICATION_YML_CONTENT },
    'app-dev-yml': { name: 'application-dev.yml', lang: 'yaml', path: 'src/main/resources/application-dev.yml', content: APPLICATION_DEV_YML_CONTENT },
    'app-prod-yml': { name: 'application-prod.yml', lang: 'yaml', path: 'src/main/resources/application-prod.yml', content: APPLICATION_PROD_YML_CONTENT },
    'base-entity': { name: 'BaseEntity.java', lang: 'java', path: 'src/main/java/com/finwise/common/BaseEntity.java', content: BASE_ENTITY_JAVA },
    'api-response': { name: 'ApiResponse.java', lang: 'java', path: 'src/main/java/com/finwise/common/ApiResponse.java', content: API_RESPONSE_JAVA },
    'global-handler': { name: 'GlobalExceptionHandler.java', lang: 'java', path: 'src/main/java/com/finwise/exception/GlobalExceptionHandler.java', content: GLOBAL_EXCEPTION_HANDLER_JAVA },
  };

  const currentFile = fileMap[activeFile];

  const copyContent = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Envelope output simulator
  const getSimulatedResponse = () => {
    const correlationId = 'corr-9a7f82b1-3e40-4c28-9821-ff8201a948bc';
    const timestamp = new Date().toISOString();

    switch (simScenario) {
      case 'success':
        return {
          timestamp,
          status: 200,
          message: 'Operation completed successfully',
          data: {
            accountId: 101,
            accountName: 'Chase Total Checking',
            balance: '4325.50',
            currency: 'USD',
            version: 3,
          },
          path: '/api/v1/accounts/101',
          correlationId,
        };
      case 'validation':
        return {
          timestamp,
          status: 400,
          message: 'Validation failed for request payload',
          data: {
            amount: 'must be greater than 0.00',
            currencyCode: 'must match pattern [A-Z]{3}',
            transactionDate: 'cannot be in the future',
          },
          path: '/api/v1/transactions',
          correlationId,
        };
      case 'insufficient_funds':
        return {
          timestamp,
          status: 422,
          message: 'Account ID 101 has insufficient funds. Available: 4325.50, Requested: 5000.00',
          path: '/api/v1/accounts/101/transfer',
          correlationId,
        };
      case 'optimistic_lock':
        return {
          timestamp,
          status: 409,
          message: 'The resource was modified concurrently by another transaction. Please refresh and retry.',
          path: '/api/v1/accounts/101',
          correlationId,
        };
      case 'rate_limit':
        return {
          timestamp,
          status: 429,
          message: 'Too many requests. Limit of 10 requests per minute exceeded.',
          path: '/api/v1/ai/ask',
          correlationId,
        };
      case 'not_found':
        return {
          timestamp,
          status: 404,
          message: "Transaction not found with id: '9999'",
          path: '/api/v1/transactions/9999',
          correlationId,
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Code2 className="w-4 h-4" /> Phase 2: Core Build & Exception Infrastructure
            </div>
            <h2 className="text-xl font-bold text-white">Maven POM, Multi-Profile YAML & Error Architecture</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Production-ready build manifests, HikariCP/Redis profiles, audited BaseEntity with @Version, and centralized exception handling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyContent}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : `Copy ${currentFile.name}`}
            </button>

            <button
              onClick={downloadFile}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>
        </div>

        {/* File Navigator Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
          {[
            { id: 'pom', label: 'pom.xml', badge: 'Maven 3.2.4' },
            { id: 'app-yml', label: 'application.yml', badge: 'Base Config' },
            { id: 'app-dev-yml', label: 'application-dev.yml', badge: 'Dev Profile' },
            { id: 'app-prod-yml', label: 'application-prod.yml', badge: 'Prod Profile' },
            { id: 'base-entity', label: 'BaseEntity.java', badge: 'JPA Audit & @Version' },
            { id: 'api-response', label: 'ApiResponse.java', badge: 'Envelope DTO' },
            { id: 'global-handler', label: 'GlobalExceptionHandler.java', badge: '@RestControllerAdvice' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFile(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                activeFile === tab.id
                  ? 'bg-indigo-600 text-white shadow ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] bg-slate-900/60 px-1.5 py-0.5 rounded text-indigo-300 font-sans">
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentFile.path}</span>
          </div>
          <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded uppercase">{currentFile.lang}</span>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-text">
          <code>{currentFile.content}</code>
        </pre>
      </div>

      {/* Interactive ApiResponse & GlobalExceptionHandler Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <Play className="w-4 h-4" /> Live JSON Envelope Simulator
            </div>
            <h3 className="text-base font-bold text-white">ApiResponse&lt;T&gt; &amp; Exception Contract Testing</h3>
            <p className="text-slate-400 text-xs">
              Test how GlobalExceptionHandler formats domain violations into the standardized fintech envelope.
            </p>
          </div>

          {/* Scenario Pills */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: 'success', label: '200 OK (Account)', color: 'text-emerald-400' },
              { id: 'validation', label: '400 Validation Error', color: 'text-amber-400' },
              { id: 'insufficient_funds', label: '422 Insufficient Funds', color: 'text-rose-400' },
              { id: 'optimistic_lock', label: '409 Optimistic Lock', color: 'text-purple-400' },
              { id: 'rate_limit', label: '429 Rate Exceeded', color: 'text-indigo-400' },
              { id: 'not_found', label: '404 Not Found', color: 'text-slate-400' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSimScenario(sc.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  simScenario === sc.id
                    ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-600 shadow'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                <span className={sc.color}>●</span> {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Payload Preview */}
        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <span>HTTP/1.1 {getSimulatedResponse().status}</span>
            <span className="text-indigo-400">Content-Type: application/json;charset=UTF-8</span>
          </div>
          <pre className="text-emerald-400 overflow-x-auto">
            {JSON.stringify(getSimulatedResponse(), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
