import type { RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { ProjectModel } from '../models/Project.js';
import { MilestoneModel } from '../models/Milestone.js';
import { ApprovalModel } from '../models/Approval.js';
import { NotificationModel } from '../models/Notification.js';
import { ReportModel } from '../models/Report.js';
import { UserModel } from '../models/User.js';
import type { AuthenticatedRequest } from '../types/auth.js';
import { forbidden } from '../utils/httpError.js';

async function seedDemoDataForUser(user: { id: string; role: string; organizationId: string }) {
  try {
    let managerId: string;
    let clientId: string;

    if (user.role === 'manager') {
      managerId = user.id;
      // Find or create client
      let client = await UserModel.findOne({ role: 'client', organizationId: user.organizationId });
      if (!client) {
        const hashedPassword = await bcrypt.hash('Password123!', 12);
        client = await UserModel.create({
          name: 'Acme Corp Client',
          email: `client-${user.organizationId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'default'}@projectpulse.test`,
          password: hashedPassword,
          role: 'client',
          organizationId: user.organizationId,
        });
      }
      clientId = client._id.toString();
    } else {
      clientId = user.id;
      // Find or create manager
      let manager = await UserModel.findOne({ role: 'manager', organizationId: user.organizationId });
      if (!manager) {
        const hashedPassword = await bcrypt.hash('Password123!', 12);
        manager = await UserModel.create({
          name: 'Acme Corp Manager',
          email: `manager-${user.organizationId.toLowerCase().replace(/[^a-z0-9]/g, '') || 'default'}@projectpulse.test`,
          password: hashedPassword,
          role: 'manager',
          organizationId: user.organizationId,
        });
      }
      managerId = manager._id.toString();
    }

    const now = Date.now();
    const nextDate = (days: number) => new Date(now + days * 24 * 60 * 60 * 1000);
    const pastDate = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000);

    // 1. ProjectPulse Website (Progress: 78%, Health Score: 95)
    const p1 = await ProjectModel.create({
      name: 'ProjectPulse Website',
      description: 'A premium client-facing visibility platform for tracking project health, milestones, and client sign-offs.',
      clientId,
      managerId,
      startDate: pastDate(30),
      endDate: nextDate(15),
      status: 'active',
      progress: 78,
      healthScore: 95,
      healthStatus: 'excellent',
      shareEnabled: true,
    });

    // 2. SmartShop Buddy (Progress: 65%, Health Score: 65)
    const p2 = await ProjectModel.create({
      name: 'SmartShop Buddy',
      description: 'E-commerce assistant widget with AI recommendation engine and real-time checkout monitoring.',
      clientId,
      managerId,
      startDate: pastDate(45),
      endDate: nextDate(10),
      status: 'active',
      progress: 65,
      healthScore: 65,
      healthStatus: 'good',
      shareEnabled: false,
    });

    // 3. AI Resume Analyzer (Progress: 91%, Health Score: 91)
    const p3 = await ProjectModel.create({
      name: 'AI Resume Analyzer',
      description: 'Next-gen candidate screening portal with PDF parsing, LLM scoring, and comparative talent match analytics.',
      clientId,
      managerId,
      startDate: pastDate(15),
      endDate: nextDate(25),
      status: 'active',
      progress: 91,
      healthScore: 91,
      healthStatus: 'excellent',
      shareEnabled: true,
    });

    // 4. Retail Vision AI (Progress: 45%, Health Score: 97)
    const p4 = await ProjectModel.create({
      name: 'Retail Vision AI',
      description: 'Intelligent brick-and-mortar foot-traffic analytics and heat-mapping pipeline using edge cameras.',
      clientId,
      managerId,
      startDate: pastDate(60),
      endDate: nextDate(45),
      status: 'active',
      progress: 45,
      healthScore: 97,
      healthStatus: 'excellent',
      shareEnabled: true,
    });

    // Seed milestones
    // Project 1 (ProjectPulse Website)
    await MilestoneModel.create({
      projectId: p1._id.toString(),
      title: 'UX/UI Wireframes & Design System',
      description: 'Create high-fidelity wireframes and the Tailwind-based system component library.',
      status: 'completed',
      dueDate: pastDate(20),
      completionPercentage: 100,
      order: 1,
      createdBy: managerId,
      updatedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p1._id.toString(),
      title: 'Interactive Dashboard Widgets',
      description: 'Implement KPI cards, circular progress charts, and real-time project metrics.',
      status: 'completed',
      dueDate: pastDate(10),
      completionPercentage: 100,
      order: 2,
      createdBy: managerId,
      updatedBy: managerId,
    });

    const m1_3 = await MilestoneModel.create({
      projectId: p1._id.toString(),
      title: 'Client Portal Share Links',
      description: 'Implement token-based public shareable URLs with optional expiry dates.',
      status: 'ready_for_approval',
      dueDate: nextDate(3), // Upcoming 1
      completionPercentage: 90,
      order: 3,
      createdBy: managerId,
      updatedBy: managerId,
      approvalStatus: 'pending_approval',
      approvalRequestedAt: pastDate(1),
      approvalRequestedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p1._id.toString(),
      title: 'End-to-End QA & Launch Prep',
      description: 'Perform cross-browser testing and verify performance metrics before rollout.',
      status: 'in_progress',
      dueDate: nextDate(8), // Upcoming 2
      completionPercentage: 40,
      order: 4,
      createdBy: managerId,
      updatedBy: managerId,
    });

    await ApprovalModel.create({
      milestoneId: m1_3._id.toString(),
      projectId: p1._id.toString(),
      requestedBy: managerId,
      requestedAt: pastDate(1),
      status: 'pending',
    });

    // Project 2 (SmartShop Buddy)
    await MilestoneModel.create({
      projectId: p2._id.toString(),
      title: 'Database Schema Design',
      description: 'Set up catalog, recommendation tables and indexes.',
      status: 'completed',
      dueDate: pastDate(35),
      completionPercentage: 100,
      order: 1,
      createdBy: managerId,
      updatedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p2._id.toString(),
      title: 'AI Recommendation Engine API',
      description: 'Build predictive scoring service endpoints based on collaborative filtering.',
      status: 'in_progress',
      dueDate: nextDate(2), // Upcoming 3
      completionPercentage: 75,
      order: 2,
      createdBy: managerId,
      updatedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p2._id.toString(),
      title: 'Frontend Widget Layout',
      description: 'Develop CSS-styled overlay panel with slide animation.',
      status: 'not_started',
      dueDate: nextDate(10), // Upcoming 4
      completionPercentage: 0,
      order: 3,
      createdBy: managerId,
      updatedBy: managerId,
    });

    // Project 3 (AI Resume Analyzer)
    await MilestoneModel.create({
      projectId: p3._id.toString(),
      title: 'PDF Parsing & OCR Service',
      description: 'Set up file intake service and extract raw text from candidate CVs.',
      status: 'completed',
      dueDate: pastDate(12),
      completionPercentage: 100,
      order: 1,
      createdBy: managerId,
      updatedBy: managerId,
    });

    const m3_2 = await MilestoneModel.create({
      projectId: p3._id.toString(),
      title: 'LLM Talent Score Engine',
      description: 'Construct prompting flow and comparative radar score generation.',
      status: 'ready_for_approval',
      dueDate: nextDate(4), // Upcoming 5
      completionPercentage: 95,
      order: 2,
      createdBy: managerId,
      updatedBy: managerId,
      approvalStatus: 'pending_approval',
      approvalRequestedAt: pastDate(1),
      approvalRequestedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p3._id.toString(),
      title: 'Admin Analytics Dashboard',
      description: 'Build cohort view charts and search filters.',
      status: 'in_progress',
      dueDate: nextDate(11), // Upcoming 6
      completionPercentage: 80,
      order: 3,
      createdBy: managerId,
      updatedBy: managerId,
    });

    await ApprovalModel.create({
      milestoneId: m3_2._id.toString(),
      projectId: p3._id.toString(),
      requestedBy: managerId,
      requestedAt: pastDate(1),
      status: 'pending',
    });

    // Project 4 (Retail Vision AI)
    await MilestoneModel.create({
      projectId: p4._id.toString(),
      title: 'Camera Connection Sync Core',
      description: 'Establish RTSP stream decoder engine and frame parsing pipelines.',
      status: 'completed',
      dueDate: pastDate(40),
      completionPercentage: 100,
      order: 1,
      createdBy: managerId,
      updatedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p4._id.toString(),
      title: 'Real-Time Density Heatmap Projection',
      description: 'Generate visual overhead perspective grids showing traffic density indices.',
      status: 'in_progress',
      dueDate: nextDate(12), // Upcoming 7
      completionPercentage: 45,
      order: 2,
      createdBy: managerId,
      updatedBy: managerId,
    });

    // Reports (12 reports total)
    const reportData = [
      { projectId: p1._id.toString(), week: 1, health: 95 },
      { projectId: p1._id.toString(), week: 2, health: 92 },
      { projectId: p1._id.toString(), week: 3, health: 95 },
      { projectId: p1._id.toString(), week: 4, health: 95 },
      { projectId: p2._id.toString(), week: 1, health: 70 },
      { projectId: p2._id.toString(), week: 2, health: 65 },
      { projectId: p2._id.toString(), week: 3, health: 65 },
      { projectId: p3._id.toString(), week: 1, health: 88 },
      { projectId: p3._id.toString(), week: 2, health: 91 },
      { projectId: p3._id.toString(), week: 3, health: 91 },
      { projectId: p4._id.toString(), week: 1, health: 97 },
      { projectId: p4._id.toString(), week: 2, health: 97 },
    ];

    for (const rep of reportData) {
      await ReportModel.create({
        projectId: rep.projectId,
        weekStartDate: pastDate(rep.week * 7 + 6),
        weekEndDate: pastDate(rep.week * 7),
        completedWork: `Successfully delivered milestones scheduled for week ${rep.week}. Tested endpoints.`,
        pendingWork: `Preparing updates for the next phase of deployment.`,
        risks: `None observed.`,
        blockers: `None.`,
        nextWeekPlan: `Proceed with integration tests and setup verification.`,
        overallHealthScore: rep.health,
      });
    }

    // Notifications
    await NotificationModel.create([
      {
        userId: managerId,
        title: 'Project Initialized',
        message: 'ProjectPulse Website workspace has been created successfully.',
        type: 'system',
        projectId: p1._id.toString(),
        read: false,
        createdAt: pastDate(30),
      },
      {
        userId: clientId,
        title: 'New Portal Invited',
        message: 'You have been added as a client to the ProjectPulse Website project.',
        type: 'system',
        projectId: p1._id.toString(),
        read: false,
        createdAt: pastDate(30),
      },
      {
        userId: clientId,
        title: 'Approval Required',
        message: 'Manager requested your approval for the milestone: Client Portal Share Links.',
        type: 'action',
        projectId: p1._id.toString(),
        read: false,
        createdAt: pastDate(1),
      },
      {
        userId: managerId,
        title: 'Approval Requested',
        message: 'You requested approval from the client for milestone: Client Portal Share Links.',
        type: 'action',
        projectId: p1._id.toString(),
        read: true,
        createdAt: pastDate(1),
      },
      {
        userId: clientId,
        title: 'Approval Required',
        message: 'Manager requested your approval for the milestone: LLM Talent Score Engine.',
        type: 'action',
        projectId: p3._id.toString(),
        read: false,
        createdAt: pastDate(1),
      },
    ]);

    console.log(`Demo data seeded successfully for user ${user.id} (${user.role})`);
  } catch (err) {
    console.error('Failed to seed demo data for user:', err);
  }
}

