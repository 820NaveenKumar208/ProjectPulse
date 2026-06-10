import { Router } from 'express';

import { generateReport, getReport, listReports } from '../controllers/reportController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reportRouter = Router({ mergeParams: true });

// All report routes require authentication
reportRouter.use(requireAuth);

// GET /api/v1/projects/:projectId/reports - List all reports for a project
reportRouter.get('/', asyncHandler(listReports));

// POST /api/v1/projects/:projectId/reports - Generate a new report
reportRouter.post('/', asyncHandler(generateReport));

// GET /api/v1/projects/:projectId/reports/:reportId - Get a specific report
reportRouter.get('/:reportId', asyncHandler(getReport));
