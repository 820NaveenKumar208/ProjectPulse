import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Calendar,
  ChevronRight,
  Command,
  Edit2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Trash2,
  Archive,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project } from '../lib/projectApi';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Planning' },
  active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Paused' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Archived' },
};

const healthColors: Record<string, string> = {
  excellent: 'text-emerald-600 bg-emerald-50',
  good: 'text-blue-600 bg-blue-50',
  at_risk: 'text-amber-600 bg-amber-50',
  critical: 'text-red-600 bg-red-50',
};

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, logout, accessToken } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!accessToken || !projectId) return;

    setLoading(true);
    setError('');

    projectAPI
      .getProject(accessToken, projectId)
      .then(setProject)
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

  const isManager = user?.role === 'manager' && user?.id === project?.managerId;

  return (
    <main className="min-h-screen bg-pulse-background text-pulse-text">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <a className="flex items-center gap-2 font-semibold" href="/app">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-text text-white">
              <Command className="h-4 w-4" />
            </span>
            <span>ProjectPulse</span>
          </a>

          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <a
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-pulse-text"
              href="/app"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </a>
            <a
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-pulse-text"
              href="/projects"
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </a>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-pulse-text"
              title="Notifications"
              type="button"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-pulse-text"
              onClick={() => void logout()}
              title="Logout"
              type="button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-700"
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
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold">{project.name}</h1>
                  <p className="mt-2 text-slate-600">{project.description}</p>

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

                {isManager && (
                  <div className="flex gap-2">
                    <button
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-pulse-text"
                      onClick={() => navigate(`/projects/${project.id}/edit`)}
                      title="Edit"
                      type="button"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>

                    <button
                      className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-amber-600"
                      onClick={handleArchive}
                      title="Archive"
                      type="button"
                    >
                      <Archive className="h-5 w-5" />
                    </button>

                    <div className="relative">
                      <button
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                        onClick={() => setDeleteConfirm(!deleteConfirm)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>

                      {deleteConfirm && (
                        <div className="absolute right-0 top-12 z-10 rounded-lg border border-slate-200 bg-white shadow-lg">
                          <p className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                            Delete this project?
                          </p>
                          <div className="flex gap-2 border-t border-slate-200 p-2">
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

            {/* Metrics Grid */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Progress Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-medium text-slate-600">Progress</h3>
                <div className="mt-4">
                  <div className="text-3xl font-bold">{project.progress}%</div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <motion.div
                      animate={{ width: `${project.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-pulse-primary to-blue-600"
                      initial={{ width: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Health Score Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-medium text-slate-600">Health Score</h3>
                <div className="mt-4">
                  <div className={`text-3xl font-bold ${healthColors[project.healthStatus].split(' ')[0]}`}>
                    {project.healthScore}%
                  </div>
                  <p className="mt-2 text-sm text-slate-600 capitalize">{project.healthStatus}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-medium text-slate-600">Duration</h3>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-700">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="text-sm font-medium text-slate-600">Client</h3>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700">{project.clientId}</p>
                  <p className="mt-1 text-xs text-slate-500">Client ID</p>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold">Timeline</h2>
              <p className="mt-2 text-slate-600">Project timeline visualization coming soon</p>
            </div>

            {/* Milestones Section */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Milestones</h2>
                {isManager && (
                  <button
                    className="rounded-lg bg-pulse-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    type="button"
                  >
                    Add Milestone
                  </button>
                )}
              </div>
              <p className="mt-2 text-slate-600">Milestones tracking coming soon</p>
            </div>

            {/* Activity Feed */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <h2 className="text-xl font-bold">Activity Feed</h2>
              <p className="mt-2 text-slate-600">Recent activities will appear here</p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
