import type { MilestoneStatus } from '../models/Milestone.js';

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
  createdAt: string;
  updatedAt: string;
};

export type MilestoneListResponse = {
  milestones: MilestoneResponse[];
  total: number;
};
