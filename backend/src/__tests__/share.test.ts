import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Integration tests for Public Share Links
 * These tests validate:
 * - Share link generation (secure token)
 * - Public project view via /public/share/:token (no auth required)
 * - Read-only access enforcement
 * - Share link rotation (new token)
 * - Share link disabling (revoke access)
 * - Expired link handling
 * - Invalid token rejection
 * - Authorization: only the project manager can manage share links
 */

const API_BASE = 'http://127.0.0.1:5000/api/v1';

describe('Public Share Links', () => {
  let managerAccessToken: string;
  let otherManagerToken: string;
  let clientAccessToken: string;
  let clientId: string;
  let projectId: string;
  let shareToken: string;

  beforeAll(async () => {
    // Register manager
    const managerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Share Manager',
        email: `share-manager-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'manager',
        organizationId: 'test-org',
      }),
    });

    const managerData = (await managerRes.json()) as {
      data: { user: { id: string }; accessToken: string };
    };
    managerAccessToken = managerData.data.accessToken;

    // Register a second manager (should not be able to manage another's share link)
    const otherManagerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Other Manager',
        email: `other-manager-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'manager',
        organizationId: 'test-org',
      }),
    });
    const otherManagerData = (await otherManagerRes.json()) as {
      data: { accessToken: string };
    };
    otherManagerToken = otherManagerData.data.accessToken;

    // Register client
    const clientRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Share Client',
        email: `share-client-${Date.now()}@test.com`,
        password: 'Password123',
        role: 'client',
        organizationId: 'test-org',
      }),
    });
    const clientData = (await clientRes.json()) as {
      data: { user: { id: string }; accessToken: string };
    };
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
        name: 'Share Test Project',
        description: 'A project to test share links',
        clientId,
        startDate: '2026-07-01',
        endDate: '2026-09-30',
      }),
    });

    const projectData = (await projectRes.json()) as {
      data: { id: string };
    };
    projectId = projectData.data.id;
  });

  // ─── ENABLE SHARE LINK ─────────────────────────────────────────────────────

  describe('ENABLE SHARE LINK', () => {
    it('Manager can enable a share link for their project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          shareToken: string;
          shareEnabled: boolean;
          shareUrl: string;
        };
      };
      expect(data.data.shareEnabled).toBe(true);
      expect(typeof data.data.shareToken).toBe('string');
      expect(data.data.shareToken.length).toBeGreaterThan(0);
      expect(data.data.shareUrl).toContain('/share/');
      shareToken = data.data.shareToken;
    });

    it('Token is a hex string of sufficient length (≥ 40 chars)', () => {
      // crypto.randomBytes(20).toString('hex') → 40 hex chars
      expect(shareToken).toMatch(/^[0-9a-f]+$/);
      expect(shareToken.length).toBeGreaterThanOrEqual(40);
    });

    it('Unauthenticated request cannot enable a share link', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(401);
    });

    it('A different manager cannot enable a share link on another manager\'s project', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otherManagerToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(403);
    });

    it('Client cannot enable a share link', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientAccessToken}`,
        },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(403);
    });
  });

  // ─── PUBLIC PROJECT VIEW ───────────────────────────────────────────────────

  describe('PUBLIC PROJECT VIEW (no auth required)', () => {
    it('Anyone can access the public project view with a valid token', async () => {
      const res = await fetch(`${API_BASE}/public/share/${shareToken}`);

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: {
          id: string;
          name: string;
          status: string;
          progress: number;
          healthScore: number;
          healthStatus: string;
          startDate: string;
          endDate: string;
          milestones: unknown[];
        };
      };
      expect(data.data.id).toBe(projectId);
      expect(data.data.name).toBe('Share Test Project');
      expect(data.data.status).toBe('planning');
      expect(typeof data.data.progress).toBe('number');
      expect(typeof data.data.healthScore).toBe('number');
      expect(typeof data.data.healthStatus).toBe('string');
      expect(typeof data.data.startDate).toBe('string');
      expect(typeof data.data.endDate).toBe('string');
      expect(Array.isArray(data.data.milestones)).toBe(true);
    });

    it('Returns 404 for an invalid / unknown token', async () => {
      const res = await fetch(`${API_BASE}/public/share/invalidtokenxyz000`);
      expect(res.status).toBe(404);
    });

    it('Public view does NOT expose sensitive fields (clientId, managerId, shareToken)', async () => {
      const res = await fetch(`${API_BASE}/public/share/${shareToken}`);
      const data = (await res.json()) as { data: Record<string, unknown> };
      expect(data.data.clientId).toBeUndefined();
      expect(data.data.managerId).toBeUndefined();
      expect(data.data.shareToken).toBeUndefined();
    });

    it('Public view includes milestones with safe fields only', async () => {
      // Add a milestone first so we can inspect it
      await fetch(`${API_BASE}/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          title: 'Public Milestone',
          description: 'Visible in public view',
          dueDate: '2026-08-15',
          order: 0,
        }),
      });

      const res = await fetch(`${API_BASE}/public/share/${shareToken}`);
      const data = (await res.json()) as {
        data: {
          milestones: Array<{
            id: string;
            title: string;
            status: string;
            dueDate: string;
            completionPercentage: number;
            order: number;
          }>;
        };
      };
      expect(data.data.milestones.length).toBeGreaterThan(0);
      const m = data.data.milestones[0];
      expect(typeof m.id).toBe('string');
      expect(typeof m.title).toBe('string');
      expect(typeof m.status).toBe('string');
      expect(typeof m.dueDate).toBe('string');
      expect(typeof m.completionPercentage).toBe('number');
      expect(typeof m.order).toBe('number');
    });
  });

  // ─── SHARE LINK EXPIRY ─────────────────────────────────────────────────────

  describe('SHARE LINK EXPIRY', () => {
    let expiredProjectId: string;
    let expiredToken: string;

    beforeAll(async () => {
      // Create a fresh project for expiry test
      const pRes = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({
          name: 'Expiry Test Project',
          description: 'For testing expired share links',
          clientId,
          startDate: '2026-07-01',
          endDate: '2026-09-30',
        }),
      });
      const pData = (await pRes.json()) as { data: { id: string } };
      expiredProjectId = pData.data.id;

      // Enable share link with a past expiry date — this should be rejected by the API
      // so instead we test a future date and verify the field is stored
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const slRes = await fetch(`${API_BASE}/projects/${expiredProjectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({ expiresAt: futureDate }),
      });
      const slData = (await slRes.json()) as {
        data: { shareToken: string; shareExpiresAt: string };
      };
      expiredToken = slData.data.shareToken;
    });

    it('Rejects enabling a share link with a past expiry date', async () => {
      const pastDate = new Date(Date.now() - 1000).toISOString(); // 1s in the past
      const res = await fetch(`${API_BASE}/projects/${expiredProjectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({ expiresAt: pastDate }),
      });
      expect(res.status).toBe(400);
    });

    it('Active link with future expiry is accessible', async () => {
      const res = await fetch(`${API_BASE}/public/share/${expiredToken}`);
      expect(res.status).toBe(200);
    });

    it('Enables share link with valid expiry date and stores shareExpiresAt', async () => {
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const res = await fetch(`${API_BASE}/projects/${expiredProjectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({ expiresAt: future }),
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: { shareExpiresAt: string };
      };
      expect(data.data.shareExpiresAt).toBeDefined();
      expect(new Date(data.data.shareExpiresAt).getTime()).toBeGreaterThan(Date.now());
    });
  });

  // ─── ROTATE SHARE LINK ─────────────────────────────────────────────────────

  describe('ROTATE SHARE LINK', () => {
    let oldToken: string;

    beforeAll(() => {
      oldToken = shareToken;
    });

    it('Manager can rotate (regenerate) the share token', async () => {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/share-link/rotate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${managerAccessToken}`,
          },
        },
      );

      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: { shareToken: string; shareEnabled: boolean; shareUrl: string };
      };
      expect(data.data.shareEnabled).toBe(true);
      expect(data.data.shareToken).not.toBe(oldToken);
      expect(data.data.shareToken.length).toBeGreaterThanOrEqual(40);
      shareToken = data.data.shareToken; // update for subsequent tests
    });

    it('Old token is no longer valid after rotation', async () => {
      const res = await fetch(`${API_BASE}/public/share/${oldToken}`);
      expect(res.status).toBe(404);
    });

    it('New token is valid and returns project data', async () => {
      const res = await fetch(`${API_BASE}/public/share/${shareToken}`);
      expect(res.status).toBe(200);
    });

    it('Another manager cannot rotate a share link', async () => {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/share-link/rotate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${otherManagerToken}`,
          },
        },
      );
      expect(res.status).toBe(403);
    });

    it('Unauthenticated request cannot rotate a share link', async () => {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/share-link/rotate`,
        { method: 'POST' },
      );
      expect(res.status).toBe(401);
    });
  });

  // ─── DISABLE SHARE LINK ────────────────────────────────────────────────────

  describe('DISABLE SHARE LINK', () => {
    it('Another manager cannot disable a share link', async () => {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/share-link`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${otherManagerToken}` },
        },
      );
      expect(res.status).toBe(403);
    });

    it('Unauthenticated request cannot disable a share link', async () => {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/share-link`,
        { method: 'DELETE' },
      );
      expect(res.status).toBe(401);
    });

    it('Manager can disable their share link', async () => {
      const res = await fetch(
        `${API_BASE}/projects/${projectId}/share-link`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${managerAccessToken}` },
        },
      );
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: { shareEnabled: boolean };
      };
      expect(data.data.shareEnabled).toBe(false);
    });

    it('Disabled token is no longer publicly accessible', async () => {
      const res = await fetch(`${API_BASE}/public/share/${shareToken}`);
      expect(res.status).toBe(404);
    });

    it('Can re-enable a previously disabled share link (generates new token)', async () => {
      const res = await fetch(`${API_BASE}/projects/${projectId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managerAccessToken}`,
        },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(200);
      const data = (await res.json()) as {
        data: { shareToken: string; shareEnabled: boolean };
      };
      expect(data.data.shareEnabled).toBe(true);
      expect(data.data.shareToken).not.toBe(shareToken); // fresh token
    });
  });

  // ─── EDGE CASES ────────────────────────────────────────────────────────────

  describe('EDGE CASES', () => {
    it('Returns 404 for an empty token path segment', async () => {
      const res = await fetch(`${API_BASE}/public/share/`);
      // This will hit a different route or 404, not a 200
      expect(res.status).not.toBe(200);
    });

    it('Returns 404 for a very long invalid token', async () => {
      const fakeToken = 'a'.repeat(100);
      const res = await fetch(`${API_BASE}/public/share/${fakeToken}`);
      expect(res.status).toBe(404);
    });

    it('Returns 404 for a nonexistent project ID in share-link endpoints', async () => {
      const res = await fetch(
        `${API_BASE}/projects/000000000000000000000000/share-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${managerAccessToken}`,
          },
          body: JSON.stringify({}),
        },
      );
      expect(res.status).toBe(404);
    });
  });

  afterAll(async () => {
    // Cleanup — nothing required; test DB is ephemeral
  });
});
