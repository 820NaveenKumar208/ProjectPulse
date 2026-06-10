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
    const response = await apiRequest<{ data: MilestoneListResponse }>(
      `/projects/${projectId}/milestones`,
      { accessToken },
    );
    return response.data;
  },

  getMilestone: async (accessToken: string, milestoneId: string): Promise<Milestone> => {
    const response = await apiRequest<{ data: Milestone }>(`/milestones/${milestoneId}`, {
      accessToken,
    });
    return response.data;
  },

  createMilestone: async (
    accessToken: string,
    projectId: string,
    input: CreateMilestoneInput,
  ): Promise<Milestone> => {
    const response = await apiRequest<{ data: Milestone }>(
      `/projects/${projectId}/milestones`,
      {
        accessToken,
        method: 'POST',
        body: JSON.stringify(input),
      },
    );
    return response.data;
  },

  updateMilestone: async (
    accessToken: string,
    milestoneId: string,
    input: UpdateMilestoneInput,
  ): Promise<Milestone> => {
    const response = await apiRequest<{ data: Milestone }>(`/milestones/${milestoneId}`, {
      accessToken,
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return response.data;
  },

  completeMilestone: async (accessToken: string, milestoneId: string): Promise<Milestone> => {
    const response = await apiRequest<{ data: Milestone }>(
      `/milestones/${milestoneId}/complete`,
      {
        accessToken,
        method: 'POST',
      },
    );
    return response.data;
  },

  deleteMilestone: async (accessToken: string, milestoneId: string): Promise<void> => {
    await apiRequest(`/milestones/${milestoneId}`, {
      accessToken,
      method: 'DELETE',
    });
  },
};
