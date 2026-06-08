import { apiRequest, type ApiError } from './api';

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type HealthStatus = 'excellent' | 'good' | 'at_risk' | 'critical';

export type Project = {
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

export type CreateProjectInput = {
  name: string;
  description?: string;
  clientId: string;
  startDate: string;
  endDate: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  progress?: number;
  healthScore?: number;
};

export type ProjectListResponse = {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export const projectAPI = {
  listProjects: async (
    accessToken: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: ProjectStatus;
    },
  ): Promise<ProjectListResponse> => {
    const params = new URLSearchParams();
    if (options?.page) params.set('page', String(options.page));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.search) params.set('search', options.search);
    if (options?.status) params.set('status', options.status);

    const response = await apiRequest<{ data: ProjectListResponse }>(
      `/projects?${params.toString()}`,
      { accessToken },
    );
    return response.data;
  },

  getProject: async (accessToken: string, projectId: string): Promise<Project> => {
    const response = await apiRequest<{ data: Project }>(`/projects/${projectId}`, {
      accessToken,
    });
    return response.data;
  },

  createProject: async (accessToken: string, input: CreateProjectInput): Promise<Project> => {
    const response = await apiRequest<{ data: Project }>('/projects', {
      accessToken,
      method: 'POST',
      body: JSON.stringify(input),
    });
    return response.data;
  },

  updateProject: async (
    accessToken: string,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> => {
    const response = await apiRequest<{ data: Project }>(`/projects/${projectId}`, {
      accessToken,
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return response.data;
  },

  archiveProject: async (accessToken: string, projectId: string): Promise<Project> => {
    const response = await apiRequest<{ data: Project }>(`/projects/${projectId}/archive`, {
      accessToken,
      method: 'POST',
    });
    return response.data;
  },

  deleteProject: async (accessToken: string, projectId: string): Promise<void> => {
    await apiRequest(`/projects/${projectId}`, {
      accessToken,
      method: 'DELETE',
    });
  },
};
