import type { RequestHandler } from 'express';

import { MilestoneModel } from '../models/Milestone.js';
import { ProjectModel } from '../models/Project.js';
import { ApprovalModel } from '../models/Approval.js';
import { NotificationService } from '../services/notificationService.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import type { ApprovalRequestInput, ApprovalResponseInput, ApprovalRecordResponse } from '../types/milestone.js';
import { badRequest, forbidden, notFound, unauthorized } from '../utils/httpError.js';

function toApprovalResponse(doc: any): ApprovalRecordResponse {
  return {
    id: doc._id.toString(),
    milestoneId: doc.milestoneId,
    projectId: doc.projectId,
    requestedBy: doc.requestedBy,
    requestedAt: doc.requestedAt.toISOString(),
    status: doc.status,
    respondedBy: doc.respondedBy,
    respondedAt: doc.respondedAt?.toISOString(),
    comment: doc.comment,
    reason: doc.reason,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export const requestApproval: RequestHandler = async (request, response) => {
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

  // Verify project exists and user is the manager
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (authRequest.user.role !== 'manager' || project.managerId !== authRequest.user.id) {
    throw forbidden('Only the project manager can request approval.');
  }

  // Mark milestone as ready for approval
  milestone.status = 'ready_for_approval';
  milestone.approvalStatus = 'pending_approval';
  milestone.approvalRequestedAt = new Date();
  milestone.approvalRequestedBy = authRequest.user.id;
  milestone.updatedBy = authRequest.user.id;
  await milestone.save();

  // Create approval record
  const input: ApprovalRequestInput = request.body;
  const approval = new ApprovalModel({
    milestoneId,
    projectId: milestone.projectId,
    requestedBy: authRequest.user.id,
    requestedAt: new Date(),
    status: 'pending',
    comment: input.comment,
  });
  await approval.save();

  await NotificationService.notifyApprovalRequested(approval, milestone, project, authRequest.user.id).catch(console.error);

  response.status(201).json({
    data: toApprovalResponse(approval),
  });
};

export const approveMilestone: RequestHandler = async (request, response) => {
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

  // Verify project exists and user is the client
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (authRequest.user.role !== 'client' || project.clientId !== authRequest.user.id) {
    throw forbidden('Only the project client can approve milestones.');
  }

  if (milestone.approvalStatus !== 'pending_approval') {
    throw badRequest('This milestone is not pending approval.');
  }

  // Update milestone to approved
  milestone.status = 'approved';
  milestone.approvalStatus = 'approved';
  milestone.lastApprovedAt = new Date();
  milestone.approvedBy = authRequest.user.id;
  milestone.updatedBy = authRequest.user.id;
  await milestone.save();

  // Update approval record
  const approval = await ApprovalModel.findOne({
    milestoneId,
    status: 'pending',
  });

  if (approval) {
    const input: ApprovalResponseInput = request.body;
    approval.status = 'approved';
    approval.respondedBy = authRequest.user.id;
    approval.respondedAt = new Date();
    approval.comment = input.comment;
    await approval.save();

    await NotificationService.notifyApprovalApproved(approval, milestone, project, authRequest.user.id).catch(console.error);
  }

  response.status(200).json({
    data: {
      success: true,
      message: 'Milestone approved successfully',
      milestone: {
        id: milestone._id.toString(),
        status: milestone.status,
        approvalStatus: milestone.approvalStatus,
        approvedBy: milestone.approvedBy,
        lastApprovedAt: milestone.lastApprovedAt?.toISOString(),
      },
    },
  });
};

export const requestChanges: RequestHandler = async (request, response) => {
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

  // Verify project exists and user is the client
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  if (authRequest.user.role !== 'client' || project.clientId !== authRequest.user.id) {
    throw forbidden('Only the project client can request changes.');
  }

  if (milestone.approvalStatus !== 'pending_approval') {
    throw badRequest('This milestone is not pending approval.');
  }

  const input: ApprovalResponseInput = request.body;
  if (!input.reason) {
    throw badRequest('Reason for changes is required.');
  }

  // Update milestone status
  milestone.status = 'in_progress'; // Back to in progress for rework
  milestone.approvalStatus = 'changes_requested';
  milestone.updatedBy = authRequest.user.id;
  await milestone.save();

  // Update approval record
  const approval = await ApprovalModel.findOne({
    milestoneId,
    status: 'pending',
  });

  if (approval) {
    approval.status = 'changes_requested';
    approval.respondedBy = authRequest.user.id;
    approval.respondedAt = new Date();
    approval.comment = input.comment;
    approval.reason = input.reason;
    await approval.save();

    await NotificationService.notifyApprovalRejected(approval, milestone, project, authRequest.user.id).catch(console.error);
  }

  response.status(200).json({
    data: {
      success: true,
      message: 'Changes requested successfully',
      milestone: {
        id: milestone._id.toString(),
        status: milestone.status,
        approvalStatus: milestone.approvalStatus,
      },
    },
  });
};

export const getApprovalHistory: RequestHandler = async (request, response) => {
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

  // Verify project exists and user has access
  const project = await ProjectModel.findById(milestone.projectId);
  if (!project) {
    throw notFound('Project not found.');
  }

  // Check authorization
  if (authRequest.user.role === 'manager' && project.managerId !== authRequest.user.id) {
    throw forbidden('You do not have access to this approval history.');
  }

  if (authRequest.user.role === 'client' && project.clientId !== authRequest.user.id) {
    throw forbidden('You do not have access to this approval history.');
  }

  const records = await ApprovalModel.find({ milestoneId })
    .sort({ requestedAt: -1 })
    .lean();

  response.status(200).json({
    data: {
      records: records.map(toApprovalResponse),
      total: records.length,
    },
  });
};

export const getPendingApprovals: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;

  if (!authRequest.user) {
    throw unauthorized();
  }

  if (authRequest.user.role !== 'client') {
    throw forbidden('Only clients can view pending approvals.');
  }

  // Get all projects where this user is the client
  const projects = await ProjectModel.find({ clientId: authRequest.user.id }).lean();
  const projectIds = projects.map((p) => p._id.toString());

  // Get pending approvals for these projects
  const records = await ApprovalModel.find({
    projectId: { $in: projectIds },
    status: 'pending',
  })
    .sort({ requestedAt: -1 })
    .lean();

  // Get corresponding milestones
  const milestoneIds = records.map((r) => r.milestoneId);
  const milestones = await MilestoneModel.find({ _id: { $in: milestoneIds } }).lean();

  const milestonesMap = new Map(milestones.map((m) => [m._id.toString(), m]));

  const approvalsWithMilestones = records.map((record) => ({
    approval: toApprovalResponse(record),
    milestone: milestonesMap.get(record.milestoneId)
      ? {
          id: milestonesMap.get(record.milestoneId)?._id.toString(),
          title: milestonesMap.get(record.milestoneId)?.title,
          projectId: milestonesMap.get(record.milestoneId)?.projectId,
        }
      : null,
  }));

  response.status(200).json({
    data: {
      approvals: approvalsWithMilestones,
      total: approvalsWithMilestones.length,
    },
  });
};
