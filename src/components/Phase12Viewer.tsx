import React, { useState } from 'react';
import {
  SWAGGER_CONFIG_JAVA,
  RESUME_BULLETS,
  API_ENDPOINTS_SUMMARY,
} from '../data/phase12Data';
import {
  FileCode2,
  Briefcase,
  Copy,
  Check,
  CheckCircle2,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Layers,
  ChevronRight,
  Send,
  Zap,
} from 'lucide-react';

export const Phase12Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resume' | 'swagger' | 'sources'>('resume');
  const [selectedFile, setSelectedFile] = useState<'swaggerConfig'>('swaggerConfig');
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [filterTag, setFilterTag] = useState<string>('ALL');

  const tags = ['ALL', 'Authentication', 'Accounts & Ledger', 'Wallet & Transfers', 'Budgets & Limits', 'Batch & Recurring', 'Bank Statement Importer', 'AI Financial Intelligence', 'Reports & Analytics', 'Notifications & Alerts'];

  const filteredEndpoints = filterTag === 'ALL'
    ? API_ENDPOINTS_SUMMARY
    : API_ENDPOINTS_SUMMARY.filter((e) => e.tag === filterTag);

  const copyBullet = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(SWAGGER_CONFIG_JAVA);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-emerald-400" /> Phase 12: Swagger OpenAPI 3.0 &amp; Portfolio Resume
            </div>
            <h2 className="text-xl font-bold text-white">Production OpenAPI Documentation &amp; Google X-Y-Z Resume Bullets</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Complete interactive OpenAPI 3.0 REST spec with JWT Bearer security, and 4 Google X-Y-Z resume bullet points.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'resume' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Resume Bullets (Google X-Y-Z)
              </button>
              <button
                onClick={() => setActiveTab('swagger')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'swagger' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                OpenAPI 3.0 Explorer
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'sources' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Java Config
              </button>
            </div>

            {activeTab === 'sources' && (
              <button
                onClick={copyCode}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab 1: Resume Bullets (Google X-Y-Z Formula) */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Google X-Y-Z Formula Resume Standard
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every bullet point follows the elite tech standard: <span className="text-white font-semibold">"Accomplished [X] as measured by [Y], by doing [Z]"</span>.
              Ready to copy and paste directly into your Software Engineer / Backend Engineer resume or LinkedIn portfolio.
            </p>
          </div>

          <div className="space-y-4">
            {RESUME_BULLETS.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> {item.title}
                  </span>
                  <button
                    onClick={() => copyBullet(idx, item.bullet)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
                  >
                    {copiedBulletIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedBulletIdx === idx ? 'Copied to Clipboard!' : 'Copy Bullet'}
                  </button>
                </div>

                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-sans leading-relaxed select-text">
                  "{item.bullet}"
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400">
                    <strong className="text-emerald-400">Measurable Impact:</strong> {item.impact}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tech.map((t) => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: OpenAPI 3.0 Explorer */}
      {activeTab === 'swagger' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" /> FinWise REST API Specification (OpenAPI 3.0)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Secured with JWT Bearer Authentication (`Authorization: Bearer &lt;token&gt;`). Swagger UI mapped to `/swagger-ui.html`.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Bearer Token:</span>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-300 w-56 text-[11px]"
                  readOnly
                  value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active_jwt_token"
                />
              </div>
            </div>

            {/* Tag Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterTag === tag
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoints List */}
          <div className="space-y-2.5">
            {filteredEndpoints.map((ep, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono transition-all"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      ep.method === 'GET'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : ep.method === 'POST'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-bold text-white">{ep.path}</span>
                  <span className="text-[11px] text-slate-400 font-sans hidden md:inline">
                    {ep.summary}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-sans">
                    {ep.tag}
                  </span>
                  <span className="text-[10px] text-slate-500">200 OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Java Config Source */}
      {activeTab === 'sources' && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>src/main/java/com/finwise/config/OpenApiConfig.java</span>
            </div>
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded uppercase">Springdoc 2.3.0</span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-text">
            <code>{SWAGGER_CONFIG_JAVA}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
