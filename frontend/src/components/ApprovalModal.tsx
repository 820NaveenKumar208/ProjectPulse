import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type ApprovalModalProps = {
  type: 'approve' | 'request_changes';
  milestoneName: string;
  isLoading: boolean;
  onConfirm: (comment: string, reason: string) => void;
  onClose: () => void;
};

export function ApprovalModal({
  type,
  milestoneName,
  isLoading,
  onConfirm,
  onClose,
}: ApprovalModalProps) {
  const [comment, setComment] = useState('');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const isApprove = type === 'approve';

  const handleConfirm = () => {
    if (!isApprove && !reason.trim()) {
      setReasonError('Please provide a reason for requesting changes.');
      return;
    }
    onConfirm(comment, reason);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl"
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 rounded-t-2xl px-6 py-4 ${
              isApprove 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' 
                : 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300'
            }`}
          >
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            )}
            <div className="flex-1">
              <h2 className={`text-base font-semibold ${isApprove ? 'text-emerald-850 dark:text-emerald-350' : 'text-red-850 dark:text-red-350'}`}>
                {isApprove ? 'Approve Milestone' : 'Request Changes'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">{milestoneName}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {!isApprove && (
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what changes are needed..."
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (e.target.value.trim()) setReasonError('');
                  }}
                  className={`mt-1.5 w-full rounded-xl border bg-white dark:bg-slate-900 px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                    reasonError
                      ? 'border-red-300 dark:border-red-900 focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-950/30 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 focus:border-pulse-primary focus:ring-violet-100 dark:focus:ring-violet-950/30 text-slate-900 dark:text-white'
                  }`}
                />
                {reasonError && (
                  <p className="mt-1 text-xs text-red-650 dark:text-red-400">{reasonError}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Comment <span className="text-xs text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder={isApprove ? 'Add a note to the manager...' : 'Additional context...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2.5 text-sm outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-950/30"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-850 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-650 dark:text-slate-350 transition hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-sm shadow-red-500/20'
              }`}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isApprove ? 'Confirm Approval' : 'Submit Request'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
