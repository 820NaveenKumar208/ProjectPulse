/**
 * Vitest global setup
 *
 * 1. Starts an in-memory MongoDB instance (MongoMemoryServer).
 * 2. Connects Mongoose to it — satisfies unit-level model tests.
 * 3. Boots the Express HTTP app on the same in-process server on port 5000
 *    so integration tests (projects, share) can make real fetch() calls
 *    against a fully functional API without a separate running backend or
 *    a real MongoDB installation.
 */
import { createServer } from 'node:http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;
let httpServer: ReturnType<typeof createServer>;

export async function setup() {
  // ── 1. Start in-memory MongoDB ─────────────────────────────────────────
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // ── 2. Connect Mongoose (for unit tests that use models directly) ───────
  await mongoose.connect(uri);

  // ── 3. Override env so the Express app also picks up the memory-server URI
  process.env['MONGODB_URI'] = uri;
  process.env['SKIP_DATABASE_CONNECTION'] = 'false';
  process.env['NODE_ENV'] = 'test';
  process.env['JWT_ACCESS_SECRET'] = 'test-access-secret';
  process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret';
  process.env['JWT_ACCESS_EXPIRES_IN'] = '15m';
  process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
  process.env['FRONTEND_ORIGIN'] = 'http://localhost:5173';
  process.env['BACKEND_PORT'] = '5000';

  // ── 4. Boot the Express app (connects its own mongoose instance) ────────
  //    Import app lazily so env vars are set first.
  const { connectToDatabase } = await import('../config/database.js');
  await connectToDatabase();

  const { app } = await import('../app.js');

  httpServer = createServer(app);

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(5000, '127.0.0.1', () => resolve());
    httpServer.once('error', reject);
  });
}

export async function teardown() {
  await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  await mongoose.disconnect();
  await mongod.stop();
}

