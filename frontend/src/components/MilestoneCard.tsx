import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { Milestone, MilestoneStatus } from '../lib/milestoneApi';

const statusColors: Record<
  MilestoneStatus,
  {
    bg: string;
    text: string;
    icon: string;
    border: string;
  }
> = {
  not_started: {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-700 dark:text-slate-350',
    icon: 'bg-slate-400 dark:bg-slate-500',
    border: 'border-l-slate-400 dark:border-l-slate-650',
  },
  in_progress: {
    bg: 'bg-violet-100/60 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-400',
    icon: 'bg-violet-500',
    border: 'border-l-violet-500',
  },
  ready_for_approval: {
    bg: 'bg-fuchsia-100/60 dark:bg-fuchsia-950/30',
    text: 'text-fuchsia-700 dark:text-fuchsia-400',
    icon: 'bg-fuchsia-500',
    border: 'border-l-fuchsia-500',
  },
  approved: {
    bg: 'bg-emerald-100/60 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: 'bg-emerald-500',
    border: 'border-l-emerald-500',
  },
  changes_requested: {
    bg: 'bg-amber-100/60 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    icon: 'bg-amber-500',
    border: 'border-l-amber-500',
  },
  completed: {
    bg: 'bg-green-100/60 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    icon: 'bg-green-500',
    border: 'border-l-green-500',
  },
  delayed: {
    bg: 'bg-red-100/60 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    icon: 'bg-red-500',
    border: 'border-l-red-500',
  },
};

const statusLabels: Record<MilestoneStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  ready_for_approval: 'Ready for Approval',
  approved: 'Approved',
  changes_requested: 'Changes Requested',
  completed: 'Completed',
  delayed: 'Delayed',
};

type MilestoneCardProps = {
  milestone: Milestone;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestone: Milestone) => void;
  onComplete?: (milestone: Milestone) => void;
  isManager?: boolean;
};

export function MilestoneCard({
  milestone,
  onEdit,
  onDelete,
  onComplete,
  isManager = false,
}: MilestoneCardProps) {
  const colors = statusColors[milestone.status];
  const statusLabel = statusLabels[milestone.status];
  const dueDate = new Date(milestone.dueDate);
  const isOverdue = dueDate < new Date() && milestone.status !== 'completed';
  const isDueSoon = dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && !isOverdue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-xl border border-slate-200/85 dark:border-slate-800/80 border-l-4 ${colors.border} bg-white dark:bg-slate-900/50 p-4 shadow-sm hover:shadow-md transition-all duration-200`}
    >
      {/* Header with title and status badge */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1 pr-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{milestone.title}</h3>
          {milestone.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{milestone.description}</p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${colors.text} ${colors.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colors.icon}`} />
          {statusLabel}
        </motion.div>
      </div>

      {/* Completion percentage */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-550 dark:text-slate-400">Progress</span>
          <span className={`text-xs font-semibold ${colors.text}`}>
            {milestone.completionPercentage}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${milestone.completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full transition-all"
            style={{
              background:
                milestone.status === 'completed'
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #7c3aed, #22d3ee)',
            }}
          />
        </div>
      </div>

      {/* Due date and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-slate-400'}`} />
          <span>
            Due {format(dueDate, 'MMM d, yyyy')}
            {isOverdue && <span className="ml-1 font-semibold text-red-500 dark:text-red-400">(Overdue)</span>}
            {isDueSoon && (
              <span className="ml-1 font-semibold text-amber-600 dark:text-amber-400">(Due soon)</span>
            )}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(milestone)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title="View details & approval history"
            >
              <Eye className="w-4 h-4 text-slate-550 dark:text-slate-400" />
            </motion.button>
          )}
          {isManager && (
            <>
              {milestone.status !== 'completed' && onComplete && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(milestone)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  title="Mark as complete"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (confirm(`Delete milestone "${milestone.title}"?`)) {
                      onDelete(milestone);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  title="Delete milestone"
                >
                  <Trash2 className="w-4 h-4 text-red-650 dark:text-red-400" />
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
