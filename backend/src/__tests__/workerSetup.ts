import mongoose from 'mongoose';
import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    const uri = process.env['MONGODB_URI'];
    if (uri) {
      await mongoose.connect(uri);
    } else {
      console.warn('Warning: MONGODB_URI is not set in worker process env.');
    }
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
