import React, { useState } from 'react';
import {
  RABBITMQ_CONFIG_JAVA,
  NOTIFICATION_LISTENER_JAVA,
  QUARTZ_JOB_JAVA,
} from '../data/phase10Data';
import {
  Bell,
  Radio,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Zap,
  Mail,
  Smartphone,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react';

interface MockNotification {
  id: number;
  title: string;
  message: string;
  type: 'BUDGET' | 'TRANSACTION' | 'SECURITY';
  channel: 'EMAIL' | 'IN_APP' | 'BOTH';
  timestamp: string;
  isRead: boolean;
}

export const Phase10Viewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broker-lab' | 'quartz-jobs' | 'sources'>('broker-lab');
  const [selectedFile, setSelectedFile] = useState<'config' | 'listener' | 'quartz'>('config');
  const [copied, setCopied] = useState<boolean>(false);

  // Notifications State
  const [notifications, setNotifications] = useState<MockNotification[]>([
    {
      id: 1,
      title: '🚨 Budget Breached: Dining Out (100%)',
      message: 'You have consumed $385.60 of your $400.00 monthly allocation.',
      type: 'BUDGET',
      channel: 'BOTH',
      timestamp: '10:20 AM',
      isRead: false,
    },
    {
      id: 2,
      title: '💳 Large Transaction Alert: $1,299.00',
      message: 'Amazon Pay India transaction debited from Chase Checking Account.',
      type: 'TRANSACTION',
      channel: 'IN_APP',
      timestamp: 'Yesterday',
      isRead: false,
    },
    {
      id: 3,
      title: '🔒 Security Alert: 2FA Activated',
      message: 'Google Authenticator TOTP protection enabled successfully for your account.',
      type: 'SECURITY',
      channel: 'EMAIL',
      timestamp: '2 days ago',
      isRead: true,
    },
  ]);

  const [amqpLogs, setAmqpLogs] = useState<string[]>([
    '[AMQP_INIT] Connected to RabbitMQ cluster at amqp://guest:guest@localhost:5672',
    '[EXCHANGE] Declared TopicExchange "finwise.events" (durable: true)',
    '[QUEUE] Bound "notification.email.queue" -> routingKey: "notification.email.#"',
    '[QUEUE] Bound "notification.inapp.queue" -> routingKey: "notification.inapp.#"',
    '[DLQ] Configured DeadLetterExchange "finwise.dlx" -> "notification.dlq"',
  ]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const files = {
    config: { name: 'RabbitMqConfig.java', path: 'src/main/java/com/finwise/config/RabbitMqConfig.java', code: RABBITMQ_CONFIG_JAVA },
    listener: { name: 'NotificationEventListener.java', path: 'src/main/java/com/finwise/notification/listener/NotificationEventListener.java', code: NOTIFICATION_LISTENER_JAVA },
    quartz: { name: 'BudgetMonitoringJob.java', path: 'src/main/java/com/finwise/scheduler/BudgetMonitoringJob.java', code: QUARTZ_JOB_JAVA },
  };

  const currentFile = files[selectedFile];

  const copyCode = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateEvent = (type: 'BUDGET' | 'TRANSACTION' | 'DLQ') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (type === 'BUDGET') {
      const newNotif: MockNotification = {
        id: Date.now(),
        title: '⚠️ Budget Alert: Groceries reached 82.5%',
        message: 'Current spend is $536.25 of your $650.00 monthly allocation.',
        type: 'BUDGET',
        channel: 'BOTH',
        timestamp: time,
        isRead: false,
      };
      setNotifications([newNotif, ...notifications]);
      setAmqpLogs((prev) => [
        `[PUBLISH] Event "BUDGET_WARNING_80" routed to "notification.inapp.budget" & "notification.email.budget"`,
        `[CONSUMER] NotificationEventListener picked up message (id: ${newNotif.id}). WebSocket broadcasted to user session.`,
        ...prev,
      ]);
    } else if (type === 'TRANSACTION') {
      const newNotif: MockNotification = {
        id: Date.now(),
        title: '💳 High-Value Outflow: $850.00',
        message: 'Transaction exceeding your $500 threshold detected at Apple Store.',
        type: 'TRANSACTION',
        channel: 'IN_APP',
        timestamp: time,
        isRead: false,
      };
      setNotifications([newNotif, ...notifications]);
      setAmqpLogs((prev) => [
        `[PUBLISH] Event "LARGE_TRANSACTION_ALERT" routed to "notification.inapp.tx"`,
        `[CONSUMER] Stored in-app notification record and pushed badge increment.`,
        ...prev,
      ]);
    } else if (type === 'DLQ') {
      setAmqpLogs((prev) => [
        `[PUBLISH] Event "SIMULATED_TRANSIENT_FAILURE" dispatched to "notification.email.digest"`,
        `[RETRY 1/3] Transient SMTP network timeout. Exponential backoff delay: 1000ms`,
        `[RETRY 2/3] Transient SMTP network timeout. Exponential backoff delay: 2000ms`,
        `[RETRY 3/3] Transient SMTP network timeout. Exponential backoff delay: 4000ms`,
        `[DEAD_LETTER] Max retry limit exceeded (3). Message routed to DLQ "notification.dlq" for manual inspection!`,
        ...prev,
      ]);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Radio className="w-4 h-4" /> Phase 10: Event-Driven Notifications &amp; Quartz Scheduler
            </div>
            <h2 className="text-xl font-bold text-white">RabbitMQ Topic Exchange, Clustered Quartz &amp; Dead-Letter Queue</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              Asynchronous event routing (Email + In-App), WebSocket push delivery, 3-stage exponential retries, and database-backed Quartz scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-800 p-1 rounded-lg flex text-xs">
              <button
                onClick={() => setActiveTab('broker-lab')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'broker-lab' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                RabbitMQ Event Lab
              </button>
              <button
                onClick={() => setActiveTab('quartz-jobs')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'quartz-jobs' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Quartz Clustered Jobs
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

      {/* Tab 1: RabbitMQ Event Broker Lab */}
      {activeTab === 'broker-lab' && (
        <div className="space-y-6">
          {/* Action Trigger Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Event Dispatch Simulator (Topic Exchange: finwise.events)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish events to RabbitMQ exchange to test consumer processing, email queuing, in-app badges, and DLQ routing.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleSimulateEvent('BUDGET')}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Trigger 80% Budget Alert
                </button>
                <button
                  onClick={() => handleSimulateEvent('TRANSACTION')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" /> Large Tx Alert ($850)
                </button>
                <button
                  onClick={() => handleSimulateEvent('DLQ')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Test DLQ Retry
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: In-App Notifications Feed */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col h-[460px]">
              <div className="p-3.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <div className="relative">
                    <Bell className="w-4 h-4 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="font-semibold text-white">In-App Notification Feed</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                    {unreadCount} unread
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-all ${
                      n.isRead
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                        : 'bg-slate-950 border-indigo-500/30 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-200">{n.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                      <span>Channel: {n.channel}</span>
                      <span>•</span>
                      <span>Type: {n.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: RabbitMQ AMQP Broker Stream */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[460px]">
              <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>RabbitMQ Broker Activity — finwise.events</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono">AMQP 0-9-1</span>
              </div>

              <div className="p-4 font-mono text-xs text-slate-300 space-y-2 overflow-y-auto flex-1">
                {amqpLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.includes('DEAD_LETTER')
                        ? 'text-rose-400 font-bold'
                        : log.includes('RETRY')
                        ? 'text-amber-400'
                        : log.includes('CONSUMER')
                        ? 'text-emerald-400'
                        : log.includes('PUBLISH')
                        ? 'text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Clustered Quartz Jobs */}
      {activeTab === 'quartz-jobs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Clustered Quartz Scheduler Dashboard
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Database-backed job store (`qrtz_*` tables) with multi-node locking, automatic failover, and miss-fire handling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">BudgetMonitoringJob</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  STATE: NORMAL
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-sans">
                Evaluates active user budgets every 6 hours, detecting 80% thresholds and 100% breaches.
              </div>
              <div className="space-y-1 text-slate-300 text-[11px] pt-2 border-t border-slate-800">
                <div>Cron Expression: <span className="text-indigo-400">0 0 */6 * * ?</span></div>
                <div>Job Group: <span className="text-slate-400">FINANCIAL_JOBS</span></div>
                <div>Assigned Node: <span className="text-emerald-400">finwise-worker-cluster-1</span></div>
                <div>Next Fire Time: <span className="text-amber-400">Today at 12:00:00 UTC</span></div>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">DailyDigestJob</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                  STATE: SCHEDULED
                </span>
              </div>
              <div className="text-slate-400 text-[11px] font-sans">
                Compiles daily financial snapshot and publishes event to RabbitMQ for email delivery.
              </div>
              <div className="space-y-1 text-slate-300 text-[11px] pt-2 border-t border-slate-800">
                <div>Cron Expression: <span className="text-indigo-400">0 0 20 * * ?</span></div>
                <div>Job Group: <span className="text-slate-400">FINANCIAL_JOBS</span></div>
                <div>Assigned Node: <span className="text-emerald-400">finwise-worker-cluster-2</span></div>
                <div>Next Fire Time: <span className="text-amber-400">Today at 20:00:00 Local</span></div>
              </div>
            </div>
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
