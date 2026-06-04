import { Router } from 'express';

import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.post('/forgot-password', asyncHandler(authController.forgotPassword));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.get(
  '/admin-check',
  requireAuth,
  requireRole(['admin']),
  asyncHandler(authController.adminCheck),
);

export { router as authRouter };
