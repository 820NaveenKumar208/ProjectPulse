import { createServer } from 'node:http';

import { app } from './app.js';
import { connectToDatabase } from './config/database.js';
import { env } from './config/env.js';

const server = createServer(app);

async function bootstrap() {
  await connectToDatabase();

  server.listen(env.port, () => {
    console.log(`ProjectPulse API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start ProjectPulse API', error);
  process.exit(1);
});
