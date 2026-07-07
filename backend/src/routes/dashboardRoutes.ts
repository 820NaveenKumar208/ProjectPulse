import { Router } from 'express';

import { getDashboard } from '../controllers/dashboardController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth);

// GET /api/v1/dashboard - Role-specific dashboard data
router.get('/', asyncHandler(getDashboard));

export { router as dashboardRouter };
