import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NotificationModel } from '../models/Notification.js';
import { MilestoneModel } from '../models/Milestone.js';
import { ProjectModel } from '../models/Project.js';

const API_BASE = 'http://127.0.0.1:5000/api/v1';

describe('Notifications API & Service', () => {
  let managerAccessToken: string;
  let clientAccessToken: string;
  let managerId: string;
  let clientId: string;
  let projectId: string;
  let milestoneId: string;
  let notificationId: string;

  beforeAll(async () => {
    // Clean up notifications collection
    await NotificationModel.deleteMany({});

    // Register manager
    const managerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Notification Manager',
        email: `notif-manager-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'manager',
        organizationId: 'test-org',
      }),
    });
    const managerData = await managerRes.json() as { data: { user: { id: string }, accessToken: string } };
    managerAccessToken = managerData.data.accessToken;
    managerId = managerData.data.user.id;

    // Register client
    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Notification Client',
        email: `notif-client-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'client',
        organizationId: 'test-org',
      }),
    });
    const clientData = await clientRes.json() as { data: { user: { id: string }, accessToken: string } };
    clientAccessToken = clientData.data.accessToken;
    clientId = clientData.data.user.id;

    // Create a project
    const projectRes = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerAccessToken}`,
      },
      body: JSON.stringify({
        name: 'Notification Test Project',
        description: 'Testing notifications system',
        clientId,
        startDate: '2026-07-01',
        endDate: '2026-09-30',
      }),
    });
    const projectData = await projectRes.json() as { data: { id: string } };
    projectId = projectData.data.id;

    // Create a milestone under the project
    const milestoneRes = await fetch(`${API_BASE}/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerAccessToken}`,
      },
      body: JSON.stringify({
        title: 'Initial Milestone',
        description: 'First phase milestone',
        dueDate: '2026-07-31',
      }),
    });
    const milestoneData = await milestoneRes.json() as { data: { id: string } };
    milestoneId = milestoneData.data.id;
  });

  afterAll(async () => {
    await NotificationModel.deleteMany({});
    await MilestoneModel.deleteMany({});
    await ProjectModel.deleteMany({});
  });

  describe('TRIGGER EVENTS AND VERIFY NOTIFICATIONS', () => {
    it('Manager requesting milestone approval triggers APPROVAL_REQUESTED notification for client', async () => {
      // Trigger approval request
      const res = await fetch(`${API_BASE}/projects/milestones/${milestoneId}/request-approval`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          comment: 'Please review design documents.',
        }),
      });
      expect(res.status).toBe(201);

      // Verify notification is created for client
      const notifications = await NotificationModel.find({ userId: clientId });
      expect(notifications.length).toBe(1);
      expect(notifications[0].type).toBe('APPROVAL_REQUESTED');
      expect(notifications[0].projectId).toBe(projectId);
      expect(notifications[0].read).toBe(false);
      expect(notifications[0].title).toBe('Approval Requested');
      expect(notifications[0].metadata?.milestoneId).toBe(milestoneId);
    });

    it('Client approving milestone triggers APPROVAL_APPROVED notification for manager', async () => {
      // Client approves milestone
      const res = await fetch(`${API_BASE}/projects/milestones/${milestoneId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientAccessToken}`,
        },
        body: JSON.stringify({
          comment: 'Designs look excellent. Approved!',
        }),
      });
      expect(res.status).toBe(200);

      // Verify notification is created for manager
      const notifications = await NotificationModel.find({ userId: managerId, type: 'APPROVAL_APPROVED' });
      expect(notifications.length).toBe(1);
      expect(notifications[0].projectId).toBe(projectId);
      expect(notifications[0].read).toBe(false);
    });

    it('Manager marking milestone as completed triggers MILESTONE_COMPLETED notification for client', async () => {
      // Milestone is complete
      const res = await fetch(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });
      expect(res.status).toBe(200);

      // Verify notification is created for client
      const notifications = await NotificationModel.find({ userId: clientId, type: 'MILESTONE_COMPLETED' });
      expect(notifications.length).toBe(1);
      expect(notifications[0].projectId).toBe(projectId);
    });

    it('Manager generating AI Weekly Report triggers REPORT_GENERATED notification for client', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });
      expect(res.status).toBe(201);

      // Verify notification is created for client
      const notifications = await NotificationModel.find({ userId: clientId, type: 'REPORT_GENERATED' });
      expect(notifications.length).toBe(1);
      expect(notifications[0].projectId).toBe(projectId);
    });
  });

  describe('NOTIFICATIONS ROUTE ENDPOINTS', () => {
    beforeAll(async () => {
      // Clear notifications and write standard notifications for client to test API endpoints
      await NotificationModel.deleteMany({});
      
      const notifs = [
        {
          userId: clientId,
          projectId,
          type: 'APPROVAL_REQUESTED',
          title: 'Approval Requested',
          message: 'Review requested',
          read: false,
          createdAt: new Date(),
        },
        {
          userId: clientId,
          projectId,
          type: 'REPORT_GENERATED',
          title: 'Report Generated',
          message: 'Report ready',
          read: false,
          createdAt: new Date(Date.now() - 10000),
        },
        {
          userId: clientId,
          projectId,
          type: 'MILESTONE_COMPLETED',
          title: 'Milestone Completed',
          message: 'Milestone complete',
          read: true,
          createdAt: new Date(Date.now() - 20000),
        }
      ];

      const inserted = await NotificationModel.create(notifs);
      notificationId = inserted[0]._id.toString();
    });

    it('Client can list their notifications with pagination info', async () => {
      const res = await fetch(`${API_BASE}/notifications?page=1&limit=2`, {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { data: any[], meta: any };
      expect(data.data.length).toBe(2);
      expect(data.meta.total).toBe(3);
      expect(data.meta.totalPages).toBe(2);
    });

    it('Client can retrieve unread count', async () => {
      const res = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { data: { count: number } };
      expect(data.data.count).toBe(2); // Two unread from setup
    });

    it('Client can mark a specific notification as read', async () => {
      const res = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { data: { id: string, read: boolean } };
      expect(data.data.read).toBe(true);

      // Verify in DB
      const updated = await NotificationModel.findById(notificationId);
      expect(updated?.read).toBe(true);
    });

    it('Client can mark all notifications as read', async () => {
      const res = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });
      expect(res.status).toBe(200);

      // Verify unread count is 0
      const countRes = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });
      const countData = await countRes.json() as { data: { count: number } };
      expect(countData.data.count).toBe(0);
    });
  });
});
