import { apiRequest } from './api';

export type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_for_approval'
  | 'approved'
  | 'changes_requested'
  | 'completed'
  | 'delayed';

export type ApprovalStatus = 'pending_approval' | 'approved' | 'changes_requested';

export type Milestone = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string;
  completionPercentage: number;
  order: number;
  createdBy: string;
  updatedBy: string;
  approvalStatus?: ApprovalStatus;
  approvalRequestedAt?: string;
  approvalRequestedBy?: string;
  lastApprovedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMilestoneInput = {
  title: string;
  description?: string;
  dueDate: string;
  order?: number;
};

export type UpdateMilestoneInput = {
  title?: string;
  description?: string;
  status?: MilestoneStatus;
  dueDate?: string;
  completionPercentage?: number;
  order?: number;
};

export type MilestoneListResponse = {
  milestones: Milestone[];
  total: number;
};

export const milestoneAPI = {
  listMilestones: async (
    accessToken: string,
    projectId: string,
  ): Promise<MilestoneListResponse> => {
    return apiRequest<MilestoneListResponse>(
      `/projects/${projectId}/milestones`,
      { accessToken },
    );
  },

  getMilestone: async (accessToken: string, milestoneId: string, projectId?: string): Promise<Milestone> => {
    // If projectId is provided, use the nested route (preferred).
    // Otherwise fall back to the flat route for backward compat.
    const path = projectId
      ? `/projects/${projectId}/milestones/${milestoneId}`
      : `/projects/milestones/${milestoneId}`;
    return apiRequest<Milestone>(path, {
      accessToken,
    });
  },

  createMilestone: async (
    accessToken: string,
    projectId: string,
    input: CreateMilestoneInput,
  ): Promise<Milestone> => {
    return apiRequest<Milestone>(
      `/projects/${projectId}/milestones`,
      {
        accessToken,
        method: 'POST',
        body: JSON.stringify(input),
      },
    );
  },

  updateMilestone: async (
    accessToken: string,
    milestoneId: string,
    input: UpdateMilestoneInput,
    projectId?: string,
  ): Promise<Milestone> => {
    const path = projectId
      ? `/projects/${projectId}/milestones/${milestoneId}`
      : `/projects/milestones/${milestoneId}`;
    return apiRequest<Milestone>(path, {
      accessToken,
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  completeMilestone: async (accessToken: string, milestoneId: string, projectId?: string): Promise<Milestone> => {
    const path = projectId
      ? `/projects/${projectId}/milestones/${milestoneId}/complete`
      : `/projects/milestones/${milestoneId}/complete`;
    return apiRequest<Milestone>(path, {
      accessToken,
      method: 'POST',
    });
  },

  deleteMilestone: async (accessToken: string, milestoneId: string, projectId?: string): Promise<void> => {
    const path = projectId
      ? `/projects/${projectId}/milestones/${milestoneId}`
      : `/projects/milestones/${milestoneId}`;
    await apiRequest(path, {
      accessToken,
      method: 'DELETE',
    });
  },
};
