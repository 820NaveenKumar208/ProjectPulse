import type { RequestHandler } from 'express';

import { ProjectModel } from '../models/Project.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { CreateProjectInput, UpdateProjectInput, ProjectResponse } from '../types/project.js';
import { badRequest, forbidden, notFound, unauthorized } from '../utils/httpError.js';

function toProjectResponse(doc: any): ProjectResponse {
  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    clientId: doc.clientId,
    managerId: doc.managerId,
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate.toISOString(),
    status: doc.status,
    progress: doc.progress,
    healthScore: doc.healthScore,
    healthStatus: doc.healthStatus,
    shareToken: doc.shareToken,
    shareEnabled: doc.shareEnabled ?? false,
    shareExpiresAt: doc.shareExpiresAt?.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const listProjects: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const page = Math.max(1, Number(request.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(request.query.limit) || 20));
  const search = String(request.query.search ?? '').trim();
  const status = String(request.query.status ?? '').trim();
  const skip = (page - 1) * limit;

  const query: any = {};

  // Managers see only their projects; clients see only assigned projects
  if (authRequest.user.role === 'manager') {
    query.managerId = authRequest.user.id;
  } else if (authRequest.user.role === 'client') {
    query.clientId = authRequest.user.id;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (status && ['planning', 'active', 'paused', 'completed', 'archived'].includes(status)) {
    query.status = status;
  }

  const total = await ProjectModel.countDocuments(query);
  const projects = await ProjectModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  response.status(200).json({
    data: {
      projects: projects.map(toProjectResponse),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getProject: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  const projectId = String(request.params.projectId ?? '').trim();
  if (!projectId) {
    throw badRequest('Project ID is required.');
  }

  const project = await ProjectModel.findById(projectId).lean();
  if (!project) {
    throw notFound('Project not found.');
  }

  // Check authorization: manager can view their projects, clients can view assigned projects
  if (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) {
    throw forbidden('You do not have access to this project.');
  }

  if (authRequest.user.role === 'client' && project.clientId !== authRequest.user.id) {
    throw forbidden('You do not have access to this project.');
  }

  response.status(200).json({
    data: toProjectResponse(project),
  });
};

export const createProject: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  // Only managers can create projects
  if (authRequest.user.role !== 'manager') {
    throw forbidden('Only managers can create projects.');
  }

  const input: CreateProjectInput = request.body;

  // Validate input
  const name = String(input.name ?? '').trim();
  const description = String(input.description ?? '').trim();
  const clientId = String(input.clientId ?? '').trim();
  const startDateStr = String(input.startDate ?? '').trim();
  const endDateStr = String(input.endDate ?? '').trim();

  if (!name) {
    throw badRequest('Project name is required.');
  }

  if (!clientId) {
    throw badRequest('Client ID is required.');
  }

  if (!startDateStr || !endDateStr) {
    throw badRequest('Start date and end date are required.');
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw badRequest('Invalid date format.');
  }

  if (startDate >= endDate) {
    throw badRequest('Start date must be before end date.');
  }

  const project = new ProjectModel({
    name,
    description,
    clientId,
    managerId: authRequest.user.id,
    startDate,
    endDate,
    status: 'planning',
    progress: 0,
    healthScore: 50,
    healthStatus: 'good',
  });

  await project.save();

  response.status(201).json({
    data: toProjectResponse(project),
  });
};

export const updateProject: RequestHandler = async (request, response) => {
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

  // Only the manager who created the project can update it
  if (project.managerId !== authRequest.user.id && authRequest.user.role !== 'admin') {
    throw forbidden('You do not have permission to update this project.');
  }

  const input: UpdateProjectInput = request.body;

  if (input.name !== undefined) {
    const name = String(input.name).trim();
    if (!name) {
      throw badRequest('Project name cannot be empty.');
    }
    project.name = name;
  }

  if (input.description !== undefined) {
    project.description = String(input.description).trim();
  }

  if (input.status !== undefined) {
    if (!['planning', 'active', 'paused', 'completed', 'archived'].includes(input.status)) {
      throw badRequest('Invalid status.');
    }
    project.status = input.status;
  }

  if (input.progress !== undefined) {
    const progress = Number(input.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      throw badRequest('Progress must be a number between 0 and 100.');
    }
    project.progress = progress;
  }

  if (input.healthScore !== undefined) {
    const healthScore = Number(input.healthScore);
    if (isNaN(healthScore) || healthScore < 0 || healthScore > 100) {
      throw badRequest('Health score must be a number between 0 and 100.');
    }
    project.healthScore = healthScore;

    // Update health status based on score
    if (healthScore >= 80) {
      project.healthStatus = 'excellent';
    } else if (healthScore >= 60) {
      project.healthStatus = 'good';
    } else if (healthScore >= 40) {
      project.healthStatus = 'at_risk';
    } else {
      project.healthStatus = 'critical';
    }
  }

  await project.save();

  response.status(200).json({
    data: toProjectResponse(project),
  });
};

export const archiveProject: RequestHandler = async (request, response) => {
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

  // Only the manager who created the project can archive it
  if (project.managerId !== authRequest.user.id && authRequest.user.role !== 'admin') {
    throw forbidden('You do not have permission to archive this project.');
  }

  project.status = 'archived';
  await project.save();

  response.status(200).json({
    data: toProjectResponse(project),
  });
};

export const deleteProject: RequestHandler = async (request, response) => {
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

  // Only the manager who created the project can delete it
  if (project.managerId !== authRequest.user.id && authRequest.user.role !== 'admin') {
    throw forbidden('You do not have permission to delete this project.');
  }

  await ProjectModel.deleteOne({ _id: projectId });

  response.status(204).send();
};
