import { Router } from 'express';

import * as approvalController from '../controllers/approvalController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router({ mergeParams: true });

// All approval routes require authentication
router.use(requireAuth);

// Request approval for a milestone (POST /api/v1/milestones/:milestoneId/request-approval)
router.post('/:milestoneId/request-approval', asyncHandler(approvalController.requestApproval));

// Approve a milestone (POST /api/v1/milestones/:milestoneId/approve)
router.post('/:milestoneId/approve', asyncHandler(approvalController.approveMilestone));

// Request changes on a milestone (POST /api/v1/milestones/:milestoneId/request-changes)
router.post('/:milestoneId/request-changes', asyncHandler(approvalController.requestChanges));

// Get approval history for a milestone (GET /api/v1/milestones/:milestoneId/approval-history)
router.get('/:milestoneId/approval-history', asyncHandler(approvalController.getApprovalHistory));

// Get pending approvals for the current user (GET /api/v1/approvals/pending)
router.get('/pending', asyncHandler(approvalController.getPendingApprovals));

export { router as approvalRouter };
