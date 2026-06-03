import dotenv from 'dotenv';

dotenv.config();

const fallbackMongoUri = 'mongodb://127.0.0.1:27017/projectpulse';

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.BACKEND_PORT ?? process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI ?? fallbackMongoUri,
  skipDatabaseConnection: process.env.SKIP_DATABASE_CONNECTION === 'true',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
};
