import mongoose from 'mongoose';

import { env } from './env.js';

export async function connectToDatabase() {
  if (env.skipDatabaseConnection) {
    console.warn('MongoDB connection skipped by SKIP_DATABASE_CONNECTION=true');
    return;
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error', error);
  });

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
}
