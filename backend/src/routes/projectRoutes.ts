import { Router } from 'express';

import * as projectController from '../controllers/projectController.js';
import * as shareController from '../controllers/shareController.js';
import { milestoneRouter } from './milestoneRoutes.js';
import { approvalRouter } from './approvalRoutes.js';
import { reportRouter } from './reportRoutes.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All project routes require authentication
router.use(requireAuth);

// List projects (GET /api/v1/projects)
router.get('/', asyncHandler(projectController.listProjects));

// Create project (POST /api/v1/projects)
router.post('/', asyncHandler(projectController.createProject));

// Get project (GET /api/v1/projects/:projectId)
router.get('/:projectId', asyncHandler(projectController.getProject));

// Update project (PATCH /api/v1/projects/:projectId)
router.patch('/:projectId', asyncHandler(projectController.updateProject));

// Archive project (POST /api/v1/projects/:projectId/archive)
router.post('/:projectId/archive', asyncHandler(projectController.archiveProject));

// Delete project (DELETE /api/v1/projects/:projectId)
router.delete('/:projectId', asyncHandler(projectController.deleteProject));

// Share link management (authenticated manager routes)
router.post('/:projectId/share-link', asyncHandler(shareController.enableShareLink));
router.post('/:projectId/share-link/rotate', asyncHandler(shareController.rotateShareLink));
router.delete('/:projectId/share-link', asyncHandler(shareController.disableShareLink));

// Milestone routes (nested under projects)
router.use('/:projectId/milestones', milestoneRouter);

// Report routes (nested under projects)
router.use('/:projectId/reports', reportRouter);

// Approval routes (nested under projects/milestones)
router.use('/milestones', approvalRouter);

export { router as projectRouter };

