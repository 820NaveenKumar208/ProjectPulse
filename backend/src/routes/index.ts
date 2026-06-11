import { Router } from 'express';

import { authRouter } from './authRoutes.js';
import { projectRouter } from './projectRoutes.js';
import { approvalRouter } from './approvalRoutes.js';
import { shareRouter } from './shareRoutes.js';

import { notificationRouter } from './notificationRoutes.js';

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
router.use('/notifications', notificationRouter);

// Standalone approval routes (e.g. GET /api/v1/approvals/pending for clients)
router.use('/approvals', approvalRouter);

// Public share routes (no auth required)
router.use('/public', shareRouter);

export { router as apiRouter };
