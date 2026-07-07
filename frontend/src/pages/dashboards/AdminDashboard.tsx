import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminAPI, type AdminStats, type AdminActivity } from '../../lib/adminApi';
import { KPICard } from '../../components/KPICard';
import { LoadingState } from '../../components/LoadingState';
import { RecentActivityTimeline } from '../../components/RecentActivityTimeline';
import { ApprovalWidget } from '../../components/ApprovalWidget';
import { HealthScoreWidget } from '../../components/HealthScoreWidget';
import {
  Building2,
  FolderKanban,
  Users,
  CheckSquare,
  Activity,
  Shield,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    Promise.all([
      adminAPI.getStats(accessToken),
      adminAPI.getActivity(accessToken, 10),
    ])
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load platform stats. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <LoadingState type="cards" rows={3} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-900/10 p-6 text-center shadow-sm">
        <Shield className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-sm font-semibold text-rose-800 dark:text-rose-400">Error Loading Dashboard</h3>
        <p className="mt-2 text-xs text-rose-600 dark:text-rose-500">{error || 'An unexpected error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-500 mb-1">Platform Overview</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            System Administration
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Monitor organizations, active projects, user growth, and system-wide visibility metrics.
          </p>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 shadow-subtle flex flex-wrap gap-2 items-center lg:justify-end shrink-0 max-w-lg">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-full lg:w-auto lg:mr-2">Quick Actions:</span>
          <button
            onClick={() => navigate('/users?tab=organizations&new=true')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-850 px-3.5 py-2 text-xs font-bold text-violet-650 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-[0_0_12px_rgba(124,58,237,0.15)] dark:hover:shadow-[0_0_12px_rgba(124,58,237,0.25)] hover:text-violet-750 dark:hover:text-violet-300 transition-all active:scale-95"
            type="button"
          >
            + Create Organization
          </button>
          <button
            onClick={() => navigate('/users?new=true&role=manager')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-850 px-3.5 py-2 text-xs font-bold text-violet-650 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-[0_0_12px_rgba(124,58,237,0.15)] dark:hover:shadow-[0_0_12px_rgba(124,58,237,0.25)] hover:text-violet-750 dark:hover:text-violet-300 transition-all active:scale-95"
            type="button"
          >
            + Add Manager
          </button>
          <button
            onClick={() => navigate('/users?new=true&role=client')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-850 px-3.5 py-2 text-xs font-bold text-violet-650 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-[0_0_12px_rgba(124,58,237,0.15)] dark:hover:shadow-[0_0_12px_rgba(124,58,237,0.25)] hover:text-violet-750 dark:hover:text-violet-300 transition-all active:scale-95"
            type="button"
          >
            + Create Client
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-label="KPIs">
        <KPICard
          label="Organizations"
          value={stats.totalOrganizations}
          icon={Building2}
          description="Registered client structures"
          onClick={() => navigate('/users?tab=organizations')}
          index={0}
          trend={{ value: '+12% this month', type: 'positive' }}
          variant="amber"
        />
        <KPICard
          label="Active Projects"
          value={stats.activeProjects}
          icon={FolderKanban}
          description={`${stats.completedProjects} projects completed`}
          onClick={() => navigate('/projects')}
          index={1}
          trend={{ value: 'Stable', type: 'neutral' }}
          variant="purple"
        />
        <KPICard
          label="Platform Users"
          value={stats.totalManagers + stats.totalClients}
          icon={Users}
          description={`${stats.totalManagers} Managers · ${stats.totalClients} Clients`}
          onClick={() => navigate('/users')}
          index={2}
          trend={{ value: '+24 new', type: 'positive' }}
          variant="emerald"
        />
        <KPICard
          label="Awaiting Approval"
          value={stats.pendingApprovals}
          icon={CheckSquare}
          description="Milestones pending review"
          onClick={() => navigate('/approvals')}
          index={3}
          trend={{ value: 'Action Required', type: 'warning' }}
          variant="teal"
        />
      </section>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Platform metrics & health */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Visibility Metrics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">System usage breakdown and status.</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-6">
              <HealthScoreWidget score={92} size="lg" showLabel={true} />
              
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/30 p-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Milestone Flow</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalMilestones}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Total defined milestones</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Steady execution across portfolios</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/30 p-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reports Dispatched</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalReports}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Shared status notifications</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400">
                    <Activity className="h-3.5 w-3.5" />
                    <span>Consistent client updates generated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Admin actions require security keys.</span>
            <Link
              to="/users"
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline"
            >
              Configure User Permissions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Recent Platform Activity */}
        <div className="flex flex-col gap-6">
          <RecentActivityTimeline />
        </div>
      </div>
    </div>
  );
}
