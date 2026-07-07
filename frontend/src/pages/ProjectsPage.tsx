import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project, type ProjectStatus } from '../lib/projectApi';
import { MiniHealthGauge } from '../components/MiniHealthGauge';

const statusColors: Record<ProjectStatus, { bg: string; text: string; label: string }> = {
  planning: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Planning' },
  active: { bg: 'bg-violet-100 dark:bg-violet-900/20', text: 'text-violet-750 dark:text-violet-400', label: 'Active' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Paused' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Archived' },
};

const healthColors: Record<string, string> = {
  excellent: 'text-emerald-600',
  good: 'text-violet-600 dark:text-violet-400',
  at_risk: 'text-amber-600',
  critical: 'text-red-600',
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const limit = 12;

  useEffect(() => {
    if (!accessToken) return;

    setLoading(true);
    setError('');

    projectAPI
      .listProjects(accessToken, {
        page,
        limit,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      })
      .then((data) => {
        setProjects(data.projects);
        setTotal(data.total);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
      })
      .finally(() => setLoading(false));
  }, [accessToken, page, search, statusFilter]);

  const handleDeleteProject = async (projectId: string) => {
    if (!accessToken) return;

    try {
      await projectAPI.deleteProject(accessToken, projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Projects</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">Manage and track all your active workspaces.</p>
          </div>

          {user?.role === 'manager' && (
            <button
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700"
              onClick={() => navigate('/projects/new')}
              type="button"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-4 md:flex-row md:items-center shadow-subtle">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none transition focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-violet-500"
              placeholder="Search workspaces..."
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="relative">
            <select
              className="w-full md:w-48 appearance-none rounded-xl border border-slate-200 dark:border-slate-750 bg-slate-50 dark:bg-slate-800/50 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none transition focus:border-violet-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-violet-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ProjectStatus | 'all');
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            initial={{ opacity: 0, y: -6 }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-pulse-primary" />
          </div>
        )}

        {/* Projects Grid */}
        {!loading && projects.length > 0 && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 10 }}
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                className="group flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-800/70 p-6 transition-all hover:border-violet-300 dark:hover:border-violet-750 shadow-subtle hover:shadow-md"
                whileHover={{ y: -4 }}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100">{project.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {project.description || 'No description'}
                    </p>
                  </div>

                  {user?.role === 'manager' && (
                    <div className="relative ml-2">
                      <button
                        className="opacity-0 transition-opacity group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        onClick={() => setDeleteConfirm(deleteConfirm === project.id ? null : project.id)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 dark:text-slate-500 transition hover:text-rose-600 dark:hover:text-rose-400" />
                      </button>

                      {deleteConfirm === project.id && (
                        <div className="absolute right-0 top-10 z-10 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
                          <p className="px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                            Delete project?
                          </p>
                          <div className="flex border-t border-slate-200 dark:border-slate-700">
                            <button
                              className="flex-1 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              onClick={() => setDeleteConfirm(null)}
                              type="button"
                            >
                              Cancel
                            </button>
                            <div className="w-px bg-slate-200 dark:bg-slate-700" />
                            <button
                              className="flex-1 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              onClick={() => handleDeleteProject(project.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-6 inline-block">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold tracking-wide uppercase border ${
                      project.status === 'planning' ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' :
                      project.status === 'active' ? 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20' :
                      project.status === 'paused' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                      project.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                      'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                    }`}
                  >
                    {statusColors[project.status].label}
                  </span>
                </div>

                <div className="mt-auto">
                  {/* Progress */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                      <span>PROGRESS</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800/50 overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                      <motion.div
                        animate={{ width: `${project.progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                        initial={{ width: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Health Score & Dates */}
                  <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Health Score</span>
                      <MiniHealthGauge score={project.healthScore} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Timeline</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {new Date(project.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(project.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <button
                    className="group/btn mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 hover:border-transparent dark:hover:border-transparent"
                    onClick={() => navigate(`/projects/${project.id}`)}
                    type="button"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 py-16 text-center shadow-subtle"
            initial={{ opacity: 0, y: 10 }}
          >
            <FolderKanban className="mx-auto h-16 w-16 text-slate-300 dark:text-slate-600 mb-6" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active workspaces</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {search || statusFilter !== 'all'
                ? 'We couldn\'t find any projects matching your current filters. Try adjusting them.'
                : user?.role === 'manager'
                  ? 'Launch your first client portal to start tracking milestones and approvals.'
                  : 'You haven\'t been assigned to any project workspaces yet.'}
            </p>
            {user?.role === 'manager' && (
              <button
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700"
                onClick={() => navigate('/projects/new')}
                type="button"
              >
                <Plus className="h-5 w-5" />
                Create New Project
              </button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={page === 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              type="button"
            >
              Previous
            </button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${
                    p === page
                      ? 'bg-violet-600 text-white border-transparent'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => setPage(p)}
                  type="button"
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={page === pages}
              onClick={() => setPage(Math.min(pages, page + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        )}
    </div>
  );
}
