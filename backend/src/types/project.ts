import type { ProjectStatus, HealthStatus } from '../models/Project.js';

export type CreateProjectInput = {
  name: string;
  description?: string;
  clientId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  progress?: number;
  healthScore?: number;
};

export type ProjectResponse = {
  id: string;
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  progress: number;
  healthScore: number;
  healthStatus: HealthStatus;
  createdAt: string;
  updatedAt: string;
};

export type ProjectListResponse = {
  projects: ProjectResponse[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};
