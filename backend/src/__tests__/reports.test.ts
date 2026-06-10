import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { ProjectModel } from '../models/Project';

const API_BASE = 'http://localhost:5000/api/v1';

describe('AI Weekly Reports API', () => {
  let managerAccessToken: string;
  let clientAccessToken: string;
  let clientId: string;
  let projectId: string;
  let reportId: string;

  beforeAll(async () => {
    // Register manager
    const managerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Report Manager',
        email: `report-manager-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'manager',
        organizationId: 'test-org',
      }),
    });
    const managerData = await managerRes.json() as { data: { accessToken: string } };
    managerAccessToken = managerData.data.accessToken;

    // Register client
    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Report Client',
        email: `report-client-${Date.now()}@test.com`,
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
        name: 'Report Test Project',
        description: 'Testing reports generation',
        clientId,
        startDate: '2026-07-01',
        endDate: '2026-09-30',
      }),
    });
    const projectData = await projectRes.json() as { data: { id: string } };
    projectId = projectData.data.id;
  });

  describe('GENERATE REPORT', () => {
    it('Manager can generate an AI weekly report', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(201);
      const data = await res.json() as { data: any };
      
      expect(data.data.projectId).toBe(projectId);
      expect(data.data.overallHealthScore).toBeDefined();
      expect(data.data.completedWork).toBeDefined();
      expect(data.data.pendingWork).toBeDefined();
      
      reportId = data.data.id;
    });

    it('Client cannot generate an AI weekly report', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('LIST & GET REPORTS', () => {
    it('Manager can list reports for the project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json() as { data: any[] };
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
      expect(data.data[0].id).toBe(reportId);
    });

    it('Client can list reports for the project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports`, {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json() as { data: any[] };
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Manager can get a specific report by ID', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/reports/${reportId}`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json() as { data: any };
      expect(data.data.id).toBe(reportId);
    });
  });
});
