import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { approvalAPI, type PendingApprovalItem } from '../lib/approvalApi';
import { ApprovalModal } from '../components/ApprovalModal';
import { KPICard } from '../components/KPICard';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import {
  CheckSquare,
  Clock,
  ThumbsUp,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ApprovalsPage() {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal control
  const [modalType, setModalType] = useState<'approve' | 'request_changes' | null>(null);
  const [activeApproval, setActiveApproval] = useState<PendingApprovalItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchApprovals = useCallback(() => {
    if (!accessToken) return;
    setIsLoading(true);
    approvalAPI
      .getPendingApprovals(accessToken)
      .then((res) => {
        setApprovals(res.approvals);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch pending approvals.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleActionClick = (type: 'approve' | 'request_changes', approvalItem: PendingApprovalItem) => {
    setActiveApproval(approvalItem);
    setModalType(type);
  };

  const handleConfirmAction = async (comment: string, reason: string) => {
    if (!accessToken || !activeApproval || !activeApproval.milestone) return;

    setModalLoading(true);
    try {
      if (modalType === 'approve') {
        await approvalAPI.approveMilestone(accessToken, activeApproval.milestone.id, comment);
      } else {
        await approvalAPI.requestChanges(accessToken, activeApproval.milestone.id, reason, comment);
      }
      setModalType(null);
      setActiveApproval(null);
      // Refresh list
      fetchApprovals();
    } catch (err) {
      console.error(err);
      alert('Failed to process approval action. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
        <LoadingState type="list" rows={4} />
      </div>
    );
  }

  const isClient = user?.role === 'client';
  const isManager = user?.role === 'manager';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-2">Verification & Sign-off</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Pending Approvals
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {isClient
            ? 'Review and sign-off on completed milestones delivered by your managers.'
            : isManager
            ? 'Track milestones submitted for client review.'
            : 'Platform oversight of all pending client verification tasks.'}
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl font-medium text-sm">
          {error}
        </div>
      )}

      {/* KPI summaries */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KPICard
          label="Pending Approvals"
          value={approvals.length}
          icon={CheckSquare}
          description="Awaiting feedback"
          index={0}
        />
        <KPICard
          label="Action Queue"
          value={isClient ? approvals.length : 0}
          icon={Clock}
          description="Requires your input"
          index={1}
        />
        <KPICard
          label="Verification Rate"
          value="100%"
          icon={TrendingUp}
          description="Consistent sign-off flow"
          index={2}
        />
      </section>

      {/* List Container */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 shadow-subtle">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sign-Off Backlog</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed overview of pending verification actions.
        </p>

        <div className="mt-6 space-y-4">
          {approvals.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 text-center">
               <EmptyState
                title="No pending approvals"
                description={
                  isClient
                    ? 'All milestones have been reviewed! Nice work.'
                    : 'You have no active milestones pending client feedback.'
                }
                icon={ThumbsUp}
              />
            </div>
          ) : (
            approvals.map((item) => (
              <div
                key={item.approval.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800/50 transition-all"
              >
                {/* Details */}
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center rounded-md bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 text-[10px] font-bold text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20 uppercase tracking-wide">
                      {item.projectName}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                      Requested {new Date(item.approval.requestedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate">
                    {item.milestone?.title ?? 'Milestone'}
                  </h4>
                  {item.approval.comment && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-2 border-l-2 border-slate-300 dark:border-slate-600 pl-3 py-0.5 leading-relaxed bg-slate-100/50 dark:bg-slate-800/50 rounded-r-md">
                      "{item.approval.comment}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {item.milestone && (
                    <button
                      onClick={() => navigate(`/projects/${item.milestone?.projectId}`)}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm"
                      type="button"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Project
                    </button>
                  )}

                  {isClient && (
                    <>
                      <button
                        onClick={() => handleActionClick('request_changes', item)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 px-4 py-2 text-sm font-bold text-red-700 dark:text-red-400 transition-all"
                        type="button"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleActionClick('approve', item)}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition-all"
                        type="button"
                      >
                        <CheckSquare className="h-4 w-4" />
                        Approve
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Action Dialog Modal */}
      {modalType && activeApproval && (
        <ApprovalModal
          type={modalType}
          milestoneName={activeApproval.milestone?.title ?? 'Milestone'}
          isLoading={modalLoading}
          onConfirm={handleConfirmAction}
          onClose={() => {
            setModalType(null);
            setActiveApproval(null);
          }}
        />
      )}
    </div>
  );
}
