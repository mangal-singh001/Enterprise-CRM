import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/api';
import { 
  GraduationCap, 
  Activity, 
  CreditCard, 
  Mail, 
  Globe, 
  TrendingUp, 
  ShieldCheck, 
  History, 
  ArrowRight,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';

export const ExecutiveDashboard = () => {
  const { user, products, setActiveProduct, setActiveEntity } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      setRefreshing(true);
      const data = await analyticsService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error("Error loading executive dashboard metrics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 text-white p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-brand-400 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Unified Enterprise CRM Operations</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Welcome back, {user?.name || 'Operations Lead'}
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Cross-product operational dashboard. Access EduPulse and CloudMetric business entities, manage plans, message templates, and client API quotas from a single unified workspace.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchSummary}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/15 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync Metrics</span>
            </button>
          </div>
        </div>
        {/* Decorative ambient background glows */}
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Cross Product Executive Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: EduPulse Plans */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4 hover:border-brand-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200 dark:border-brand-800">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              EduPulse
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : summary?.metrics?.edupulse?.total_plans ?? 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Subscription Plans</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Pricing Tiers</span>
            <button 
              onClick={() => { setActiveProduct('edupulse'); setActiveEntity('subscription_plans'); }}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 2: EduPulse Message Templates */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4 hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <Mail className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              EduPulse
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : summary?.metrics?.edupulse?.total_templates ?? 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Notification Templates</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Email, SMS & Push</span>
            <button 
              onClick={() => { setActiveProduct('edupulse'); setActiveEntity('message_templates'); }}
              className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 3: CloudMetric Client Sites */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4 hover:border-cyan-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              CloudMetric
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {loading ? "..." : summary?.metrics?.cloudmetric?.total_sites ?? 0}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitored Client Sites</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-emerald-500 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{summary?.metrics?.cloudmetric?.active_sites ?? 0} Active</span>
            </span>
            <button 
              onClick={() => { setActiveProduct('cloudmetric'); setActiveEntity('client_sites'); }}
              className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center space-x-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: Total Daily Request Quota */}
        <div className="glass-panel p-6 rounded-2xl shadow-sm space-y-4 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
              CloudMetric
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              {loading ? "..." : (summary?.metrics?.cloudmetric?.total_daily_quota ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Daily API Quota Allocated</p>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Quota Bandwidth</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Healthy</span>
          </div>
        </div>
      </div>

      {/* Product Workspaces Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <span>Internal SaaS Product Workspaces</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EduPulse Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-5 border-l-4 border-l-brand-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">EduPulse Workspace</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">EdTech Institution Management & Transactional Messaging</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Operational
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Manage subscription tiers, feature flags, monthly/yearly billing cycles, and notification template configs (Email HTML & SMS).
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => { setActiveProduct('edupulse'); setActiveEntity('subscription_plans'); }}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md transition-all flex items-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Subscription Plans</span>
              </button>
              <button
                onClick={() => { setActiveProduct('edupulse'); setActiveEntity('message_templates'); }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all flex items-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Message Templates</span>
              </button>
            </div>
          </div>

          {/* CloudMetric Card */}
          <div className="glass-panel p-6 rounded-2xl space-y-5 border-l-4 border-l-cyan-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">CloudMetric Workspace</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Cloud Performance & API Request Monitoring</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Operational
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              Provision domain white-lists, manage live API key credentials, toggle maintenance modes, and adjust daily request quotas.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => { setActiveProduct('cloudmetric'); setActiveEntity('client_sites'); }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-md transition-all flex items-center space-x-2"
              >
                <Globe className="w-4 h-4" />
                <span>Manage Client Sites</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time System Governance Audit Feed */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-brand-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Audit & Governance Activity</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Live Sync</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {summary?.recent_activities?.length > 0 ? (
            summary.recent_activities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    act.action === 'CREATE' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' :
                    act.action === 'UPDATE' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' :
                    'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                  }`}>
                    {act.action}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase font-mono">[{act.product_id}]</span>
                    <span className="text-slate-600 dark:text-slate-300 ml-1.5">{act.entity_id} (ID: {act.record_id})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-slate-500 font-mono text-[11px]">
                  <span>by {act.performed_by}</span>
                  <span>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No recent audit activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
