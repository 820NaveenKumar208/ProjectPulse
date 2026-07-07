import type { RequestHandler } from 'express';

import { UserModel } from '../models/User.js';
import { ProjectModel } from '../models/Project.js';
import { ApprovalModel } from '../models/Approval.js';
import { MilestoneModel } from '../models/Milestone.js';
import { NotificationModel } from '../models/Notification.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import { isUserRole } from '../types/roles.js';
import { badRequest, forbidden } from '../utils/httpError.js';
import * as authService from '../services/authService.js';

/**
 * GET /api/v1/admin/stats
 * Platform-wide statistics for admin dashboard
 */
export const getStats: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user || authRequest.user.role !== 'admin') {
    throw forbidden();
  }

  const [
    totalProjects,
    activeProjects,
    completedProjects,
    totalManagers,
    totalClients,
    pendingApprovals,
    totalMilestones,
    totalReports,
  ] = await Promise.all([
    ProjectModel.countDocuments(),
    ProjectModel.countDocuments({ status: 'active' }),
    ProjectModel.countDocuments({ status: 'completed' }),
    UserModel.countDocuments({ role: 'manager' }),
    UserModel.countDocuments({ role: 'client' }),
    ApprovalModel.countDocuments({ status: 'pending' }),
    MilestoneModel.countDocuments(),
    NotificationModel.countDocuments(),
  ]);

  // Get unique organization IDs
  const organizations = await UserModel.distinct('organizationId');

  response.status(200).json({
    data: {
      totalOrganizations: organizations.length,
      totalProjects,
      activeProjects,
      completedProjects,
      totalManagers,
      totalClients,
      pendingApprovals,
      totalMilestones,
      totalReports,
      platformHealth: activeProjects > 0 ? 'healthy' : 'idle',
    },
  });
};

/**
 * GET /api/v1/admin/users
 * List all users with optional role filter and pagination
 */
export const listUsers: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user || authRequest.user.role !== 'admin') {
    throw forbidden();
  }

  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(request.query.limit) || 20));
  const roleFilter = String(request.query.role ?? '').trim();
  const search = String(request.query.search ?? '').trim();
  const skip = (page - 1) * limit;

  const query: any = {};

  if (roleFilter && isUserRole(roleFilter)) {
    query.role = roleFilter;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await UserModel.countDocuments(query);
  const users = await UserModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  response.status(200).json({
    data: {
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        organizationId: u.organizationId,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * POST /api/v1/admin/users
 * Create a new user (admin-only)
 */
export const createUser: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user || authRequest.user.role !== 'admin') {
    throw forbidden();
  }

  const { name, email, password, role, organizationId } = request.body;

  if (!name || !email || !password || !role || !organizationId) {
    throw badRequest('Name, email, password, role, and organizationId are required.');
  }

  if (!isUserRole(role)) {
    throw badRequest('Role must be admin, manager, or client.');
  }

  const session = await authService.register({
    name,
    email,
    password,
    role,
    organizationId,
  });

  response.status(201).json({
    data: {
      user: session.user,
    },
  });
};

/**
 * GET /api/v1/admin/activity
 * Recent platform-wide activity
 */
export const getActivity: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  if (!authRequest.user || authRequest.user.role !== 'admin') {
    throw forbidden();
  }

  const limit = Math.min(20, Math.max(1, Number(request.query.limit) || 10));

  // Get recent notifications as a proxy for activity
  const recentNotifications = await NotificationModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Get recent approvals
  const recentApprovals = await ApprovalModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const activity = [
    ...recentNotifications.map((n) => ({
      type: 'notification' as const,
      title: n.title,
      message: n.message,
      projectId: n.projectId,
      createdAt: n.createdAt.toISOString(),
    })),
    ...recentApprovals.map((a) => ({
      type: 'approval' as const,
      title: `Approval ${a.status}`,
      message: `Approval record for milestone ${a.milestoneId}`,
      projectId: a.projectId,
      createdAt: a.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  response.status(200).json({
    data: { activity },
  });
};
