import type { RequestHandler } from 'express';

import { NotificationModel } from '../models/Notification.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import { forbidden, notFound } from '../utils/httpError.js';

export const listNotifications: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  if (!user) throw forbidden();

  const page = parseInt(request.query.page as string) || 1;
  const limit = parseInt(request.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const filter = { userId: user.id };

  const [notifications, total] = await Promise.all([
    NotificationModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    NotificationModel.countDocuments(filter),
  ]);

  response.status(200).json({
    data: notifications.map((n) => ({
      id: n._id.toString(),
      projectId: n.projectId,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      metadata: n.metadata,
      createdAt: n.createdAt.toISOString(),
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getUnreadCount: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  if (!user) throw forbidden();

  const count = await NotificationModel.countDocuments({ userId: user.id, read: false });

  response.status(200).json({
    data: { count },
  });
};

export const markAsRead: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  const { id } = request.params;
  if (!user) throw forbidden();

  const notification = await NotificationModel.findOneAndUpdate(
    { _id: id, userId: user.id },
    { read: true },
    { new: true }
  );

  if (!notification) throw notFound('Notification not found');

  response.status(200).json({
    data: { id: notification._id.toString(), read: notification.read },
  });
};

export const markAllAsRead: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  if (!user) throw forbidden();

  await NotificationModel.updateMany({ userId: user.id, read: false }, { read: true });

  response.status(200).json({
    data: { success: true },
  });
};
