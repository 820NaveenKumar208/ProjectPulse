import { Router } from 'express';

import { authRouter } from './authRoutes.js';

const router = Router();

router.get('/status', (_request, response) => {
  response.status(200).json({
    data: {
      status: 'ok',
      version: 'v1',
    },
  });
});

router.use('/auth', authRouter);

export { router as apiRouter };
