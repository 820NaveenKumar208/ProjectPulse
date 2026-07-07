import { apiRequest } from './api';
import type { UserRole } from '../types/auth';

export type AdminStats = {
  totalOrganizations: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalManagers: number;
  totalClients: number;
  pendingApprovals: number;
  totalMilestones: number;
  totalReports: number;
  platformHealth: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
};

export type AdminUsersResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type AdminActivity = {
  type: 'notification' | 'approval';
  title: string;
  message: string;
  projectId: string;
  createdAt: string;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organizationId: string;
};

export const adminAPI = {
  getStats: async (accessToken: string): Promise<AdminStats> => {
    return apiRequest<AdminStats>('/admin/stats', {
      accessToken,
    });
  },

  listUsers: async (
    accessToken: string,
    options?: { page?: number; limit?: number; search?: string; role?: string },
  ): Promise<AdminUsersResponse> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.search) params.set('search', options.search);
    if (options?.role) params.set('role', options.role);

    return apiRequest<AdminUsersResponse>(
      `/admin/users?${params.toString()}`,
      { accessToken },
    );
  },

  createUser: async (accessToken: string, input: CreateUserInput): Promise<AdminUser> => {
    const response = await apiRequest<{ user: AdminUser }>('/admin/users', {
      accessToken,
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.user;
  },

  getActivity: async (accessToken: string, limit?: number): Promise<AdminActivity[]> => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));

    const response = await apiRequest<{ activity: AdminActivity[] }>(
      `/admin/activity?${params.toString()}`,
      { accessToken },
    );
    return response.activity;
  },
};