/**
 * GET /api/v1/dashboard
 * Returns role-specific dashboard data to avoid multiple frontend API calls.
 */
export const getDashboard: RequestHandler = async (request, response) => {
  const authRequest = request as AuthenticatedRequest;
  const user = authRequest.user;

  if (!user) throw forbidden();

  if (user.role === 'manager') {
    let projects = await ProjectModel.find({ managerId: user.id }).lean();
    if (projects.length === 0) {
      await seedDemoDataForUser(user);
      projects = await ProjectModel.find({ managerId: user.id }).lean();
    }

    const [
      pendingApprovals,
      recentNotifications,
    ] = await Promise.all([
      ApprovalModel.find({
        requestedBy: user.id,
        status: 'pending',
      }).sort({ requestedAt: -1 }).lean(),
      NotificationModel.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const activeProjects = projects.filter((p) => p.status === 'active');
    const projectIds = projects.map((p) => p._id.toString());

    // Get upcoming deadlines (milestones due in next 14 days)
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingMilestones = await MilestoneModel.find({
      projectId: { $in: projectIds },
      dueDate: { $gte: now, $lte: twoWeeksFromNow },
      status: { $nin: ['completed', 'approved'] },
    })
      .sort({ dueDate: 1 })
      .limit(10)
      .lean();

    // Calculate portfolio health
    const avgHealth =
      activeProjects.length > 0
        ? Math.round(
            activeProjects.reduce((sum, p) => sum + p.healthScore, 0) / activeProjects.length,
          )
        : 0;

    response.status(200).json({
      data: {
        role: 'manager',
        stats: {
          activeProjects: activeProjects.length,
          totalProjects: projects.length,
          completedProjects: projects.filter((p) => p.status === 'completed').length,
          pendingApprovals: pendingApprovals.length,
          portfolioHealth: avgHealth,
        },
        upcomingDeadlines: upcomingMilestones.map((m) => ({
          id: m._id.toString(),
          title: m.title,
          projectId: m.projectId,
          dueDate: m.dueDate.toISOString(),
          status: m.status,
        })),
        recentActivity: recentNotifications.map((n) => ({
          id: n._id.toString(),
          title: n.title,
          message: n.message,
          type: n.type,
          projectId: n.projectId,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        })),
        projects: activeProjects.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          progress: p.progress,
          healthScore: p.healthScore,
          healthStatus: p.healthStatus,
          status: p.status,
          endDate: p.endDate.toISOString(),
        })),
      },
    });
  } else if (user.role === 'client') {
    let projects = await ProjectModel.find({ clientId: user.id }).lean();
    if (projects.length === 0) {
      await seedDemoDataForUser(user);
      projects = await ProjectModel.find({ clientId: user.id }).lean();
    }

    const [pendingApprovals, recentNotifications] = await Promise.all([
      ApprovalModel.find({
        status: 'pending',
      }).lean(),
      NotificationModel.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const projectIds = projects.map((p) => p._id.toString());

    // Filter approvals to only those for client's projects
    const clientApprovals = pendingApprovals.filter((a) => projectIds.includes(a.projectId));

    // Get milestones for client projects
    const milestoneIds = clientApprovals.map((a) => a.milestoneId);
    const milestones = await MilestoneModel.find({ _id: { $in: milestoneIds } }).lean();
    const milestonesMap = new Map(milestones.map((m) => [m._id.toString(), m]));

    const avgHealth =
      projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.healthScore, 0) / projects.length)
        : 0;

    const reportsCount = await ReportModel.countDocuments({ projectId: { $in: projectIds } });

    response.status(200).json({
      data: {
        role: 'client',
        stats: {
          assignedProjects: projects.length,
          activeProjects: projects.filter((p) => p.status === 'active').length,
          pendingApprovals: clientApprovals.length,
          overallHealth: avgHealth,
          availableReports: reportsCount,
        },
        pendingApprovals: clientApprovals.map((a) => ({
          id: a._id.toString(),
          milestoneId: a.milestoneId,
          projectId: a.projectId,
          requestedAt: a.requestedAt.toISOString(),
          milestoneTitle: milestonesMap.get(a.milestoneId)?.title ?? 'Unknown',
        })),
        recentActivity: recentNotifications.map((n) => ({
          id: n._id.toString(),
          title: n.title,
          message: n.message,
          type: n.type,
          projectId: n.projectId,
          read: n.read,
          createdAt: n.createdAt.toISOString(),
        })),
        projects: projects.map((p) => ({
          id: p._id.toString(),
          name: p.name,
          description: p.description,
          progress: p.progress,
          healthScore: p.healthScore,
          healthStatus: p.healthStatus,
          status: p.status,
          endDate: p.endDate.toISOString(),
        })),
      },
    });
  } else {
    // Admin — redirect to admin stats
    response.status(200).json({
      data: {
        role: 'admin',
        message: 'Use /api/v1/admin/stats for admin dashboard data.',
      },
    });
  }
};
