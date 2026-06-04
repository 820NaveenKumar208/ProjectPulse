import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import type { AuthUser } from '../types/auth.js';
import { isUserRole } from '../types/roles.js';
import { unauthorized } from './httpError.js';

type TokenPayload = {
  sub: string;
  name: string;
  email: string;
  role: string;
  organizationId: string;
};

export function createAccessToken(user: AuthUser) {
  const options: SignOptions = {
    expiresIn: env.jwtAccessExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(toPayload(user), env.jwtAccessSecret, options);
}

export function createRefreshToken(user: AuthUser) {
  const options: SignOptions = {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(toPayload(user), env.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
  return fromPayload(payload);
}

export function verifyRefreshToken(token: string): AuthUser {
  const payload = jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
  return fromPayload(payload);
}

function toPayload(user: AuthUser): TokenPayload {
  return {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
}

function fromPayload(payload: TokenPayload): AuthUser {
  if (!payload.sub || !payload.email || !isUserRole(payload.role) || !payload.organizationId) {
    throw unauthorized('Invalid authentication token.');
  }

  return {
    id: payload.sub,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    organizationId: payload.organizationId,
  };
}
