import type { RequestHandler } from 'express';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Integration tests for Project Management API
 * These tests validate:
 * - Project creation
 * - Project listing with filters
 * - Project detail retrieval
 * - Project updates
 * - Project archiving
 * - Project deletion
 * - Authorization checks
 */

const API_BASE = 'http://localhost:5000/api/v1';

describe('Project Management API', () => {
  let managerAccessToken: string;
  let clientAccessToken: string;
  let managerId: string;
  let clientId: string;
  let projectId: string;

  beforeAll(async () => {
    // Register manager
    const managerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Manager Test',
        email: `manager-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'manager',
        organizationId: 'test-org',
      }),
    });

    const managerData = (await managerRes.json()) as {
      data: {
        user: { id: string };
        accessToken: string;
      };
    };
    managerAccessToken = managerData.data.accessToken;
    managerId = managerData.data.user.id;

    // Register client
    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Client Test',
        email: `client-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'client',
        organizationId: 'test-org',
      }),
    });

    const clientData = (await clientRes.json()) as {
      data: {
        user: { id: string };
        accessToken: string;
      };
    };
    clientAccessToken = clientData.data.accessToken;
    clientId = clientData.data.user.id;
  });

  describe('CREATE PROJECT', () => {
    it('Manager can create a project', async () => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: 'A test project',
          clientId,
          startDate: '2026-06-10',
          endDate: '2026-08-30',
        }),
      });

      expect(res.status).toBe(201);
      const data = (await res.json()) as {
        data: {
          id: string;
          name: string;
          status: string;
          progress: number;
          healthScore: number;
        };
      };
      expect(data.data.name).toBe('Test Project');
      expect(data.data.status).toBe('planning');
      expect(data.data.progress).toBe(0);
      expect(data.data.healthScore).toBe(50);
      projectId = data.data.id;
    });

    it('Client cannot create a project', async () => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Test Project',
          description: 'A test project',
          clientId,
          startDate: '2026-06-10',
          endDate: '2026-08-30',
        }),
      });

      expect(res.status).toBe(403);
    });

    it('Validates required fields', async () => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          name: '',
          description: '',
          clientId: '',
          startDate: '2026-06-10',
          endDate: '2026-08-30',
        }),
      });

      expect(res.status).toBe(400);
    });

    it('Validates date order', async () => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Test',
          description: 'Test',
          clientId: clientId,
          startDate: '2026-08-30',
          endDate: '2026-06-10',
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('GET PROJECT', () => {
    it('Manager can view their own project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          id: string;
          name: string;
        };
      };
      expect(data.data.id).toBe(projectId);
    });

    it('Client cannot view project they are not assigned to', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${clientAccessToken}`,
        },
      });

      expect(res.status).toBe(403);
    });

    it('Returns 404 for nonexistent project', async () => {
      const res = await fetch(`${API_BASE}/projects/nonexistent-id`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(404);
    });
  });

  describe('LIST PROJECTS', () => {
    it('Manager can list their projects', async () => {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          projects: { id: string }[];
          total: number;
          page: number;
          limit: number;
        };
      };
      expect(Array.isArray(data.data.projects)).toBe(true);
      expect(typeof data.data.total).toBe('number');
      expect(typeof data.data.page).toBe('number');
    });

    it('Supports search filtering', async () => {
      const res = await fetch(`${API_BASE}/projects?search=Test`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          projects: { name: string }[];
        };
      };
      // All projects should have 'Test' in their name
      data.data.projects.forEach((p) => {
        expect(p.name.toLowerCase()).toContain('test');
      });
    });

    it('Supports status filtering', async () => {
      const res = await fetch(`${API_BASE}/projects?status=planning`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          projects: { status: string }[];
        };
      };
      data.data.projects.forEach((p) => {
        expect(p.status).toBe('planning');
      });
    });

    it('Supports pagination', async () => {
      const res = await fetch(`${API_BASE}/projects?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          page: number;
          limit: number;
        };
      };
      expect(data.data.page).toBe(1);
      expect(data.data.limit).toBeLessThanOrEqual(10);
    });
  });

  describe('UPDATE PROJECT', () => {
    it('Manager can update their project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Updated Project Name',
          status: 'active',
          progress: 50,
          healthScore: 75,
        }),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          name: string;
          status: string;
          progress: number;
          healthScore: number;
          healthStatus: string;
        };
      };
      expect(data.data.name).toBe('Updated Project Name');
      expect(data.data.status).toBe('active');
      expect(data.data.progress).toBe(50);
      expect(data.data.healthScore).toBe(75);
      expect(data.data.healthStatus).toBe('good');
    });

    it('Validates health score range', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          healthScore: 150, // Invalid: > 100
        }),
      });

      expect(res.status).toBe(400);
    });

    it('Updates health status based on score', async () => {
      // Test excellent (80+)
      let res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({ healthScore: 85 }),
      });

      let data = (await res.json()) as {
        data: { healthStatus: string };
      };
      expect(data.data.healthStatus).toBe('excellent');

      // Test critical (<40)
      res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({ healthScore: 30 }),
      });

      data = (await res.json()) as {
        data: { healthStatus: string };
      };
      expect(data.data.healthStatus).toBe('critical');
    });

    it('Manager cannot update another manager\'s project', async () => {
      // Create another manager
      const anotherRes = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Another Manager',
          email: `manager2-${Date.now()}@test.com`,
          password: 'Password123',
          role: 'manager',
          organizationId: 'test-org',
        }),
      });

      const anotherData = (await anotherRes.json()) as {
        data: {
          accessToken: string;
        };
      };

      const res = await fetch(`${API_BASE}/projects/${projectId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anotherData.data.accessToken}`,
        },
        body: JSON.stringify({ name: 'Hacked!' }),
      });

      expect(res.status).toBe(403);
    });
  });

  describe('ARCHIVE PROJECT', () => {
    it('Manager can archive their project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/archive`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          status: string;
        };
      };
      expect(data.data.status).toBe('archived');
    });
  });

  describe('DELETE PROJECT', () => {
    it('Manager can delete their project', async () => {
      // Create a new project to delete
      const createRes = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Project to Delete',
          description: 'This will be deleted',
          clientId,
          startDate: '2026-06-10',
          endDate: '2026-08-30',
        }),
      });

      const createData = (await createRes.json()) as {
        data: {
          id: string;
        };
      };
      const projectToDeleteId = createData.data.id;

      // Delete it
      const deleteRes = await fetch(`${API_BASE}/projects/${projectToDeleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(deleteRes.status).toBe(204);

      // Verify it's gone
      const getRes = await fetch(`${API_BASE}/projects/${projectToDeleteId}`, {
        headers: {
          Authorization: `Bearer ${managerAccessToken}`,
        },
      });

      expect(getRes.status).toBe(404);
    });
  });

  afterAll(async () => {
    // Cleanup would go here
  });
});
