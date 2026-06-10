import { Router } from 'express';

import { authRouter } from './authRoutes.js';
import { projectRouter } from './projectRoutes.js';
import { approvalRouter } from './approvalRoutes.js';
import { shareRouter } from './shareRoutes.js';

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

// Standalone approval routes (e.g. GET /api/v1/approvals/pending for clients)
router.use('/approvals', approvalRouter);

// Public share routes (no auth required)
router.use('/public', shareRouter);

export { router as apiRouter };
