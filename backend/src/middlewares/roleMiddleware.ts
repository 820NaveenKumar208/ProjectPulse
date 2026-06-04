import type { RequestHandler } from 'express';

import type { AuthenticatedRequest } from '../types/auth.js';
import type { UserRole } from '../types/roles.js';
import { forbidden, unauthorized } from '../utils/httpError.js';

export function requireRole(allowedRoles: UserRole[]): RequestHandler {
  return (request, _response, next) => {
    const user = (request as AuthenticatedRequest).user;

    if (!user) {
      next(unauthorized());
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(forbidden());
      return;
    }

    next();
  };
}
