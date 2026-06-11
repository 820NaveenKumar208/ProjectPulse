import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  FolderKanban,
  Plus,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { approvalAPI, type PendingApprovalItem } from '../lib/approvalApi';
import { Header } from '../components/Header';
import { CompletionTrendChart } from '../features/manager-dashboard/CompletionTrendChart';
import { MetricCard } from '../features/manager-dashboard/MetricCard';
import { ProjectProgressChart } from '../features/manager-dashboard/ProjectProgressChart';
import {
  approvalQueue,
  dashboardMetrics,
  recentActivity,
  upcomingDeadlines,
  type MetricTone,
  type ProjectHealth,
} from '../features/manager-dashboard/dashboardData';

const healthStyles: Record<ProjectHealth, string> = {
  'On track': 'bg-emerald-50 text-emerald-700',
  Watch: 'bg-amber-50 text-amber-700',
  'At risk': 'bg-red-50 text-red-700',
};

const activityDotStyles: Record<MetricTone, string> = {
  blue: 'bg-pulse-primary',
  green: 'bg-pulse-success',
  amber: 'bg-pulse-warning',
  red: 'bg-pulse-danger',
};

export function DashboardPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name.split(' ')[0] ?? 'there';
  const isClient = user?.role === 'client';

  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>([]);
  const [approvalsLoading, setApprovalsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    setApprovalsLoading(true);
    approvalAPI
      .getPendingApprovals(accessToken)
      .then((res) => setPendingApprovals(res.approvals))
      .catch(() => setPendingApprovals([]))
      .finally(() => setApprovalsLoading(false));
  }, [accessToken]);

  return (
    <main className="min-h-screen bg-pulse-background text-pulse-text">
      <Header />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Client-specific view */}
        {isClient ? (
          <div>
            <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
                  Welcome back, {firstName}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  {pendingApprovals.length > 0
                    ? `You have ${pendingApprovals.length} milestone${pendingApprovals.length > 1 ? 's' : ''} awaiting your review.`
                    : "No pending approvals. You're all caught up!"}
                </p>
              </div>
              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                onClick={() => navigate('/projects')}
                type="button"
              >
                <FolderKanban className="h-4 w-4" />
                View Projects
              </button>
            </section>

            {/* Pending Approvals — Client */}
            <section className="mt-8">
              <p className="text-sm font-semibold text-pulse-text">Pending approvals</p>
              <p className="mt-1 text-sm text-slate-500">Milestones waiting on your review</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {approvalsLoading ? (
                  <div className="col-span-2 flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-pulse-primary" />
                  </div>
                ) : pendingApprovals.length === 0 ? (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                    <p className="mt-3 text-sm font-medium text-slate-600">All caught up!</p>
                    <p className="mt-1 text-xs text-slate-400">No milestones awaiting approval.</p>
                  </div>
                ) : (
                  pendingApprovals.map((item) => (
                    <motion.button
                      key={item.approval.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left shadow-sm transition hover:border-amber-300 hover:shadow"
                      onClick={() =>
                        item.milestone
                          ? navigate(
                              `/projects/${item.milestone.projectId}/milestones/${item.milestone.id}`,
                            )
                          : undefined
                      }
                      type="button"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                          Awaiting Review
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {item.milestone?.title ?? 'Milestone'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Requested {new Date(item.approval.requestedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                          <XCircle className="h-3 w-3" /> Request Changes
                        </span>
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          /* Manager view */
          <div>
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal sm:text-4xl">
              Good morning, {firstName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Your portfolio is moving well. {pendingApprovals.length > 0 ? `${pendingApprovals.length} approval${pendingApprovals.length > 1 ? 's' : ''} and ` : ''}one deadline need your attention.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-pulse-text px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            onClick={() => navigate('/projects/new')}
            type="button"
          >
            <Plus className="h-4 w-4" />
            New project
          </button>
        </section>

        <section
          className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Portfolio summary"
        >
          {dashboardMetrics.map((metric, index) => (
            <MetricCard index={index} key={metric.label} {...metric} />
          ))}
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.12, duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-pulse-text">Project progress</p>
                <p className="mt-1 text-sm text-slate-500">
                  Active portfolio completion by project
                </p>
              </div>
              <button
                className="inline-flex items-center gap-1 text-sm font-semibold text-pulse-primary"
                type="button"
              >
                View projects
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <div className="min-w-[540px]">
                <ProjectProgressChart />
              </div>
            </div>
          </motion.article>

          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6"
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.17, duration: 0.4, ease: 'easeOut' }}
          >
            <p className="text-sm font-semibold text-pulse-text">Pending approvals</p>
            <p className="mt-1 text-sm text-slate-500">Items waiting on client review</p>

            <div className="mt-6 divide-y divide-slate-100">
              {approvalQueue.map((approval) => (
                <button
                  className="flex w-full items-start gap-3 py-4 text-left"
                  key={`${approval.project}-${approval.milestone}`}
                  type="button"
                >
                  <span
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      approval.status === 'Overdue' ? 'bg-pulse-danger' : 'bg-pulse-warning'
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-pulse-text">
                      {approval.milestone}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {approval.project} · {approval.client}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-xs font-semibold ${
                      approval.status === 'Overdue' ? 'text-pulse-danger' : 'text-slate-500'
                    }`}
                  >
                    {approval.age}
                  </span>
                </button>
              ))}
            </div>

            <button
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-pulse-primary"
              type="button"
            >
              Review approval queue
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.article>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-pulse-text">Completion trend</p>
                <p className="mt-1 text-sm text-slate-500">Delivered work compared with plan</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-pulse-primary" />
                  Completed
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  Planned
                </span>
              </div>
            </div>
            <div className="mt-6">
              <CompletionTrendChart />
            </div>
          </article>

          <article className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-pulse-text">Upcoming deadlines</p>
                <p className="mt-1 text-sm text-slate-500">Milestones due in the next seven days</p>
              </div>
              <button className="text-sm font-semibold text-pulse-primary" type="button">
                Calendar
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {upcomingDeadlines.map((deadline) => (
                <button
                  className="flex w-full items-center gap-4 rounded-lg border border-slate-100 px-3 py-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
                  key={`${deadline.date}-${deadline.project}`}
                  type="button"
                >
                  <span className="w-12 shrink-0 text-xs font-semibold text-slate-500">
                    {deadline.date}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-pulse-text">
                      {deadline.milestone}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {deadline.project}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${healthStyles[deadline.health]}`}
                  >
                    {deadline.health}
                  </span>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-pulse-text">Recent activity</p>
              <p className="mt-1 text-sm text-slate-500">
                Client-visible changes across your portfolio
              </p>
            </div>
            <button className="text-sm font-semibold text-pulse-primary" type="button">
              View all
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recentActivity.map((activity) => (
              <article
                className="flex items-start gap-3 rounded-lg border border-slate-200/80 bg-white p-4 shadow-sm"
                key={`${activity.title}-${activity.project}`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activityDotStyles[activity.tone]}`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-pulse-text">{activity.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {activity.project} · {activity.time}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
          </div>
        )}
      </div>
    </main>
  );
}
