import { Router } from 'express';

import * as adminController from '../controllers/adminController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth);
router.use(requireRole(['admin']));

// GET /api/v1/admin/stats - Platform statistics
router.get('/stats', asyncHandler(adminController.getStats));

// GET /api/v1/admin/users - List all users
router.get('/users', asyncHandler(adminController.listUsers));

// POST /api/v1/admin/users - Create a new user
router.post('/users', asyncHandler(adminController.createUser));

// GET /api/v1/admin/activity - Recent platform activity
router.get('/activity', asyncHandler(adminController.getActivity));

export { router as adminRouter };
