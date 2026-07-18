import { fetchWithAuth } from './apiClient';

export interface Notification {
  id: string;
  projectId: string;
  type:
    | 'MILESTONE_COMPLETED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_APPROVED'
    | 'APPROVAL_REJECTED'
    | 'REPORT_GENERATED'
    | 'system'
    | 'action';
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export const notificationApi = {
  /**
   * Fetch a paginated list of notifications
   */
  listNotifications: async (page = 1, limit = 20): Promise<{ data: Notification[]; meta: any }> => {
    return fetchWithAuth(`/notifications?page=${page}&limit=${limit}`);
  },

  /**
   * Get count of unread notifications
   */
  getUnreadCount: async (): Promise<{ count: number }> => {
    const data = await fetchWithAuth(`/notifications/unread-count`);
    return data.data;
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (id: string): Promise<Notification> => {
    const data = await fetchWithAuth(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    return data.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const data = await fetchWithAuth(`/notifications/read-all`, {
      method: 'PATCH',
    });
    return data.data;
  },
};
