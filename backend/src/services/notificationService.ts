import { NotificationModel, type NotificationType } from '../models/Notification.js';
import type { ProjectDocument } from '../models/Project.js';
import type { MilestoneDocument } from '../models/Milestone.js';
import type { ApprovalDocument } from '../models/Approval.js';
import type { ReportDocument } from '../models/Report.js';

export const NotificationService = {
  /**
   * Helper to determine recipient. If the actor is the manager, notify the client.
   * If the actor is the client, notify the manager.
   * If the actor is neither (e.g. system or admin), notify both (by calling create twice, or just notifying manager).
   * For simplicity, most methods will explicitly take the recipientId or infer it.
   */
  async createNotification(data: {
    userId: string;
    projectId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }) {
    return NotificationModel.create(data);
  },

  async notifyMilestoneCompleted(milestone: MilestoneDocument, project: ProjectDocument, actorId: string) {
    // Notify the other party
    const recipientId = actorId === project.managerId ? project.clientId : project.managerId;
    if (!recipientId) return;

    await this.createNotification({
      userId: recipientId,
      projectId: project.id,
      type: 'MILESTONE_COMPLETED',
      title: 'Milestone Completed',
      message: `The milestone "${milestone.title}" in project "${project.name}" has been marked as completed.`,
      metadata: { milestoneId: milestone.id },
    });
  },

  async notifyApprovalRequested(approval: ApprovalDocument, milestone: MilestoneDocument, project: ProjectDocument, actorId: string) {
    // Approval is usually requested by manager, requiring client review
    const recipientId = actorId === project.managerId ? project.clientId : project.managerId;
    if (!recipientId) return;

    await this.createNotification({
      userId: recipientId,
      projectId: project.id,
      type: 'APPROVAL_REQUESTED',
      title: 'Approval Requested',
      message: `Your approval is requested for milestone "${milestone.title}" in project "${project.name}".`,
      metadata: { milestoneId: milestone.id, approvalId: approval.id },
    });
  },

  async notifyApprovalApproved(approval: ApprovalDocument, milestone: MilestoneDocument, project: ProjectDocument, actorId: string) {
    const recipientId = actorId === project.managerId ? project.clientId : project.managerId;
    if (!recipientId) return;

    await this.createNotification({
      userId: recipientId,
      projectId: project.id,
      type: 'APPROVAL_APPROVED',
      title: 'Milestone Approved',
      message: `The milestone "${milestone.title}" in project "${project.name}" has been approved.`,
      metadata: { milestoneId: milestone.id, approvalId: approval.id },
    });
  },

  async notifyApprovalRejected(approval: ApprovalDocument, milestone: MilestoneDocument, project: ProjectDocument, actorId: string) {
    const recipientId = actorId === project.managerId ? project.clientId : project.managerId;
    if (!recipientId) return;

    await this.createNotification({
      userId: recipientId,
      projectId: project.id,
      type: 'APPROVAL_REJECTED',
      title: 'Milestone Rejected',
      message: `Changes were requested for milestone "${milestone.title}" in project "${project.name}".`,
      metadata: { milestoneId: milestone.id, approvalId: approval.id },
    });
  },

  async notifyReportGenerated(report: ReportDocument, project: ProjectDocument, actorId: string) {
    const recipientId = actorId === project.managerId ? project.clientId : project.managerId;
    if (!recipientId) return;

    await this.createNotification({
      userId: recipientId,
      projectId: project.id,
      type: 'REPORT_GENERATED',
      title: 'New Weekly Report',
      message: `A new AI Weekly Report has been generated for project "${project.name}".`,
      metadata: { reportId: report.id },
    });
  },
};
