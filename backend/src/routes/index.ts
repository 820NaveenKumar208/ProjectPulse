import { Router } from 'express';

import { authRouter } from './authRoutes.js';
import { projectRouter } from './projectRoutes.js';

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
router.use('/projects', projectRouter);

export { router as apiRouter };
