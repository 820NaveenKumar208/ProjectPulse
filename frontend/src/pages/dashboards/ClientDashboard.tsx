import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardAPI, type ClientDashboardData } from '../../lib/dashboardApi';
import { KPICard } from '../../components/KPICard';
import { MiniHealthGauge } from '../../components/MiniHealthGauge';
import { LoadingState } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';
import {
  FolderKanban,
  CheckSquare,
  Activity,
  Heart,
  ChevronRight,
  FileText,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function ClientDashboard() {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setIsLoading(true);
    dashboardAPI
      .getDashboardData(accessToken)
      .then((res) => {
        if (res.role === 'client') {
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

  const firstName = user?.name.split(' ')[0] ?? 'Client';

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

  const { stats, pendingApprovals, recentActivity, projects } = data;

  return (
    <div className="space-y-8">
      {/* Welcome & Portal Title */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Secure Client Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Transparent, real-time oversight of your active projects and milestones.
        </p>
      </div>

      {/* Stats Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="KPIs">
        <KPICard
          label="Assigned Projects"
          value={stats.assignedProjects}
          icon={FolderKanban}
          description="Workspaces in active delivery"
          onClick={() => navigate('/projects')}
          index={0}
          variant="purple"
        />
        <KPICard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          icon={CheckSquare}
          description={stats.pendingApprovals > 0 ? 'Action required from you' : 'All caught up!'}
          onClick={() => navigate('/approvals')}
          index={1}
          variant="teal"
        />
        <KPICard
          label="Overall Delivery Health"
          value={`${stats.overallHealth}%`}
          icon={Heart}
          description="Average health of active items"
          index={2}
          variant="emerald"
        />
        <KPICard
          label="Available Reports"
          value={stats.availableReports}
          icon={FileText}
          description="Downloadable status reports"
          onClick={() => navigate('/reports')}
          index={3}
          variant="amber"
        />
      </section>

      {/* Delivery Health Alert banner if warning */}
      {stats.overallHealth < 60 && (
        <div className="flex items-center gap-3 rounded-xl border border-[#f59e0b] bg-[#2d1f00] p-4 text-xs font-medium text-[#fbbf24]">
          <AlertCircle className="h-5 w-5 shrink-0 text-[#f59e0b]" />
          <span>
            Some projects in your portfolio currently report "At Risk" health status. Please inspect details or contact your project manager.
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project progress cards */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Projects</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select a workspace to view detailed timelines.</p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-0.5 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:underline"
            >
              View All Workspaces
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {projects.length === 0 ? (
              <div className="col-span-2">
                <EmptyState
                  title="No assigned projects"
                  description="Your agency hasn't invited you to a project workspace yet."
                  icon={FolderKanban}
                />
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle hover:border-violet-200 dark:hover:border-violet-800/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-48"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">{project.name}</h4>
                      <MiniHealthGauge score={project.healthScore} />
                    </div>
                    {project.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      <span>COMPLETION PROGRESS</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/20 dark:border-slate-700/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500 ease-out"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar: Pending approvals & Updates */}
        <div className="space-y-6">
          {/* Action Required: Pending Approvals */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Sign-Off Requests</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Awaiting your feedback and approval.</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <CheckSquare className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {pendingApprovals.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <ThumbsUp className="mx-auto h-8 w-8 text-emerald-400 dark:text-emerald-500" />
                    <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">All sign-offs completed</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Nothing is waiting on your review.</p>
                  </div>
                ) : (
                  pendingApprovals.map((approval) => (
                    <motion.div
                      key={approval.id}
                      onClick={() => navigate(`/projects/${approval.projectId}?tab=milestones`)}
                      whileHover={{ scale: 1.01 }}
                      className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/10 hover:bg-amber-50 dark:hover:bg-amber-500/20 cursor-pointer transition flex items-center justify-between gap-3 text-left shadow-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                          Awaiting Approval
                        </span>
                        <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate mt-0.5">
                          {approval.milestoneTitle}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Requested {new Date(approval.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Activity Logs */}
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Activity Stream</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Recent notifications across your workspaces.</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400">
                  <Activity className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 space-y-4 max-h-[260px] overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                {recentActivity.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No recent activity.
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
