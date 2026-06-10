import crypto from 'node:crypto';
import type { RequestHandler } from 'express';

import { MilestoneModel } from '../models/Milestone.js';
import { ProjectModel } from '../models/Project.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { EnableShareInput, PublicProjectView } from '../types/project.js';
import { badRequest, forbidden, notFound, unauthorized } from '../utils/httpError.js';

function generateShareToken(): string {
  return crypto.randomBytes(20).toString('hex');
}

export const enableShareLink: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const projectId = String(request.params.projectId ?? '').trim();
  if (!projectId) {
    throw badRequest('Project ID is required.');
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (project.managerId !== authRequest.user.id && authRequest.user.role !== 'admin') {
    throw forbidden('Only the project manager can manage share links.');
  }

  const input: EnableShareInput = request.body;

  let shareExpiresAt: Date | undefined;
  if (input.expiresAt) {
    shareExpiresAt = new Date(input.expiresAt);
    if (isNaN(shareExpiresAt.getTime())) {
      throw badRequest('Invalid expiry date format.');
    }
    if (shareExpiresAt <= new Date()) {
      throw badRequest('Expiry date must be in the future.');
    }
  }

  project.shareToken = generateShareToken();
  project.shareEnabled = true;
  if (shareExpiresAt) {
    project.shareExpiresAt = shareExpiresAt;
  }
  await project.save();

  response.status(200).json({
    data: {
      shareToken: project.shareToken,
      shareEnabled: project.shareEnabled,
      shareExpiresAt: project.shareExpiresAt?.toISOString(),
      shareUrl: `/share/${project.shareToken}`,
    },
  });
};

export const rotateShareLink: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const projectId = String(request.params.projectId ?? '').trim();
  if (!projectId) {
    throw badRequest('Project ID is required.');
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (project.managerId !== authRequest.user.id && authRequest.user.role !== 'admin') {
    throw forbidden('Only the project manager can rotate share links.');
  }

  project.shareToken = generateShareToken();
  project.shareEnabled = true;
  await project.save();

  response.status(200).json({
    data: {
      shareToken: project.shareToken,
      shareEnabled: project.shareEnabled,
      shareExpiresAt: project.shareExpiresAt?.toISOString(),
      shareUrl: `/share/${project.shareToken}`,
    },
  });
};

export const disableShareLink: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const projectId = String(request.params.projectId ?? '').trim();
  if (!projectId) {
    throw badRequest('Project ID is required.');
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (project.managerId !== authRequest.user.id && authRequest.user.role !== 'admin') {
    throw forbidden('Only the project manager can disable share links.');
  }

  project.shareToken = undefined;
  project.shareEnabled = false;
  project.shareExpiresAt = undefined;
  await project.save();

  response.status(200).json({
    data: {
      shareEnabled: false,
    },
  });
};

export const getPublicProject: RequestHandler = async (request, response) => {
  const token = String(request.params.token ?? '').trim();
  if (!token) {
    throw badRequest('Share token is required.');
  }

  const project = await ProjectModel.findOne({ shareToken: token, shareEnabled: true }).lean();
  if (!project) {
    throw notFound('This share link is not valid or has been disabled.');
  }

  // Check expiry
  if (project.shareExpiresAt && new Date(project.shareExpiresAt) < new Date()) {
    throw notFound('This share link has expired.');
  }

  // Fetch milestones (public-safe fields only)
  const milestones = await MilestoneModel.find({ projectId: project._id.toString() })
    .sort({ order: 1 })
    .lean();

  const publicView: PublicProjectView = {
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    status: project.status,
    progress: project.progress,
    healthScore: project.healthScore,
    healthStatus: project.healthStatus,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate.toISOString(),
    milestones: milestones.map((m) => ({
      id: m._id.toString(),
      title: m.title,
      description: m.description,
      status: m.status,
      dueDate: m.dueDate.toISOString(),
      completionPercentage: m.completionPercentage,
      order: m.order,
      approvalStatus: m.approvalStatus,
      lastApprovedAt: m.lastApprovedAt?.toISOString(),
    })),
  };

  response.status(200).json({
    data: publicView,
  });
};
