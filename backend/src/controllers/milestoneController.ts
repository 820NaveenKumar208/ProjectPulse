import type { RequestHandler } from 'express';

import { MilestoneModel } from '../models/Milestone.js';
import { ProjectModel } from '../models/Project.js';
import { NotificationService } from '../services/notificationService.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { CreateMilestoneInput, UpdateMilestoneInput, MilestoneResponse } from '../types/milestone.js';
import { badRequest, forbidden, notFound, unauthorized } from '../utils/httpError.js';

function toMilestoneResponse(doc: any): MilestoneResponse {
  return {
    id: doc._id.toString(),
    projectId: doc.projectId,
    title: doc.title,
    description: doc.description,
    status: doc.status,
    dueDate: doc.dueDate.toISOString(),
    completionPercentage: doc.completionPercentage,
    order: doc.order,
    createdBy: doc.createdBy,
    updatedBy: doc.updatedBy,
    approvalStatus: doc.approvalStatus,
    approvalRequestedAt: doc.approvalRequestedAt?.toISOString(),
    approvalRequestedBy: doc.approvalRequestedBy,
    lastApprovedAt: doc.lastApprovedAt?.toISOString(),
    approvedBy: doc.approvedBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const listMilestones: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const projectId = String(request.params.projectId ?? '').trim();
  if (!projectId) {
    throw badRequest('Project ID is required.');
  }

  // Verify project exists and user has access
  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    throw notFound('Project not found.');
  }

  // Check authorization
  if (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) {
    throw forbidden('You do not have access to this project.');
  }

  if (authRequest.user.role === 'client' && project.clientId !== authRequest.user.id) {
    throw forbidden('You do not have access to this project.');
  }

  const milestones = await MilestoneModel.find({ projectId })
    .sort({ order: 1 })
    .lean();

  response.status(200).json({
    data: {
      milestones: milestones.map(toMilestoneResponse),
      total: milestones.length,
    },
  });
};

export const getMilestone: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const milestoneId = String(request.params.milestoneId ?? '').trim();
  if (!milestoneId) {
    throw badRequest('Milestone ID is required.');
  }

  const milestone = await MilestoneModel.findById(milestoneId).lean();
  if (!milestone) {
    throw notFound('Milestone not found.');
  }

  // Verify project exists and user has access
  const project = await ProjectModel.findById(milestone.projectId).lean();
  if (!project) {
    throw notFound('Project not found.');
  }

  // Check authorization
  if (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) {
    throw forbidden('You do not have access to this milestone.');
  }

  if (authRequest.user.role === 'client' && project.clientId !== authRequest.user.id) {
    throw forbidden('You do not have access to this milestone.');
  }

  response.status(200).json({
    data: toMilestoneResponse(milestone),
  });
};

export const createMilestone: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  // Only managers can create milestones
  if (authRequest.user.role !== 'manager') {
    throw forbidden('Only managers can create milestones.');
  }

  const projectId = String(request.params.projectId ?? '').trim();
  if (!projectId) {
    throw badRequest('Project ID is required.');
  }

  // Verify project exists and user owns it
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (project.managerId !== authRequest.user.id) {
    throw forbidden('You do not have permission to add milestones to this project.');
  }

  const input: CreateMilestoneInput = request.body;

  // Validate input
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const dueDateStr = String(input.dueDate ?? '').trim();

  if (!title) {
    throw badRequest('Milestone title is required.');
  }

  if (!dueDateStr) {
    throw badRequest('Due date is required.');
  }

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) {
    throw badRequest('Invalid date format.');
  }

  // Get the next order number
  const lastMilestone = await MilestoneModel.findOne({ projectId }).sort({ order: -1 }).lean();
  const order = (lastMilestone?.order ?? -1) + 1;

  const milestone = new MilestoneModel({
    projectId,
    title,
    description,
    dueDate,
    order,
    createdBy: authRequest.user.id,
    updatedBy: authRequest.user.id,
    status: 'not_started',
    completionPercentage: 0,
  });

  await milestone.save();

  response.status(201).json({
    data: toMilestoneResponse(milestone),
  });
};

