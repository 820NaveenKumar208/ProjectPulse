import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Edit2,
  Trash2,
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project } from '../lib/projectApi';
import { milestoneAPI, type Milestone } from '../lib/milestoneApi';
import { approvalAPI, type ApprovalRecord } from '../lib/approvalApi';
import { MilestoneTimeline } from '../components/MilestoneTimeline';
import { ShareLinkManager } from '../components/ShareLinkManager';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-305', label: 'Planning' },
  active: { bg: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-750 dark:text-violet-400', label: 'Active' },
  paused: { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-400', label: 'Paused' },
  completed: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-400', label: 'Completed' },
  archived: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', label: 'Archived' },
};

const healthColors: Record<string, string> = {
  excellent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
  good: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
  at_risk: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
  critical: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
};

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, accessToken } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!accessToken || !projectId) return;

    setLoading(true);
    setError('');

    projectAPI
      .getProject(accessToken, projectId)
      .then((proj) => {
        setProject(proj);
        return milestoneAPI.listMilestones(accessToken, projectId);
      })
      .then((response) => {
        setMilestones(response.milestones);
        // Load approval history for each milestone to build activity feed
        return Promise.all(
          response.milestones.map((m) =>
            approvalAPI.getApprovalHistory(accessToken, m.id).catch(() => ({ records: [], total: 0 }))
          )
        );
      })
      .then((histories) => {
        const allRecords = histories.flatMap((h) => h.records);
        allRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApprovalHistory(allRecords);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      })
      .finally(() => setLoading(false));
  }, [accessToken, projectId]);

  const handleArchive = async () => {
    if (!accessToken || !projectId) return;

    try {
      const updated = await projectAPI.archiveProject(accessToken, projectId);
      setProject(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive project');
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !projectId) return;

    try {
      await projectAPI.deleteProject(accessToken, projectId);
      navigate('/projects', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleCompleteMilestone = async (milestone: Milestone) => {
    if (!accessToken) return;

    try {
      const updated = await milestoneAPI.completeMilestone(accessToken, milestone.id);
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestone.id ? updated : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete milestone');
    }
  };

  const handleDeleteMilestone = async (milestone: Milestone) => {
    if (!accessToken) return;

    try {
      await milestoneAPI.deleteMilestone(accessToken, milestone.id);
      setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete milestone');
    }
  };

  const isManager = user?.role === 'manager' && user?.id === project?.managerId;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.button
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-650 dark:text-slate-400 transition hover:bg-slate-105 hover:text-slate-700 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800"
        onClick={() => navigate('/projects')}
        type="button"
        whileHover={{ x: -4 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </motion.button>

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-pulse-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            initial={{ opacity: 0, y: -6 }}
          >
            {error}
          </motion.div>
        )}

        {/* Project Content */}
        {project && !loading && (
          <motion.div animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 10 }}>
            {/* Header Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">{project.description}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        statusColors[project.status].bg
                      } ${statusColors[project.status].text}`}
                    >
                      {statusColors[project.status].label}
                    </span>

                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${healthColors[project.healthStatus]}`}>
                      Health: {project.healthScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => navigate(`/projects/${project.id}/reports`)}
                    type="button"
                  >
                    <FileText className="h-4 w-4 text-cyan-500" />
                    AI Reports
                  </button>

                  {isManager && (
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-pulse-text dark:hover:text-white"
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                        title="Edit"
                        type="button"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>

                      <button
                        className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-600"
                        onClick={handleArchive}
                        title="Archive"
                        type="button"
                      >
                        <Archive className="h-5 w-5" />
                      </button>

                      <div className="relative">
                        <button
                          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-slate-500 dark:text-slate-400 transition hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600"
                          onClick={() => setDeleteConfirm(!deleteConfirm)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        {deleteConfirm && (
                          <div className="absolute right-0 top-12 z-10 rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 shadow-lg">
                            <p className="whitespace-nowrap px-4 py-3 text-sm text-slate-650 dark:text-slate-400">
                              Delete this project?
                            </p>
                            <div className="flex gap-2 border-t border-slate-200 dark:border-slate-800 p-2">
                              <button
                                className="rounded px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                onClick={handleDelete}
                                type="button"
                              >
                                Delete
                              </button>
                              <button
                                className="rounded px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                onClick={() => setDeleteConfirm(false)}
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Progress Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6">
                <h3 className="text-sm font-medium text-slate-550 dark:text-slate-400">Progress</h3>
                <div className="mt-4">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">{project.progress}%</div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      animate={{ width: `${project.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-pulse-primary to-cyan-500"
                      initial={{ width: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Health Score Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6">
                <h3 className="text-sm font-medium text-slate-550 dark:text-slate-400">Health Score</h3>
                <div className="mt-4">
                  <div className={`text-3xl font-bold ${healthColors[project.healthStatus].split(' ')[0]}`}>
                    {project.healthScore}%
                  </div>
                  <p className="mt-2 text-sm text-slate-650 dark:text-slate-400 capitalize">{project.healthStatus}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6">
                <h3 className="text-sm font-medium text-slate-550 dark:text-slate-400">Duration</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6">
                <h3 className="text-sm font-medium text-slate-550 dark:text-slate-400">Client</h3>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{project.clientId}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Client ID</p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Timeline</h2>
              {milestones.length === 0 ? (
                <p className="text-slate-550 dark:text-slate-400 text-sm font-medium">No timeline events yet.</p>
              ) : (
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 px-4 overflow-x-auto pb-4">
                  {/* Horizontal Line connecting items (only on md and up) */}
                  <div className="absolute left-10 right-10 top-[28px] hidden h-0.5 bg-slate-200 dark:bg-slate-800 md:block" />
                  
                  {[...milestones]
                    .sort((a, b) => a.order - b.order)
                    .map((m) => {
                      const isCompleted = m.status === 'completed';
                      const isReview = m.status === 'ready_for_approval';
                      const isInProgress = m.status === 'in_progress';
                      const isDelayed = m.status === 'delayed';

                      return (
                        <div key={m.id} className="relative z-10 flex flex-1 flex-row md:flex-col items-center gap-4 text-left md:text-center min-w-[200px] md:min-w-0">
                          {/* Circle badge */}
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 shadow-sm transition-all duration-300 ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-100 dark:border-emerald-950/30 text-white'
                                : isReview
                                ? 'bg-amber-500 border-amber-100 dark:border-amber-950/30 text-white animate-pulse'
                                : isInProgress
                                ? 'bg-violet-600 border-violet-100 dark:border-violet-950/30 text-white'
                                : isDelayed
                                ? 'bg-rose-500 border-rose-100 dark:border-rose-950/30 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : isReview ? (
                              <Clock className="h-5 w-5" />
                            ) : (
                              <span className="text-sm font-bold">{m.order}</span>
                            )}
                          </div>

                          {/* Title and date info */}
                          <div className="flex flex-col md:items-center">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">{m.title}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {new Date(m.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                            <span
                              className={`mt-1.5 inline-flex self-start md:self-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isCompleted
                                  ? 'bg-emerald-50 border border-emerald-200/50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                  : isReview
                                  ? 'bg-amber-50 border border-amber-200/50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                  : isInProgress
                                  ? 'bg-violet-55 border border-violet-200/50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
                                  : isDelayed
                                  ? 'bg-rose-50 border border-rose-200/50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              {m.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Milestones Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Milestones</h2>
                {isManager && (
                  <button
                    className="rounded-lg bg-pulse-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
                    onClick={() => navigate(`/projects/${project.id}/milestones/new`)}
                    type="button"
                  >
                    Add Milestone
                  </button>
                )}
              </div>
              <div className="mt-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-pulse-primary" />
                  </div>
                ) : milestones.length === 0 ? (
                  <p className="text-slate-600">No milestones yet. {isManager && 'Create one to get started!'}</p>
                ) : (
                  <MilestoneTimeline
                    milestones={milestones}
                    onComplete={handleCompleteMilestone}
                    onDelete={handleDeleteMilestone}
                    onEdit={(m) => navigate(`/projects/${project.id}/milestones/${m.id}`)}
                    isManager={isManager}
                  />
                )}
              </div>
            </div>

            {/* Activity Feed — Approval Events */}
            <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-8">
              <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Activity</h2>
              {approvalHistory.length === 0 ? (
                <p className="text-slate-500 text-sm">No approval activity yet.</p>
              ) : (
                <div className="relative space-y-4 pl-6">
                  <div className="absolute left-2 top-0 bottom-0 w-0.5 rounded-full bg-slate-100 dark:bg-slate-800" />
                  {approvalHistory.slice(0, 10).map((record) => {
                    const ms = milestones.find((m) => m.id === record.milestoneId);
                    const isPending = record.status === 'pending';
                    const isApproved = record.status === 'approved';
                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        <span
                          className={`absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ring-2 ${
                            isPending ? 'bg-amber-400 ring-amber-100 dark:ring-amber-950/20'
                            : isApproved ? 'bg-emerald-400 ring-emerald-100 dark:ring-emerald-950/20'
                            : 'bg-red-400 ring-red-100 dark:ring-red-950/20'
                          }`}
                        />
                        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isPending ? (
                              <Clock className="h-4 w-4 text-amber-500" />
                            ) : isApproved ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {isPending ? 'Approval Requested'
                                : isApproved ? 'Milestone Approved'
                                : 'Changes Requested'}
                            </span>
                            {ms && (
                              <button
                                className="ml-auto text-xs text-pulse-primary hover:underline"
                                onClick={() => navigate(`/projects/${project.id}/milestones/${ms.id}`)}
                                type="button"
                              >
                                {ms.title} →
                              </button>
                            )}
                          </div>
                          {record.comment && (
                            <p className="mt-1 text-xs text-slate-500">{record.comment}</p>
                          )}
                          <p className="mt-1 text-xs text-slate-400">
                            {new Date(record.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Share Link Manager — Manager only */}
            {isManager && (
              <div className="mb-8">
                <ShareLinkManager
                  project={project}
                  onProjectUpdate={(updated) => setProject(updated)}
                />
              </div>
            )}
          </motion.div>
        )}
    </div>
  );
}
