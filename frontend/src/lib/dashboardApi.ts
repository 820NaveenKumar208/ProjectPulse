import { apiRequest } from './api';

export type ManagerDashboardData = {
  role: 'manager';
  stats: {
    activeProjects: number;
    totalProjects: number;
    completedProjects: number;
    pendingApprovals: number;
    portfolioHealth: number;
  };
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    projectId: string;
    dueDate: string;
    status: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    projectId: string;
    read: boolean;
    createdAt: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    progress: number;
    healthScore: number;
    healthStatus: string;
    status: string;
    endDate: string;
  }>;
};

export type ClientDashboardData = {
  role: 'client';
  stats: {
    assignedProjects: number;
    activeProjects: number;
    pendingApprovals: number;
    overallHealth: number;
    availableReports: number;
  };
  pendingApprovals: Array<{
    id: string;
    milestoneId: string;
    projectId: string;
    requestedAt: string;
    milestoneTitle: string;
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    projectId: string;
    read: boolean;
    createdAt: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    progress: number;
    healthScore: number;
    healthStatus: string;
    status: string;
    endDate: string;
  }>;
};

export type AdminDashboardData = {
  role: 'admin';
  message: string;
};

export type DashboardResponse = ManagerDashboardData | ClientDashboardData | AdminDashboardData;

export const dashboardAPI = {
  getDashboardData: async (accessToken: string): Promise<DashboardResponse> => {
    return apiRequest<DashboardResponse>('/dashboard', {
      accessToken,
    });
  },
};
