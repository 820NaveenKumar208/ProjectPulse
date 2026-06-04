import type { Request } from 'express';

import type { UserRole } from './roles.js';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
};

export type AuthenticatedRequest = Request & {
  user?: AuthUser;
};
