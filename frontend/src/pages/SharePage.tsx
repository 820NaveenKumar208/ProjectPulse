import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Command,
  Calendar,
  TrendingUp,
  Shield,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { shareAPI, type PublicProjectView, type PublicMilestone } from '../lib/shareApi';

const statusLabels: Record<string, string> = {
  planning: 'Planning',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

const statusColors: Record<string, { bg: string; text: string }> = {
  planning: { bg: 'bg-slate-100', text: 'text-slate-600' },
  active: { bg: 'bg-blue-100', text: 'text-blue-700' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

const healthConfig: Record<string, { label: string; color: string; ringColor: string; textColor: string }> = {
  excellent: {
    label: 'Excellent',
    color: 'from-emerald-400 to-emerald-600',
    ringColor: 'stroke-emerald-500',
    textColor: 'text-emerald-600',
  },
  good: {
    label: 'Good',
    color: 'from-blue-400 to-blue-600',
    ringColor: 'stroke-blue-500',
    textColor: 'text-blue-600',
  },
  at_risk: {
    label: 'At Risk',
    color: 'from-amber-400 to-amber-600',
    ringColor: 'stroke-amber-500',
    textColor: 'text-amber-600',
  },
  critical: {
    label: 'Critical',
    color: 'from-red-400 to-red-600',
    ringColor: 'stroke-red-500',
    textColor: 'text-red-600',
  },
};

const milestoneStatusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string; label: string }> = {
  not_started: { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-100', label: 'Not Started' },
  in_progress: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50', label: 'In Progress' },
  ready_for_approval: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Pending Review' },
  approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Approved' },
  changes_requested: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Changes Requested' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  delayed: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Delayed' },
};

function ProgressRing({ value, size = 120, strokeWidth = 10, health }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  health: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const cfg = healthConfig[health] ?? healthConfig.good;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={cfg.ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-2xl font-bold ${cfg.textColor}`}>{value}%</span>
        <span className="text-xs text-slate-500">progress</span>
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, index }: { milestone: PublicMilestone; index: number }) {
  const cfg = milestoneStatusConfig[milestone.status] ?? milestoneStatusConfig.not_started;
  const Icon = cfg.icon;
  const isCompleted = milestone.status === 'completed' || milestone.status === 'approved';
  const dueDate = new Date(milestone.dueDate);
  const isOverdue = dueDate < new Date() && !isCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="relative flex items-start gap-4 pb-6"
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ${cfg.bg}`}
        >
          <Icon className={`h-4 w-4 ${cfg.color}`} />
        </div>
      </div>

      <div className="flex-1 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className={`text-sm font-semibold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
              {milestone.title}
            </p>
            {milestone.description && (
              <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{milestone.description}</p>
            )}
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          {/* Progress bar */}
          <div className="flex flex-1 items-center gap-2 min-w-32">
            <div className="h-1.5 flex-1 rounded-full bg-slate-100">
              <motion.div
                className={`h-full rounded-full ${isCompleted ? 'bg-emerald-400' : 'bg-blue-400'}`}
                initial={{ width: 0 }}
                animate={{ width: `${milestone.completionPercentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.08 }}
              />
            </div>
            <span className="text-xs font-medium text-slate-500">{milestone.completionPercentage}%</span>
          </div>

          {/* Due date */}
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
            <Calendar className="h-3 w-3" />
            {isOverdue ? 'Overdue · ' : ''}{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SharePage() {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<PublicProjectView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    shareAPI
      .getPublicProject(token)
      .then((data) => setProject(data))
      .catch((err: any) => {
        const msg: string = err.message ?? '';
        if (msg.includes('expired')) {
          setError('This share link has expired. Please contact the project manager for an updated link.');
        } else if (msg.includes('not valid') || msg.includes('disabled') || msg.includes('404')) {
          setError('This share link is not valid or has been disabled.');
        } else {
          setError('Unable to load project. Please check the link and try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const completed = project?.milestones.filter((m) =>
    ['completed', 'approved'].includes(m.status),
  ).length ?? 0;

  const hCfg = healthConfig[project?.healthStatus ?? 'good'] ?? healthConfig.good;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Slim branding header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
              <Command className="h-3 w-3" />
            </span>
            <span className="text-sm font-semibold text-slate-800">ProjectPulse</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <Shield className="h-3 w-3 text-slate-400" />
            <span className="text-xs text-slate-500">Read-only · Public view</span>
          </div>
        </div>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
            <p className="text-sm text-slate-500">Loading project…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-slate-900">Link unavailable</h1>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
          </motion.div>
        </div>
      )}

      {/* Project content */}
      {!loading && project && (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md"
          >
            {/* Glassmorphism gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/60 via-transparent to-emerald-50/40" />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusColors[project.status]?.bg ?? 'bg-slate-100'
                      } ${statusColors[project.status]?.text ?? 'text-slate-600'}`}
                    >
                      {statusLabels[project.status] ?? project.status}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hCfg.textColor} bg-opacity-10`}>
                      Health: {hCfg.label}
                    </span>
                  </div>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="mt-2 max-w-2xl text-slate-600">{project.description}</p>
                  )}

                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' – '}
                      {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {completed} of {project.milestones.length} milestones complete
                    </span>
                  </div>
                </div>

                {/* Progress ring */}
                <div className="shrink-0">
                  <ProgressRing value={project.progress} size={120} strokeWidth={10} health={project.healthStatus} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">Overall Progress</span>
                  <span className={`font-semibold ${hCfg.textColor}`}>{project.progress}%</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${hCfg.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {[
              {
                label: 'Total Milestones',
                value: project.milestones.length,
                color: 'text-slate-700',
              },
              {
                label: 'Completed',
                value: project.milestones.filter((m) => ['completed', 'approved'].includes(m.status)).length,
                color: 'text-emerald-600',
              },
              {
                label: 'In Progress',
                value: project.milestones.filter((m) => m.status === 'in_progress').length,
                color: 'text-blue-600',
              },
              {
                label: 'Pending Review',
                value: project.milestones.filter((m) => m.status === 'ready_for_approval').length,
                color: 'text-amber-600',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-100 bg-white px-4 py-4 text-center shadow-sm"
              >
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="mt-1 text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Milestones */}
          {project.milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-8"
            >
              <h2 className="mb-5 text-lg font-bold text-slate-900">Milestones</h2>
              <div className="relative pl-4">
                {/* Vertical track */}
                <div className="absolute left-7 top-4 bottom-4 w-0.5 rounded-full bg-slate-100" />
                <div className="space-y-2">
                  {[...project.milestones]
                    .sort((a, b) => a.order - b.order)
                    .map((milestone, index) => (
                      <MilestoneRow key={milestone.id} milestone={milestone} index={index} />
                    ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 border-t border-slate-200 pt-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Command className="h-4 w-4" />
              <span className="text-sm">
                Powered by <span className="font-semibold text-slate-600">ProjectPulse</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">This is a read-only view. All data is real-time.</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
