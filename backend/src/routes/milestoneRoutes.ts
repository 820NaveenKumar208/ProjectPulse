import { Router } from 'express';

import * as milestoneController from '../controllers/milestoneController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router({ mergeParams: true });

// All milestone routes require authentication
router.use(requireAuth);

// List milestones (GET /api/v1/projects/:projectId/milestones)
router.get('/', asyncHandler(milestoneController.listMilestones));

// Create milestone (POST /api/v1/projects/:projectId/milestones)
router.post('/', asyncHandler(milestoneController.createMilestone));

// Get milestone (GET /api/v1/milestones/:milestoneId)
router.get('/:milestoneId', asyncHandler(milestoneController.getMilestone));

// Update milestone (PATCH /api/v1/milestones/:milestoneId)
router.patch('/:milestoneId', asyncHandler(milestoneController.updateMilestone));

// Complete milestone (POST /api/v1/milestones/:milestoneId/complete)
router.post('/:milestoneId/complete', asyncHandler(milestoneController.completeMilestone));

// Delete milestone (DELETE /api/v1/milestones/:milestoneId)
router.delete('/:milestoneId', asyncHandler(milestoneController.deleteMilestone));

export { router as milestoneRouter };
