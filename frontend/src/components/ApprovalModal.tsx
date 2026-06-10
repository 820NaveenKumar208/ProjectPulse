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
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
        >
          {/* Header */}
          <div
            className={`flex items-center gap-3 rounded-t-2xl px-6 py-4 ${
              isApprove ? 'bg-emerald-50' : 'bg-red-50'
            }`}
          >
            {isApprove ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div className="flex-1">
              <h2 className={`text-base font-semibold ${isApprove ? 'text-emerald-800' : 'text-red-800'}`}>
                {isApprove ? 'Approve Milestone' : 'Request Changes'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 truncate">{milestoneName}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {!isApprove && (
              <div>
                <label className="text-sm font-medium text-slate-700">
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
                  className={`mt-1.5 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-4 ${
                    reasonError
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-pulse-primary focus:ring-blue-100'
                  }`}
                />
                {reasonError && (
                  <p className="mt-1 text-xs text-red-600">{reasonError}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700">
                Comment <span className="text-xs text-slate-400">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder={isApprove ? 'Add a note to the manager...' : 'Additional context...'}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
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
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
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
