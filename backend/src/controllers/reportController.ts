import type { RequestHandler } from 'express';

import { ProjectModel } from '../models/Project.js';
import { MilestoneModel } from '../models/Milestone.js';
import { ReportModel } from '../models/Report.js';
import { NotificationService } from '../services/notificationService.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import { badRequest, forbidden, notFound } from '../utils/httpError.js';

export const generateReport: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  const projectId = String(request.params.projectId ?? '').trim();

  if (!user) throw forbidden('User not found.');
  if (!projectId) throw badRequest('Project ID is required.');

  const project = await ProjectModel.findById(projectId);
  if (!project) throw notFound('Project not found.');

  // Only manager or admin can generate reports
  if (project.managerId !== user.id && user.role !== 'admin') {
    throw forbidden('Only the project manager can generate reports.');
  }

  // Fetch milestones to "analyze"
  const milestones = await MilestoneModel.find({ projectId }).sort({ order: 1 });

  // Calculate week range (last 7 days)
  const now = new Date();
  const weekStartDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekEndDate = now;

  // Mock AI Generation Logic based on milestone data
  const completedMilestones = milestones.filter(m => ['completed', 'approved'].includes(m.status));
  const pendingMilestones = milestones.filter(m => !['completed', 'approved'].includes(m.status));
  
  const completedWorkText = completedMilestones.length > 0 
    ? `Successfully completed ${completedMilestones.length} milestones, including: ${completedMilestones.map(m => m.title).join(', ')}.`
    : 'No milestones were fully completed this week, but progress continues on active tasks.';

  const pendingWorkText = pendingMilestones.length > 0
    ? `Currently tracking ${pendingMilestones.length} open milestones. Focus areas include: ${pendingMilestones.slice(0, 3).map(m => m.title).join(', ')}.`
    : 'All planned milestones are currently completed.';

  let risksText = 'No significant risks identified at this time.';
  if (project.healthScore < 70) {
    risksText = 'Project health is trending lower. Resource allocation or timeline adjustments may be necessary.';
  }

  let blockersText = 'None reported.';
  const delayedMilestones = pendingMilestones.filter(m => m.status === 'delayed' || (m.dueDate < new Date() && !['completed', 'approved'].includes(m.status)));
  if (delayedMilestones.length > 0) {
    blockersText = `There are ${delayedMilestones.length} delayed milestones causing potential bottlenecks: ${delayedMilestones.map(m => m.title).join(', ')}.`;
  }

  const nextWeekPlanText = pendingMilestones.length > 0
    ? `The primary goal for next week is to advance the following: ${pendingMilestones.slice(0, 2).map(m => m.title).join(' and ')}.`
    : 'Project is wrapping up. Focus on final delivery and client handover.';

  const report = await ReportModel.create({
    projectId,
    weekStartDate,
    weekEndDate,
    completedWork: completedWorkText,
    pendingWork: pendingWorkText,
    risks: risksText,
    blockers: blockersText,
    nextWeekPlan: nextWeekPlanText,
    overallHealthScore: project.healthScore,
  });

  await NotificationService.notifyReportGenerated(report, project, authRequest.user.id).catch(console.error);

  response.status(201).json({
    data: {
      id: report._id.toString(),
      projectId: report.projectId,
      weekStartDate: report.weekStartDate.toISOString(),
      weekEndDate: report.weekEndDate.toISOString(),
      completedWork: report.completedWork,
      pendingWork: report.pendingWork,
      risks: report.risks,
      blockers: report.blockers,
      nextWeekPlan: report.nextWeekPlan,
      overallHealthScore: report.overallHealthScore,
      createdAt: report.createdAt.toISOString(),
    },
  });
};

export const listReports: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  const projectId = String(request.params.projectId ?? '').trim();

  if (!user) throw forbidden();
  if (!projectId) throw badRequest('Project ID is required.');

  const project = await ProjectModel.findById(projectId);
  if (!project) throw notFound('Project not found.');

  // Manager or Client for the project can view
  if (project.managerId !== user.id && project.clientId !== user.id && user.role !== 'admin') {
    throw forbidden('Not authorized to view reports for this project.');
  }

  const reports = await ReportModel.find({ projectId }).sort({ createdAt: -1 });

  response.status(200).json({
    data: reports.map((r) => ({
      id: r._id.toString(),
      projectId: r.projectId,
      weekStartDate: r.weekStartDate.toISOString(),
      weekEndDate: r.weekEndDate.toISOString(),
      completedWork: r.completedWork,
      pendingWork: r.pendingWork,
      risks: r.risks,
      blockers: r.blockers,
      nextWeekPlan: r.nextWeekPlan,
      overallHealthScore: r.overallHealthScore,
      createdAt: r.createdAt.toISOString(),
    })),
  });
};

export const getReport: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;
  const projectId = String(request.params.projectId ?? '').trim();
  const reportId = String(request.params.reportId ?? '').trim();

  if (!user) throw forbidden();
  if (!projectId || !reportId) throw badRequest('Project ID and Report ID are required.');

  const project = await ProjectModel.findById(projectId);
  if (!project) throw notFound('Project not found.');

  if (project.managerId !== user.id && project.clientId !== user.id && user.role !== 'admin') {
    throw forbidden('Not authorized to view reports for this project.');
  }

  const report = await ReportModel.findOne({ _id: reportId, projectId });
  if (!report) throw notFound('Report not found.');

  response.status(200).json({
    data: {
      id: report._id.toString(),
      projectId: report.projectId,
      weekStartDate: report.weekStartDate.toISOString(),
      weekEndDate: report.weekEndDate.toISOString(),
      completedWork: report.completedWork,
      pendingWork: report.pendingWork,
      risks: report.risks,
      blockers: report.blockers,
      nextWeekPlan: report.nextWeekPlan,
      overallHealthScore: report.overallHealthScore,
      createdAt: report.createdAt.toISOString(),
    },
  });
};