export const updateMilestone: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const milestoneId = String(request.params.milestoneId ?? '').trim();
  if (!milestoneId) {
    throw badRequest('Milestone ID is required.');
  }

  const milestone = await MilestoneModel.findById(milestoneId);
  if (!milestone) {
    throw notFound('Milestone not found.');
  }

  // Verify project exists and user owns it
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  // Only the manager who created the project can update milestones
  if (
    (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) ||
    authRequest.user.role === 'client'
  ) {
    throw forbidden('You do not have permission to update this milestone.');
  }

  const input: UpdateMilestoneInput = request.body;

  if (input.title !== undefined) {
    const title = String(input.title).trim();
    if (!title) {
      throw badRequest('Milestone title cannot be empty.');
    }
    milestone.title = title;
  }

  if (input.description !== undefined) {
    milestone.description = String(input.description).trim();
  }

  if (input.dueDate !== undefined) {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      throw badRequest('Invalid date format.');
    }
    milestone.dueDate = dueDate;
  }

  const wasNotCompleted = milestone.status !== 'completed';

  if (input.status !== undefined) {
    const validStatuses = [
      'not_started',
      'in_progress',
      'ready_for_approval',
      'approved',
      'changes_requested',
      'completed',
      'delayed',
    ];
    if (!validStatuses.includes(input.status)) {
      throw badRequest('Invalid status.');
    }
    milestone.status = input.status;
  }

  if (input.completionPercentage !== undefined) {
    const percentage = Number(input.completionPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      throw badRequest('Completion percentage must be a number between 0 and 100.');
    }
    milestone.completionPercentage = percentage;
  }

  if (input.order !== undefined) {
    milestone.order = Number(input.order);
  }

  milestone.updatedBy = authRequest.user.id;
  await milestone.save();

  if (wasNotCompleted && milestone.status === 'completed') {
    // Notify the other party about the milestone completion
    await NotificationService.notifyMilestoneCompleted(milestone, project, authRequest.user.id).catch(console.error);
  }

  response.status(200).json({
    data: toMilestoneResponse(milestone),
  });
};

export const deleteMilestone: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const milestoneId = String(request.params.milestoneId ?? '').trim();
  if (!milestoneId) {
    throw badRequest('Milestone ID is required.');
  }

  const milestone = await MilestoneModel.findById(milestoneId);
  if (!milestone) {
    throw notFound('Milestone not found.');
  }

  // Verify project exists and user owns it
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  // Only the manager who created the project can delete milestones
  if (
    (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) ||
    authRequest.user.role === 'client'
  ) {
    throw forbidden('You do not have permission to delete this milestone.');
  }

  await MilestoneModel.deleteOne({ _id: milestoneId });

  // Reorder remaining milestones
  const remainingMilestones = await MilestoneModel.find({ projectId: milestone.projectId }).sort({
    order: 1,
  });
  for (let i = 0; i < remainingMilestones.length; i++) {
    remainingMilestones[i].order = i;
    await remainingMilestones[i].save();
  }

  response.status(204).send();
};

export const completeMilestone: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const milestoneId = String(request.params.milestoneId ?? '').trim();
  if (!milestoneId) {
    throw badRequest('Milestone ID is required.');
  }

  const milestone = await MilestoneModel.findById(milestoneId);
  if (!milestone) {
    throw notFound('Milestone not found.');
  }

  // Verify project exists and user owns it
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  // Only the manager who created the project can mark milestones complete
  if (
    (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) ||
    authRequest.user.role === 'client'
  ) {
    throw forbidden('You do not have permission to update this milestone.');
  }

  const wasNotCompleted = milestone.status !== 'completed';

  milestone.status = 'completed';
  milestone.completionPercentage = 100;
  milestone.updatedBy = authRequest.user.id;
  await milestone.save();

  if (wasNotCompleted) {
    await NotificationService.notifyMilestoneCompleted(milestone, project, authRequest.user.id).catch(console.error);
  }

  response.status(200).json({
    data: toMilestoneResponse(milestone),
  });
};
