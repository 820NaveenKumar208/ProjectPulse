import { motion } from 'framer-motion';
import { Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Milestone, MilestoneStatus } from '../lib/milestoneApi';

const statusColors: Record<MilestoneStatus, { bg: string; text: string; icon: string }> = {
  not_started: { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'text-blue-500' },
  ready_for_approval: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'text-purple-500' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', icon: 'text-green-500' },
  changes_requested: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'text-orange-500' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-500' },
  delayed: { bg: 'bg-red-100', text: 'text-red-700', icon: 'text-red-500' },
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
      className={`rounded-lg border-2 p-4 ${colors.bg} border-transparent`}
    >
      {/* Header with title and status badge */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1 pr-3">
          <h3 className="text-base font-semibold text-gray-900">{milestone.title}</h3>
          {milestone.description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{milestone.description}</p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${colors.text} ${colors.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colors.icon}`} />
          {statusLabel}
        </motion.div>
      </div>

      {/* Completion percentage */}
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Progress</span>
          <span className={`text-xs font-semibold ${colors.text}`}>
            {milestone.completionPercentage}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${milestone.completionPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full ${colors.bg} transition-all`}
            style={{
              background:
                milestone.status === 'completed'
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : 'linear-gradient(90deg, #3b82f6, #1e40af)',
            }}
          />
        </div>
      </div>

      {/* Due date and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-orange-500' : 'text-gray-400'}`} />
          <span>
            Due {format(dueDate, 'MMM d, yyyy')}
            {isOverdue && <span className="ml-1 font-semibold text-red-600">(Overdue)</span>}
            {isDueSoon && (
              <span className="ml-1 font-semibold text-orange-600">(Due soon)</span>
            )}
          </span>
        </div>

        {/* Action buttons */}
        {isManager && (
          <div className="flex items-center gap-2">
            {milestone.status !== 'completed' && onComplete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(milestone)}
                className="p-1 rounded hover:bg-gray-300/50 transition-colors"
                title="Mark as complete"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
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
                className="p-1 rounded hover:bg-gray-300/50 transition-colors"
                title="Delete milestone"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
