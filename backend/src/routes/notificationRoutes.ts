import { Router } from 'express';

import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get('/', asyncHandler(listNotifications));
notificationRouter.get('/unread-count', asyncHandler(getUnreadCount));
notificationRouter.patch('/read-all', asyncHandler(markAllAsRead));
notificationRouter.patch('/:id/read', asyncHandler(markAsRead));
