import type { MilestoneStatus } from '../models/Milestone.js';

export type ApprovalStatus = 'pending_approval' | 'approved' | 'changes_requested';

export type CreateMilestoneInput = {
  title: string;
  description?: string;
  dueDate: string; // ISO date
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

export type MilestoneResponse = {
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

export type MilestoneListResponse = {
  milestones: MilestoneResponse[];
  total: number;
};

export type ApprovalRequestInput = {
  comment?: string;
};

export type ApprovalResponseInput = {
  comment?: string;
  reason?: string; // for changes_requested
};

export type ApprovalRecordResponse = {
  id: string;
  milestoneId: string;
  projectId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'changes_requested';
  respondedBy?: string;
  respondedAt?: string;
  comment?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApprovalHistoryResponse = {
  records: ApprovalRecordResponse[];
  total: number;
};
