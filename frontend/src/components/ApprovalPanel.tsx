import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import type { Milestone } from '../lib/milestoneApi';
import type { ApprovalRecord } from '../lib/approvalApi';

type ApprovalPanelProps = {
  milestone: Milestone;
  approvalHistory: ApprovalRecord[];
  isManager: boolean;
  isClient: boolean;
  isSubmitting: boolean;
  onRequestApproval: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
};

const statusConfig = {
  pending: {
    label: 'Awaiting Client Review',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
  },
  changes_requested: {
    label: 'Changes Requested',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    dot: 'bg-red-400',
    icon: XCircle,
  },
};

function HistoryEntry({ record }: { record: ApprovalRecord }) {
  const cfg = statusConfig[record.status] ?? statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative pl-6"
    >
      {/* Timeline dot */}
      <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-white ring-2 ${cfg.dot} ring-slate-200`} />
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${cfg.text}`} />
          <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
          <span className="ml-auto text-xs text-slate-400">
            {format(new Date(record.requestedAt), 'MMM d, yyyy · h:mm a')}
          </span>
        </div>
        {record.comment && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
            {record.comment}
          </p>
        )}
        {record.reason && (
          <p className="mt-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            <span className="font-medium">Reason: </span>
            {record.reason}
          </p>
        )}
        {record.respondedAt && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <User className="h-3 w-3" />
            Responded {format(new Date(record.respondedAt), 'MMM d · h:mm a')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function ApprovalPanel({
  milestone,
  approvalHistory,
  isManager,
  isClient,
  isSubmitting,
  onRequestApproval,
  onApprove,
  onRequestChanges,
}: ApprovalPanelProps) {
  const approvalStatus = milestone.approvalStatus;
  const isPendingApproval = approvalStatus === 'pending_approval';
  const isApproved = approvalStatus === 'approved';
  const isChangesRequested = approvalStatus === 'changes_requested';
  const canRequestApproval =
    isManager &&
    (milestone.status === 'in_progress' ||
      milestone.status === 'completed' ||
      milestone.status === 'changes_requested');

  const pendingRecord = approvalHistory.find((r) => r.status === 'pending');
  const latestRecord = approvalHistory[0];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Approval</h3>

      {/* Current status banner */}
      {approvalStatus && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 flex items-center gap-3 rounded-xl border px-4 py-3 ${
            isPendingApproval
              ? `${statusConfig.pending.bg} ${statusConfig.pending.border}`
              : isApproved
                ? `${statusConfig.approved.bg} ${statusConfig.approved.border}`
                : `${statusConfig.changes_requested.bg} ${statusConfig.changes_requested.border}`
          }`}
        >
          {isPendingApproval ? (
            <Clock className={`h-5 w-5 ${statusConfig.pending.text}`} />
          ) : isApproved ? (
            <CheckCircle2 className={`h-5 w-5 ${statusConfig.approved.text}`} />
          ) : (
            <XCircle className={`h-5 w-5 ${statusConfig.changes_requested.text}`} />
          )}
          <div className="flex-1">
            <p
              className={`text-sm font-semibold ${
                isPendingApproval
                  ? statusConfig.pending.text
                  : isApproved
                    ? statusConfig.approved.text
                    : statusConfig.changes_requested.text
              }`}
            >
              {isPendingApproval
                ? 'Awaiting Client Review'
                : isApproved
                  ? 'Approved by Client'
                  : 'Changes Requested by Client'}
            </p>
            {latestRecord?.requestedAt && (
              <p className="mt-0.5 text-xs text-slate-500">
                {format(new Date(latestRecord.requestedAt), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Manager actions */}
      {isManager && (
        <div className="mt-4">
          {canRequestApproval && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRequestApproval}
              disabled={isSubmitting || isPendingApproval}
              className="w-full rounded-xl bg-pulse-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPendingApproval ? 'Approval Requested' : 'Request Client Approval'}
            </motion.button>
          )}
          {!canRequestApproval && !approvalStatus && (
            <p className="text-sm text-slate-500">
              Mark the milestone as in progress to request client approval.
            </p>
          )}
        </div>
      )}

      {/* Client actions */}
      {isClient && isPendingApproval && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-3"
        >
          <p className="text-sm text-slate-600">
            This milestone is ready for your review. Please approve or request changes.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onApprove}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              <CheckCircle2 className="mr-2 inline-block h-4 w-4" />
              Approve
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRequestChanges}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
            >
              <XCircle className="mr-2 inline-block h-4 w-4" />
              Request Changes
            </motion.button>
          </div>
        </motion.div>
      )}

      {isClient && !isPendingApproval && !approvalStatus && (
        <p className="mt-4 text-sm text-slate-500">
          No approval has been requested yet. The manager will notify you when this milestone is ready for your review.
        </p>
      )}

      {/* Approval History */}
      {approvalHistory.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Approval History
          </p>
          <div className="space-y-3">
            {approvalHistory.map((record) => (
              <HistoryEntry key={record.id} record={record} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
