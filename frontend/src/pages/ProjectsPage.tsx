import { motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Command,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project, type ProjectStatus } from '../lib/projectApi';

const statusColors: Record<ProjectStatus, { bg: string; text: string; label: string }> = {
  planning: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Planning' },
  active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Paused' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Archived' },
};

const healthColors: Record<string, string> = {
  excellent: 'text-emerald-600',
  good: 'text-blue-600',
  at_risk: 'text-amber-600',
  critical: 'text-red-600',
};

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user, logout, accessToken } = useAuth();
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
  const firstName = user?.name.split(' ')[0] ?? 'Manager';

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
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-pulse-text"
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
        {/* Page Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="mt-1 text-slate-600">Manage and track all your projects</p>
          </div>

          {user?.role === 'manager' && (
            <button
              className="flex items-center gap-2 rounded-lg bg-pulse-primary px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
              onClick={() => navigate('/projects/new')}
              type="button"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              placeholder="Search projects..."
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
              className="rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ProjectStatus | 'all');
                setPage(1);
              }}
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:shadow-lg"
                whileHover={{ y: -4 }}
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="truncate text-lg font-semibold">{project.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {project.description || 'No description'}
                    </p>
                  </div>

                  {user?.role === 'manager' && (
                    <div className="relative">
                      <button
                        className="opacity-0 transition group-hover:opacity-100"
                        onClick={() => setDeleteConfirm(deleteConfirm === project.id ? null : project.id)}
                        title="Delete"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 text-slate-400 transition hover:text-red-600" />
                      </button>

                      {deleteConfirm === project.id && (
                        <div className="absolute right-0 top-6 z-10 rounded-lg border border-slate-200 bg-white shadow-lg">
                          <p className="whitespace-nowrap px-3 py-2 text-xs text-slate-600">
                            Delete project?
                          </p>
                          <div className="flex gap-2 border-t border-slate-200 p-2">
                            <button
                              className="rounded px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                              onClick={() => handleDeleteProject(project.id)}
                              type="button"
                            >
                              Delete
                            </button>
                            <button
                              className="rounded px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                              onClick={() => setDeleteConfirm(null)}
                              type="button"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mb-4 inline-block">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusColors[project.status].bg
                    } ${statusColors[project.status].text}`}
                  >
                    {statusColors[project.status].label}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Progress</span>
                    <span className="text-slate-600">{project.progress}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <motion.div
                      animate={{ width: `${project.progress}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-pulse-primary to-blue-600"
                      initial={{ width: 0 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>

                {/* Health Score */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Health</span>
                  <span className={`text-sm font-semibold ${healthColors[project.healthStatus]}`}>
                    {project.healthScore}%
                  </span>
                </div>

                {/* Dates */}
                <div className="mb-4 space-y-1 text-xs text-slate-600">
                  <p>Start: {new Date(project.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(project.endDate).toLocaleDateString()}</p>
                </div>

                {/* View Button */}
                <button
                  className="group/btn mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 py-2 font-semibold text-slate-700 transition hover:bg-pulse-primary hover:text-white"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  type="button"
                >
                  View Details
                  <ChevronRight className="h-4 w-4 transition group-hover/btn:translate-x-0.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center"
            initial={{ opacity: 0, y: 10 }}
          >
            <FolderKanban className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-semibold text-slate-700">No projects yet</h3>
            <p className="mt-1 text-slate-600">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : user?.role === 'manager'
                  ? 'Create your first project to get started'
                  : 'No projects assigned to you yet'}
            </p>
            {user?.role === 'manager' && (
              <button
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-pulse-primary px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                onClick={() => navigate('/projects/new')}
                type="button"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(Math.max(1, page - 1))}
              type="button"
            >
              Previous
            </button>

            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  p === page
                    ? 'bg-pulse-primary text-white'
                    : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                onClick={() => setPage(p)}
                type="button"
              >
                {p}
              </button>
            ))}

            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={page === pages}
              onClick={() => setPage(Math.min(pages, page + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
