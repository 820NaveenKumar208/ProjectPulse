import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

import { env } from '../config/env.js';
import { UserModel, type UserDocument, type UserEntity } from '../models/User.js';
import type { AuthUser } from '../types/auth.js';
import { isUserRole } from '../types/roles.js';
import { badRequest, conflict, unauthorized } from '../utils/httpError.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: unknown;
  organizationId: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type StoredUser = Omit<UserEntity, 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

const devUsers = new Map<string, StoredUser>();

export async function register(input: RegisterInput) {
  const normalized = normalizeRegistration(input);
  const passwordHash = await bcrypt.hash(normalized.password, 12);

  const existingUser = await findUserByEmail(normalized.email);
  if (existingUser) {
    throw conflict('An account with this email already exists.');
  }

  const user = await createUser({
    name: normalized.name,
    email: normalized.email,
    password: passwordHash,
    role: normalized.role,
    organizationId: normalized.organizationId,
    refreshTokenHashes: [],
  });

  return issueSession(user);
}

export async function login(input: LoginInput) {
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase();
  const password = String(input.password ?? '');

  if (!email || !password) {
    throw badRequest('Email and password are required.');
  }

  const user = await findUserByEmailWithPassword(email);
  if (!user) {
    throw unauthorized('Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw unauthorized('Invalid email or password.');
  }

  return issueSession(user);
}

export async function refreshSession(refreshToken: string) {
  if (!refreshToken) {
    throw unauthorized('Refresh token is required.');
  }

  const tokenUser = verifyRefreshToken(refreshToken);
  const user = await findUserByIdWithTokens(tokenUser.id);

  if (!user) {
    throw unauthorized('Refresh token is no longer valid.');
  }

  const matchedHash = await findMatchingTokenHash(refreshToken, user.refreshTokenHashes);
  if (!matchedHash) {
    throw unauthorized('Refresh token is no longer valid.');
  }

  const nextSession = createSession(toAuthUser(user));
  const nextHash = await bcrypt.hash(nextSession.refreshToken, 12);
  const remainingHashes = user.refreshTokenHashes.filter((hash) => hash !== matchedHash);
  await replaceRefreshTokenHashes(user._id.toString(), [...remainingHashes, nextHash]);

  return nextSession;
}

export async function logout(refreshToken: string | undefined) {
  if (!refreshToken) {
    return;
  }

  const tokenUser = verifyRefreshToken(refreshToken);
  const user = await findUserByIdWithTokens(tokenUser.id);

  if (!user) {
    return;
  }

  const matchedHash = await findMatchingTokenHash(refreshToken, user.refreshTokenHashes);
  if (!matchedHash) {
    return;
  }

  await replaceRefreshTokenHashes(
    user._id.toString(),
    user.refreshTokenHashes.filter((hash) => hash !== matchedHash),
  );
}

export async function getUserById(userId: string) {
  const user = await findUserById(userId);
  return user ? toAuthUser(user) : null;
}

function normalizeRegistration(input: RegisterInput) {
  const name = String(input.name ?? '').trim();
  const email = String(input.email ?? '')
    .trim()
    .toLowerCase();
  const password = String(input.password ?? '');
  const organizationId = String(input.organizationId ?? '').trim();

  if (!name || !email || !password || !organizationId) {
    throw badRequest('Name, email, password, and organization are required.');
  }

  if (password.length < 8) {
    throw badRequest('Password must be at least 8 characters.');
  }

  if (!isUserRole(input.role)) {
    throw badRequest('Role must be admin, manager, or client.');
  }

  return {
    name,
    email,
    password,
    role: input.role,
    organizationId,
  };
}

async function issueSession(user: UserDocument | StoredUser) {
  const session = createSession(toAuthUser(user));
  const refreshTokenHash = await bcrypt.hash(session.refreshToken, 12);
  await addRefreshTokenHash(user._id.toString(), refreshTokenHash);
  return session;
}

function createSession(user: AuthUser) {
  return {
    user,
    accessToken: createAccessToken(user),
    refreshToken: createRefreshToken(user),
  };
}

function toAuthUser(user: UserDocument | StoredUser): AuthUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId,
  };
}

async function findMatchingTokenHash(refreshToken: string, hashes: string[]) {
  for (const hash of hashes) {
    if (await bcrypt.compare(refreshToken, hash)) {
      return hash;
    }
  }

  return null;
}

async function createUser(input: Omit<UserEntity, 'createdAt' | 'updatedAt'>) {
  if (env.skipDatabaseConnection) {
    const now = new Date();
    const user: StoredUser = {
      _id: crypto.randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    devUsers.set(user.email, user);
    return user;
  }

  return UserModel.create(input);
}

async function findUserByEmail(email: string) {
  if (env.skipDatabaseConnection) {
    return devUsers.get(email) ?? null;
  }

  return UserModel.findOne({ email });
}

async function findUserByEmailWithPassword(email: string) {
  if (env.skipDatabaseConnection) {
    return devUsers.get(email) ?? null;
  }

  return UserModel.findOne({ email }).select('+password +refreshTokenHashes');
}

async function findUserById(userId: string) {
  if (env.skipDatabaseConnection) {
    return findDevUserById(userId);
  }

  return UserModel.findById(userId);
}

async function findUserByIdWithTokens(userId: string) {
  if (env.skipDatabaseConnection) {
    return findDevUserById(userId);
  }

  return UserModel.findById(userId).select('+password +refreshTokenHashes');
}

async function addRefreshTokenHash(userId: string, refreshTokenHash: string) {
  if (env.skipDatabaseConnection) {
    const user = findDevUserById(userId);
    if (user) {
      user.refreshTokenHashes.push(refreshTokenHash);
      user.updatedAt = new Date();
    }
    return;
  }

  await UserModel.findByIdAndUpdate(userId, {
    $push: {
      refreshTokenHashes: refreshTokenHash,
    },
  });
}

async function replaceRefreshTokenHashes(userId: string, refreshTokenHashes: string[]) {
  if (env.skipDatabaseConnection) {
    const user = findDevUserById(userId);
    if (user) {
      user.refreshTokenHashes = refreshTokenHashes;
      user.updatedAt = new Date();
    }
    return;
  }

  await UserModel.findByIdAndUpdate(userId, {
    refreshTokenHashes,
  });
}

function findDevUserById(userId: string) {
  for (const user of devUsers.values()) {
    if (user._id === userId) {
      return user;
    }
  }

  return null;
}
