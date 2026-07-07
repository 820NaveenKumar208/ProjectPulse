import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardAPI, type ManagerDashboardData } from '../../lib/dashboardApi';
import { KPICard } from '../../components/KPICard';
import { HealthScoreWidget } from '../../components/HealthScoreWidget';
import { MiniHealthGauge } from '../../components/MiniHealthGauge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  Activity,
  Plus,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function ManagerDashboard() {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    dashboardAPI
      .getDashboardData(accessToken)
      .then((res) => {
        if (res.role === 'manager') {
          setData(res);
          setError(null);
        } else {
          setError('Invalid dashboard role data.');
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch dashboard data. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]);

  const firstName = user?.name.split(' ')[0] ?? 'Manager';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
        <LoadingState type="cards" rows={3} />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
          <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <FolderKanban className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-sm font-semibold text-red-800">Error Loading Dashboard</h3>
        <p className="mt-2 text-xs text-red-600">{error || 'An unexpected error occurred'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, upcomingDeadlines, recentActivity, projects } = data;

  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-label="Dashboard greeting">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Overview Dashboard</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor client visibility, pending sign-offs, and track overall portfolio delivery.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-violet-750 dark:hover:bg-violet-700"
          onClick={() => navigate('/projects/new')}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="KPIs">
        <KPICard
          label="Active Projects"
          value={stats.activeProjects}
          icon={FolderKanban}
          description={`${stats.completedProjects} projects completed`}
          onClick={() => navigate('/projects')}
          index={0}
          variant="purple"
        />
        <KPICard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          icon={CheckSquare}
          description="Awaiting client sign-off"
          onClick={() => navigate('/approvals')}
          index={1}
          variant="teal"
        />
        <KPICard
          label="Portfolio Health"
          value={`${stats.portfolioHealth}%`}
          icon={Heart}
          description="Average project health score"
          index={2}
          variant="emerald"
        />
        <KPICard
          label="Upcoming Milestones"
          value={upcomingDeadlines.length}
          icon={Clock}
          description="Due within next 14 days"
          onClick={() => navigate('/milestones')}
          index={3}
          variant="amber"
        />
      </section>

      {/* Visual health score if active projects exist */}
      {projects.length > 0 && (
        <section aria-label="Portfolio Health Overview">
          <HealthScoreWidget score={stats.portfolioHealth} size="lg" />
        </section>
      )}

      {/* Grid of Projects & Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Projects List */}
        <section className="lg:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Portfolio</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Status of client-facing project environments.</p>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-0.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {projects.length === 0 ? (
                <EmptyState
                  title="No active projects"
                  description="Begin by launching a new client portal workspace to track progress."
                  icon={FolderKanban}
                  action={{
                    label: 'Create Project',
                    onClick: () => navigate('/projects/new'),
                  }}
                />
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-violet-200 dark:hover:border-violet-800/50 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{project.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Ends {new Date(project.endDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <MiniHealthGauge score={project.healthScore} />

                      {/* Progress bar */}
                      <div className="w-24 sm:w-32">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                          <span>PROGRESS</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-300/20 dark:border-slate-800/50">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500 ease-out"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Deadlines & Activity sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Deadlines</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Milestones due in the next 14 days.</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <Clock className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No deadlines in the next 2 weeks.
                  </div>
                ) : (
                  upcomingDeadlines.map((milestone) => (
                    <div
                      key={milestone.id}
                      onClick={() => navigate(`/projects/${milestone.projectId}`)}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm cursor-pointer transition flex items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{milestone.title}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Due {new Date(milestone.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="shrink-0 inline-flex items-center rounded-md bg-amber-50 dark:bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase tracking-wide">
                        {milestone.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Recent client-visible activity */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Client Visibility Stream</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recent updates visible to clients.</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 space-y-4 max-h-[260px] overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {recentActivity.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No recent visibility updates.
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-violet-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-violet-500/30 z-10" />
                      
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{activity.title}</p>
                          <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                            {new Date(activity.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{activity.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
