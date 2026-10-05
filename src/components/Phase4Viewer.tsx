import React, { useState, useEffect } from 'react';
import {
  JWT_TOKEN_PROVIDER_JAVA,
  TOTP_SERVICE_JAVA,
  SECURITY_CONFIG_JAVA,
  AUTH_SERVICE_IMPL_JAVA,
} from '../data/phase4Data';
import {
  ShieldCheck,
  Key,
  Lock,
  Copy,
  Check,
  Smartphone,
  RefreshCw,
  AlertTriangle,
  QrCode,
  Terminal,
  UserCheck,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const Phase4Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'totp-lab' | 'lockout-lab'>('totp-lab');
  const [selectedFile, setSelectedFile] = useState<'jwt' | 'totp' | 'secConfig' | 'authImpl'>('totp');
  const [copied, setCopied] = useState<boolean>(false);

  // TOTP simulation state
  const [totpSecondsLeft, setTotpSecondsLeft] = useState<number>(30);
  const [simulatedCode, setSimulatedCode] = useState<string>('482910');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [totpVerified, setTotpVerified] = useState<boolean | null>(null);

  // Lockout simulation state
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutMsg, setLockoutMsg] = useState<string>('');

  // Rolling TOTP timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const seconds = now.getSeconds();
      const remaining = 30 - (seconds % 30);
      setTotpSecondsLeft(remaining);

      // On 30-sec boundary, generate fresh 6-digit code
      if (remaining === 30 || remaining === 1) {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        setSimulatedCode(newCode);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const files = {
    jwt: { name: 'JwtTokenProvider.java', path: 'src/main/java/com/finwise/security/JwtTokenProvider.java', code: JWT_TOKEN_PROVIDER_JAVA },
    totp: { name: 'TotpService.java', path: 'src/main/java/com/finwise/security/TotpService.java', code: TOTP_SERVICE_JAVA },
    secConfig: { name: 'SecurityConfig.java', path: 'src/main/java/com/finwise/config/SecurityConfig.java', code: SECURITY_CONFIG_JAVA },
    authImpl: { name: 'AuthServiceImpl.java', path: 'src/main/java/com/finwise/service/impl/AuthServiceImpl.java', code: AUTH_SERVICE_IMPL_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyTotp = () => {
    if (enteredCode === simulatedCode) {
      setTotpVerified(true);
    } else {
      setTotpVerified(false);
    }
  };

  const handleSimulateFailedPassword = () => {
    if (isLocked) return;
    const newCount = failedAttempts + 1;
    setFailedAttempts(newCount);

    if (newCount >= 5) {
      setIsLocked(true);
      setLockoutMsg('HTTP 423 LOCKED: Account locked for 15 minutes due to 5 consecutive failed attempts.');
    } else {
      setLockoutMsg(`Authentication failed. Attempt ${newCount} of 5 before account lockout.`);
    }
  };

  const handleResetLockout = () => {
    setFailedAttempts(0);
    setIsLocked(false);
    setLockoutMsg('Account unlocked. Failed attempt counter reset to 0.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" /> Phase 4: Security, JWT &amp; 2FA TOTP Engine
            </div>
            <h2 className="text-xl font-bold text-white">Spring Security 6, Stateless JWT &amp; RFC 6238 TOTP</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Dual-token authentication with refresh token rotation, Google Authenticator TOTP verification, and exponential lockout defense.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('totp-lab')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'totp-lab' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                2FA TOTP Lab
              </button>
              <button
                onClick={() => setActiveTab('lockout-lab')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'lockout-lab' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lockout Defense Lab
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

      {/* Tab 1: Live TOTP Lab */}
      {activeTab === 'totp-lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Virtual Authenticator Phone Card */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Virtual Authenticator
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">RFC 6238 • 30s Window</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-[11px] text-slate-400 font-medium">FinWise AI (alex.morgan@finwise.ai)</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-widest text-center py-2 bg-slate-900/60 rounded-lg border border-slate-800">
                {simulatedCode.slice(0, 3)} {simulatedCode.slice(3, 6)}
              </div>

              {/* Progress bar countdown */}
              <div className="space-y-1">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      totpSecondsLeft <= 5 ? 'bg-rose-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${(totpSecondsLeft / 30) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Refreshes in {totpSecondsLeft}s</span>
                  <span>Tolerance: ±30s drift</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">How FinWise 2FA Works:</div>
              <div>• Secret is generated via Base32 format on server</div>
              <div>• QR code rendered via ZXing library for instant scanning</div>
              <div>• 8 emergency backup recovery codes stored as SHA-256 hashes</div>
            </div>
          </div>

          {/* Test Login Form with 2FA Challenge */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md">
            <div>
              <h3 className="text-sm font-semibold text-white">Simulated 2FA Step-Up Challenge</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Enter the 6-digit TOTP code shown on the left to verify the authentication step.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">User Account</label>
                <input
                  type="text"
                  disabled
                  value="demo.user@finwise.ai"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">6-Digit TOTP Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={enteredCode}
                    onChange={(e) => {
                      setEnteredCode(e.target.value);
                      setTotpVerified(null);
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono text-base tracking-widest focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={() => setEnteredCode(simulatedCode)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono"
                  >
                    Paste Active Code
                  </button>
                  <button
                    onClick={handleVerifyTotp}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium text-xs shadow"
                  >
                    Verify &amp; Issue JWT
                  </button>
                </div>
              </div>

              {totpVerified === true && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>2FA Challenge Succeeded! JWT Tokens Issued:</span>
                  </div>
                  <div className="font-mono text-[10px] break-all bg-slate-950 p-2 rounded text-slate-300">
                    <div><span className="text-indigo-400">accessToken (15m):</span> eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vLnVzZXJAZmlud2lzZS5haSIsInVpZCI6MSwicm9sZSI6IlJPTEVfVVNFUiJ9...</div>
                    <div className="mt-1"><span className="text-emerald-400">refreshToken (7d):</span> eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJkZW1vLnVzZXJAZmlud2lzZS5haSIsInR5cCI6IlJFRlJFU0gifQ...</div>
                  </div>
                </div>
              )}

              {totpVerified === false && (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Invalid 2FA code. Please ensure code matches the current 30s window.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Account Lockout Defense Lab */}
      {activeTab === 'lockout-lab' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" /> Brute Force Protection &amp; Account Lockout Engine
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              FinWise tracks failed attempts in the database. When failed attempts reach 5, the account is locked for 15 minutes (`locked_until` column).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Failed Attempt Counter:</div>
              <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                <span>{failedAttempts} / 5</span>
                {failedAttempts >= 5 && <span className="text-xs px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded">THRESHOLD HIT</span>}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Account Lock Status:</div>
              <div className="text-lg font-bold font-mono">
                {isLocked ? (
                  <span className="text-rose-400 flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> LOCKED (15 MINS)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> ACTIVE &amp; UNLOCKED
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <div className="text-slate-400 text-[11px]">Password Hashing Standard:</div>
              <div className="text-xs font-mono text-indigo-400 font-semibold pt-1">
                BCrypt (Strength 12, Salted)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateFailedPassword}
              disabled={isLocked}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-all shadow"
            >
              Simulate Bad Password Attempt
            </button>
            <button
              onClick={handleResetLockout}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all"
            >
              Reset Counter / Unlock Account
            </button>
          </div>

          {lockoutMsg && (
            <div className={`p-3 rounded-lg text-xs font-mono ${isLocked ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30' : 'bg-slate-950 text-slate-300 border border-slate-800'}`}>
              {lockoutMsg}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Sources View */}
      {activeTab === 'sources' && (
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
