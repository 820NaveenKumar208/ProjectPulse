import { apiRequest } from './api';

export type ShareLinkResponse = {
  shareToken: string;
  shareEnabled: boolean;
  shareExpiresAt?: string;
  shareUrl: string;
};

export type PublicMilestone = {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  completionPercentage: number;
  order: number;
  approvalStatus?: string;
  lastApprovedAt?: string;
};

export type PublicProjectView = {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  healthScore: number;
  healthStatus: string;
  startDate: string;
  endDate: string;
  milestones: PublicMilestone[];
};

export const shareAPI = {
  enableShareLink: async (
    accessToken: string,
    projectId: string,
    expiresAt?: string,
  ): Promise<ShareLinkResponse> => {
    return apiRequest<ShareLinkResponse>(`/projects/${projectId}/share-link`, {
      accessToken,
      method: 'POST',
      body: JSON.stringify({ expiresAt }),
    });
  },

  rotateShareLink: async (
    accessToken: string,
    projectId: string,
  ): Promise<ShareLinkResponse> => {
    return apiRequest<ShareLinkResponse>(`/projects/${projectId}/share-link/rotate`, {
      accessToken,
      method: 'POST',
    });
  },

  disableShareLink: async (accessToken: string, projectId: string): Promise<void> => {
    await apiRequest(`/projects/${projectId}/share-link`, {
      accessToken,
      method: 'DELETE',
    });
  },

  getPublicProject: async (token: string): Promise<PublicProjectView> => {
    return apiRequest<PublicProjectView>(`/public/share/${token}`);
  },
};
