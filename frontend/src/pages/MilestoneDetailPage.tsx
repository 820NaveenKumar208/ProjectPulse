import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { milestoneAPI } from '../lib/milestoneApi';
import type { Milestone, UpdateMilestoneInput } from '../lib/milestoneApi';
import { approvalAPI } from '../lib/approvalApi';
import type { ApprovalRecord } from '../lib/approvalApi';
import { MilestoneForm } from '../components/MilestoneForm';
import { MilestoneCard } from '../components/MilestoneCard';
import { ApprovalPanel } from '../components/ApprovalPanel';
import { ApprovalModal } from '../components/ApprovalModal';

export function MilestoneDetailPage() {
  const { projectId, milestoneId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [approvalHistory, setApprovalHistory] = useState<ApprovalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState<'approve' | 'request_changes' | null>(null);
  const [isApprovalSubmitting, setIsApprovalSubmitting] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState('');

  const isManager = user?.role === 'manager';
  const isClient = user?.role === 'client';

  useEffect(() => {
    if (!projectId || !milestoneId || !accessToken) return;

    const fetchAll = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [milestoneData, historyData] = await Promise.all([
          milestoneAPI.getMilestone(accessToken, milestoneId),
          approvalAPI.getApprovalHistory(accessToken, milestoneId).catch(() => ({ records: [], total: 0 })),
        ]);
        setMilestone(milestoneData);
        setApprovalHistory(historyData.records);
      } catch (err: any) {
        setError(err.message || 'Failed to load milestone');
        if (err.message?.includes('401') || err.message?.includes('403')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [milestoneId, projectId, accessToken, navigate]);

  const handleUpdate = async (data: UpdateMilestoneInput) => {
    if (!accessToken || !milestoneId) return;
    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await milestoneAPI.updateMilestone(accessToken, milestoneId, data);
      setMilestone(updated);
      navigate(`/projects/${projectId}/milestones/${milestoneId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !milestoneId) return;
    try {
      setIsSubmitting(true);
      await milestoneAPI.deleteMilestone(accessToken, milestoneId);
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete milestone');
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!accessToken || !milestoneId) return;
    try {
      setIsSubmitting(true);
      const updated = await milestoneAPI.completeMilestone(accessToken, milestoneId);
      setMilestone(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to mark milestone complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestApproval = async () => {
    if (!accessToken || !milestoneId) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await approvalAPI.requestApproval(accessToken, milestoneId);
      // Refresh milestone + history
      const [updated, history] = await Promise.all([
        milestoneAPI.getMilestone(accessToken, milestoneId),
        approvalAPI.getApprovalHistory(accessToken, milestoneId),
      ]);
      setMilestone(updated);
      setApprovalHistory(history.records);
      setApprovalSuccess('Approval request sent to client.');
      setTimeout(() => setApprovalSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to request approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovalModalConfirm = async (comment: string, reason: string) => {
    if (!accessToken || !milestoneId || !approvalModal) return;
    try {
      setIsApprovalSubmitting(true);
      setError(null);
      if (approvalModal === 'approve') {
        await approvalAPI.approveMilestone(accessToken, milestoneId, comment);
        setApprovalSuccess('Milestone approved successfully!');
      } else {
        await approvalAPI.requestChanges(accessToken, milestoneId, reason, comment);
        setApprovalSuccess('Changes requested. The manager has been notified.');
      }
      setApprovalModal(null);
      // Refresh
      const [updated, history] = await Promise.all([
        milestoneAPI.getMilestone(accessToken, milestoneId),
        approvalAPI.getApprovalHistory(accessToken, milestoneId),
      ]);
      setMilestone(updated);
      setApprovalHistory(history.records);
      setTimeout(() => setApprovalSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit approval action');
    } finally {
      setIsApprovalSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-pulse-primary" />
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">{error || 'Milestone not found'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Approval Modal */}
      {approvalModal && (
        <ApprovalModal
          type={approvalModal}
          milestoneName={milestone.title}
          isLoading={isApprovalSubmitting}
          onConfirm={handleApprovalModalConfirm}
          onClose={() => setApprovalModal(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-2 text-pulse-primary hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </motion.button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{milestone.title}</h1>
            <p className="mt-2 text-slate-600 text-lg">{milestone.description}</p>
          </div>

          {isManager && !isEditing && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`?edit=true`)}
                className="px-4 py-2 rounded-xl font-medium text-pulse-primary bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Edit
              </motion.button>
              {milestone.status !== 'completed' && milestone.status !== 'approved' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  Mark Complete
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Delete
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {approvalSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {approvalSuccess}
        </motion.div>
      )}

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Edit Form or Display */}
      {isEditing && isManager ? (
        <MilestoneForm
          initialData={milestone}
          isLoading={isSubmitting}
          error={error}
          onSubmit={handleUpdate}
          onCancel={() => navigate(`?edit=false`)}
          title="Edit Milestone"
        />
      ) : (
        <div className="grid gap-6">
          <MilestoneCard milestone={milestone} isManager={isManager} />

          {/* Details */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                <p className="text-base text-slate-900 font-semibold capitalize">
                  {milestone.status.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Progress</p>
                <p className="text-base text-slate-900 font-semibold">
                  {milestone.completionPercentage}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Created</p>
                <p className="text-base text-slate-900 font-semibold">
                  {new Date(milestone.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Due Date</p>
                <p className="text-base text-slate-900 font-semibold">
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Approval Panel */}
          <ApprovalPanel
            milestone={milestone}
            approvalHistory={approvalHistory}
            isManager={isManager}
            isClient={isClient}
            isSubmitting={isSubmitting}
            onRequestApproval={handleRequestApproval}
            onApprove={() => setApprovalModal('approve')}
            onRequestChanges={() => setApprovalModal('request_changes')}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Delete Milestone?</h2>
              <p className="text-slate-600 mb-6">
                Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
