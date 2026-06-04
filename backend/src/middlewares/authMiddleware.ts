import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

import * as authService from '../services/authService.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import { unauthorized } from '../utils/httpError.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const requireAuth: RequestHandler = async (request, _response, next) => {
  try {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw unauthorized();
    }

    const tokenUser = verifyAccessToken(token);
    const persistedUser = await authService.getUserById(tokenUser.id);

    if (!persistedUser) {
      throw unauthorized('The authenticated account no longer exists.');
    }

    (request as AuthenticatedRequest).user = persistedUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(unauthorized('Invalid or expired authentication token.'));
      return;
    }

    next(error);
  }
};
