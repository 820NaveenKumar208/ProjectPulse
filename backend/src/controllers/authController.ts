import type { RequestHandler } from 'express';

import type { AuthenticatedRequest } from '../types/auth.js';
import { forbidden, unauthorized } from '../utils/httpError.js';
import * as authService from '../services/authService.js';

export const register: RequestHandler = async (request, response) => {
  const session = await authService.register(request.body);
  response.status(201).json({ data: session });
};

export const login: RequestHandler = async (request, response) => {
  const session = await authService.login(request.body);
  response.status(200).json({ data: session });
};

export const refresh: RequestHandler = async (request, response) => {
  const refreshToken = String(request.body?.refreshToken ?? '');
  const session = await authService.refreshSession(refreshToken);
  response.status(200).json({ data: session });
};

export const logout: RequestHandler = async (request, response) => {
  const refreshToken =
    typeof request.body?.refreshToken === 'string' ? request.body.refreshToken : undefined;

  await authService.logout(refreshToken);
  response.status(204).send();
};

export const forgotPassword: RequestHandler = async (_request, response) => {
  response.status(202).json({
    data: {
      status: 'accepted',
    },
  });
};

export const me: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  response.status(200).json({
    data: {
      user: authRequest.user,
    },
  });
};

export const adminCheck: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw forbidden();
  }

  response.status(200).json({
    data: {
      status: 'ok',
      role: authRequest.user.role,
    },
  });
};
