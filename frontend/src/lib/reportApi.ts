import { fetchWithAuth } from './apiClient';

export interface Report {
  id: string;
  projectId: string;
  weekStartDate: string;
  weekEndDate: string;
  completedWork: string;
  pendingWork: string;
  risks: string;
  blockers: string;
  nextWeekPlan: string;
  overallHealthScore: number;
  createdAt: string;
}

export const reportApi = {
  /**
   * Fetch all AI weekly reports for a project
   */
  listReports: async (projectId: string): Promise<Report[]> => {
    const data = await fetchWithAuth(`/projects/${projectId}/reports`);
    return data.data;
  },

  /**
   * Get a single AI weekly report
   */
  getReport: async (projectId: string, reportId: string): Promise<Report> => {
    const data = await fetchWithAuth(`/projects/${projectId}/reports/${reportId}`);
    return data.data;
  },

  /**
   * Generate a new AI weekly report
   */
  generateReport: async (projectId: string): Promise<Report> => {
    const data = await fetchWithAuth(`/projects/${projectId}/reports`, {
      method: 'POST',
    });
    return data.data;
  },
};
