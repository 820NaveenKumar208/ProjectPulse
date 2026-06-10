import { Router } from 'express';

import * as shareController from '../controllers/shareController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router({ mergeParams: true });

// Public route — no auth required
// GET /api/v1/public/share/:token
router.get('/share/:token', asyncHandler(shareController.getPublicProject));

export { router as shareRouter };
