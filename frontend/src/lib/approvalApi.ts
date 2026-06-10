import { apiRequest } from './api';

export type ApprovalRecordStatus = 'pending' | 'approved' | 'changes_requested';

export type ApprovalRecord = {
  id: string;
  milestoneId: string;
  projectId: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalRecordStatus;
  respondedBy?: string;
  respondedAt?: string;
  comment?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

export type PendingApprovalItem = {
  approval: ApprovalRecord;
  milestone: {
    id: string;
    title: string;
    projectId: string;
  } | null;
};

export type ApprovalHistoryResponse = {
  records: ApprovalRecord[];
  total: number;
};

export type PendingApprovalsResponse = {
  approvals: PendingApprovalItem[];
  total: number;
};

export const approvalAPI = {
  requestApproval: async (
    accessToken: string,
    milestoneId: string,
    comment?: string,
  ): Promise<ApprovalRecord> => {
    return apiRequest<ApprovalRecord>(
      `/projects/milestones/${milestoneId}/request-approval`,
      {
        accessToken,
        method: 'POST',
        body: JSON.stringify({ comment }),
      },
    );
  },

  approveMilestone: async (
    accessToken: string,
    milestoneId: string,
    comment?: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/projects/milestones/${milestoneId}/approve`,
      {
        accessToken,
        method: 'POST',
        body: JSON.stringify({ comment }),
      },
    );
  },

  requestChanges: async (
    accessToken: string,
    milestoneId: string,
    reason: string,
    comment?: string,
  ): Promise<{ success: boolean; message: string }> => {
    return apiRequest<{ success: boolean; message: string }>(
      `/projects/milestones/${milestoneId}/request-changes`,
      {
        accessToken,
        method: 'POST',
        body: JSON.stringify({ reason, comment }),
      },
    );
  },

  getApprovalHistory: async (
    accessToken: string,
    milestoneId: string,
  ): Promise<ApprovalHistoryResponse> => {
    return apiRequest<ApprovalHistoryResponse>(
      `/projects/milestones/${milestoneId}/approval-history`,
      { accessToken },
    );
  },

  getPendingApprovals: async (accessToken: string): Promise<PendingApprovalsResponse> => {
    return apiRequest<PendingApprovalsResponse>('/approvals/pending', { accessToken });
  },
};
