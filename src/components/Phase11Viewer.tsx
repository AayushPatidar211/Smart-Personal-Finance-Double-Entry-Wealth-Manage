import React, { useState } from 'react';
import {
  DOCKER_COMPOSE_YML,
  DOCKERFILE_CONTENT,
  TESTCONTAINER_JAVA,
} from '../data/phase11Data';
import {
  Container,
  Boxes,
  TestTube,
  Play,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Server,
  Database,
  Radio,
  Mail,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';

interface MockContainer {
  name: string;
  image: string;
  port: string;
  status: 'HEALTHY' | 'RUNNING';
  memory: string;
  icon: any;
}

export const Phase11Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'docker' | 'test-runner' | 'sources'>('test-runner');
  const [selectedFile, setSelectedFile] = useState<'compose' | 'dockerfile' | 'integrationTest'>('compose');
  const [copied, setCopied] = useState<boolean>(false);

  // Test Runner State
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [testStats, setTestStats] = useState({ total: 28, passed: 28, failed: 0, coverage: 87.4 });
  const [testLogs, setTestLogs] = useState<string[]>([
    '[MAVEN] Surefire Test Engine initialized (JUnit 5 + Mockito + TestContainers)',
    '[INFO] Press "Execute Test Suite" to run full verification suite against TestContainers MySQL & Redis.',
  ]);

  const containers: MockContainer[] = [
    { name: 'finwise-mysql', image: 'mysql:8.0', port: '3306:3306', status: 'HEALTHY', memory: '184 MB / 1024 MB', icon: Database },
    { name: 'finwise-redis', image: 'redis:7.0-alpine', port: '6379:6379', status: 'HEALTHY', memory: '34 MB / 256 MB', icon: Server },
    { name: 'finwise-rabbitmq', image: 'rabbitmq:3.12-mgmt', port: '5672, 15672', status: 'HEALTHY', memory: '112 MB / 512 MB', icon: Radio },
    { name: 'finwise-mailpit', image: 'axllent/mailpit', port: '1025, 8025', status: 'RUNNING', memory: '18 MB / 128 MB', icon: Mail },
    { name: 'finwise-app', image: 'finwise-backend:1.0', port: '8080:8080', status: 'HEALTHY', memory: '340 MB / 1536 MB', icon: Cpu },
  ];

  const files = {
    compose: { name: 'docker-compose.yml', path: 'docker-compose.yml', code: DOCKER_COMPOSE_YML },
    dockerfile: { name: 'Dockerfile', path: 'Dockerfile', code: DOCKERFILE_CONTENT },
    integrationTest: { name: 'FinWiseIntegrationTest.java', path: 'src/test/java/com/finwise/integration/FinWiseIntegrationTest.java', code: TESTCONTAINER_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTestSuite = () => {
    setIsRunningTests(true);
    setTestLogs([
      `[INFO] -------------------------------------------------------`,
      `[INFO]  T E S T S   S U I T E   E X E C U T I O N`,
      `[INFO] -------------------------------------------------------`,
      `[INFO] Initializing TestContainers Docker Environment...`,
    ]);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        `[TESTCONTAINERS] Pulled image "mysql:8.0" (Ryuk container active)`,
        `[TESTCONTAINERS] MySQL container started at localhost:32789 (Database: finwise_test)`,
        `[TESTCONTAINERS] Redis container started at localhost:32790`,
        `[FLYWAY] Successfully applied 2 migration scripts (V1_init_schema, V2_seed_data) in 284ms`,
      ]);
    }, 600);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        `[INFO] Running com.finwise.service.AccountServiceTransferTest`,
        `  -> testSuccessfulTransfer() .......................................... PASSED (0.18s)`,
        `  -> testInsufficientBalanceThrowsException() ........................... PASSED (0.02s)`,
        `  -> testDuplicateIdempotencyKeyRejected() ............................. PASSED (0.01s)`,
        `[INFO] Running com.finwise.service.BankStatementImportStrategyTest`,
        `  -> testHdfcStrategyDetectionAndParsing() .............................. PASSED (0.12s)`,
        `  -> testSha256ChecksumDuplicateFiltering() ............................. PASSED (0.04s)`,
        `[INFO] Running com.finwise.integration.FinWiseIntegrationTest`,
        `  -> testEndToEndAccountTransfer() [TestContainers MySQL 8.0] .......... PASSED (1.42s)`,
      ]);
    }, 1400);

    setTimeout(() => {
      setTestLogs((prev) => [
        ...prev,
        `[INFO] -------------------------------------------------------`,
        `[INFO] BUILD SUCCESS`,
        `[INFO] Total tests run: 28, Failures: 0, Errors: 0, Skipped: 0`,
        `[INFO] Jacoco Code Coverage: 87.4% (Target: >80.0%)`,
        `[INFO] Total time: 3.42s | Finished at: ${new Date().toLocaleTimeString()}`,
      ]);
      setIsRunningTests(false);
      setTestStats({ total: 28, passed: 28, failed: 0, coverage: 87.4 });
    }, 2200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Boxes className="w-4 h-4" /> Phase 11: Docker Compose, TestContainers &amp; QA
            </div>
            <h2 className="text-xl font-bold text-white">Full-Stack Containerization &amp; Integration Test Suite</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Production Docker Compose (MySQL 8.0, Redis 7.0, RabbitMQ 3.12, Mailpit), TestContainers integration, and &gt;85% code coverage.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('test-runner')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'test-runner' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Test Runner &amp; Coverage
              </button>
              <button
                onClick={() => setActiveTab('docker')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'docker' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Docker Containers (5)
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'sources' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Configs &amp; Tests
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

      {/* Tab 1: Test Runner & Coverage */}
      {activeTab === 'test-runner' && (
        <div className="space-y-6">
          {/* Controls Bar & Metrics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-emerald-400" /> JUnit 5 + Mockito + TestContainers Suite Runner
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Validates concurrency-safe transfers, SHA-256 duplicate detection, Flyway migrations, and RabbitMQ bindings.
                </p>
              </div>

              <button
                onClick={runTestSuite}
                disabled={isRunningTests}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
                {isRunningTests ? 'Running Containerized Tests...' : 'Execute Test Suite (28 Tests)'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Tests Passed</span>
                <span className="text-emerald-400 font-bold text-lg">{testStats.passed} / {testStats.total}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">Failures / Errors</span>
                <span className="text-slate-400 font-bold text-lg">{testStats.failed}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">JaCoCo Code Coverage</span>
                <span className="text-indigo-400 font-bold text-lg">{testStats.coverage}%</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[11px] block">TestContainers Engine</span>
                <span className="text-emerald-400 font-bold text-lg">READY</span>
              </div>
            </div>
          </div>

          {/* Test Execution Terminal */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>Maven Surefire Output — FinWise Backend</span>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">JUnit 5.10.2</span>
            </div>

            <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-[380px] overflow-y-auto">
              {testLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`${
                    log.includes('PASSED') || log.includes('SUCCESS')
                      ? 'text-emerald-400'
                      : log.includes('TESTCONTAINERS')
                      ? 'text-indigo-300'
                      : log.includes('FAIL')
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Docker Containers Cluster Status */}
      {activeTab === 'docker' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {c.name}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold">
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-slate-400">
                    <div>Image: <span className="text-slate-200">{c.image}</span></div>
                    <div>Ports: <span className="text-indigo-300">{c.port}</span></div>
                    <div>Memory: <span className="text-slate-300">{c.memory}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
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
            <span className="text-[11px] bg-slate-800 px-2 py-0.5 rounded uppercase">Config</span>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-text">
            <code>{currentFile.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
