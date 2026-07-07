import mongoose from 'mongoose';

import { env } from './env.js';

let mongoMemoryServer: any = null;

async function seedDefaultProjects(managerEmail: string, clientEmail: string) {
  try {
    const { UserModel } = await import('../models/User.js');
    const { ProjectModel } = await import('../models/Project.js');
    const { MilestoneModel } = await import('../models/Milestone.js');
    const { ApprovalModel } = await import('../models/Approval.js');
    const { NotificationModel } = await import('../models/Notification.js');
    const { ReportModel } = await import('../models/Report.js');

    const projectCount = await ProjectModel.countDocuments();
    if (projectCount > 0) {
      console.log('Projects already exist in the database, skipping project seeding.');
      return;
    }

    console.log('No projects found. Seeding default realistic projects...');
    const manager = await UserModel.findOne({ email: managerEmail });
    const client = await UserModel.findOne({ email: clientEmail });

    if (!manager || !client) {
      console.warn('Manager or Client user not found. Skipping project seeding.');
      return;
    }

    const managerId = manager._id.toString();
    const clientId = client._id.toString();

    // 1. ProjectPulse Website
    const p1 = await ProjectModel.create({
      name: 'ProjectPulse Website',
      description: 'A premium client-facing visibility platform for tracking project health, milestones, and client sign-offs.',
      clientId,
      managerId,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: 78,
      healthScore: 95,
      healthStatus: 'excellent',
      shareEnabled: true,
    });

    // 2. SmartShop Buddy
    const p2 = await ProjectModel.create({
      name: 'SmartShop Buddy',
      description: 'E-commerce assistant widget with AI recommendation engine and real-time checkout monitoring.',
      clientId,
      managerId,
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: 65,
      healthScore: 65,
      healthStatus: 'good',
      shareEnabled: false,
    });

    // 3. AI Resume Analyzer
    const p3 = await ProjectModel.create({
      name: 'AI Resume Analyzer',
      description: 'Next-gen candidate screening portal with PDF parsing, LLM scoring, and comparative talent match analytics.',
      clientId,
      managerId,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: 91,
      healthScore: 91,
      healthStatus: 'excellent',
      shareEnabled: true,
    });

    // 4. Retail Vision AI
    const p4 = await ProjectModel.create({
      name: 'Retail Vision AI',
      description: 'Intelligent brick-and-mortar foot-traffic analytics and heat-mapping pipeline using edge cameras.',
      clientId,
      managerId,
      startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'active',
      progress: 45,
      healthScore: 97,
      healthStatus: 'excellent',
      shareEnabled: true,
    });

    console.log('Projects created. Seeding milestones...');

    // Milestones for ProjectPulse Website
    await MilestoneModel.create({
      projectId: p1._id.toString(),
      title: 'UX/UI Wireframes & Design System',
      description: 'Create high-fidelity wireframes and the Tailwind-based system component library.',
      status: 'completed',
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
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
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
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
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completionPercentage: 90,
      order: 3,
      createdBy: managerId,
      updatedBy: managerId,
      approvalStatus: 'pending_approval',
      approvalRequestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvalRequestedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p1._id.toString(),
      title: 'End-to-End QA & Launch Prep',
      description: 'Perform cross-browser testing and verify performance metrics before rollout.',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      completionPercentage: 40,
      order: 4,
      createdBy: managerId,
      updatedBy: managerId,
    });

    // Create Approvals record for the pending milestone (Approval 1)
    await ApprovalModel.create({
      milestoneId: m1_3._id.toString(),
      projectId: p1._id.toString(),
      requestedBy: managerId,
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Milestones for SmartShop Buddy
    await MilestoneModel.create([
      {
        projectId: p2._id.toString(),
        title: 'Database Schema Design',
        description: 'Set up catalog, recommendation tables and indexes.',
        status: 'completed',
        dueDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        completionPercentage: 100,
        order: 1,
        createdBy: managerId,
        updatedBy: managerId,
      },
      {
        projectId: p2._id.toString(),
        title: 'AI Recommendation Engine API',
        description: 'Build predictive scoring service endpoints based on collaborative filtering.',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 65 * 1000),
        completionPercentage: 75,
        order: 2,
        createdBy: managerId,
        updatedBy: managerId,
      },
      {
        projectId: p2._id.toString(),
        title: 'Frontend Widget Layout',
        description: 'Develop CSS-styled overlay panel with slide animation.',
        status: 'not_started',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        completionPercentage: 0,
        order: 3,
        createdBy: managerId,
        updatedBy: managerId,
      }
    ]);

    // Milestones for AI Resume Analyzer
    await MilestoneModel.create({
      projectId: p3._id.toString(),
      title: 'PDF Parsing & OCR Service',
      description: 'Set up file intake service and extract raw text from candidate CVs.',
      status: 'completed',
      dueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
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
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completionPercentage: 95,
      order: 2,
      createdBy: managerId,
      updatedBy: managerId,
      approvalStatus: 'pending_approval',
      approvalRequestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      approvalRequestedBy: managerId,
    });

    await MilestoneModel.create({
      projectId: p3._id.toString(),
      title: 'Admin Analytics Dashboard',
      description: 'Build cohort view charts and search filters.',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      completionPercentage: 80,
      order: 3,
      createdBy: managerId,
      updatedBy: managerId,
    });

    // Create Approvals record for the second pending milestone (Approval 2)
    await ApprovalModel.create({
      milestoneId: m3_2._id.toString(),
      projectId: p3._id.toString(),
      requestedBy: managerId,
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Milestones for Retail Vision AI (p4)
    await MilestoneModel.create([
      {
        projectId: p4._id.toString(),
        title: 'Camera Connection Sync Core',
        description: 'Establish RTSP stream decoder engine and frame parsing pipelines.',
        status: 'completed',
        dueDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        completionPercentage: 100,
        order: 1,
        createdBy: managerId,
        updatedBy: managerId,
      },
      {
        projectId: p4._id.toString(),
        title: 'Real-Time Density Heatmap Projection',
        description: 'Generate visual overhead perspective grids showing traffic density indices.',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        completionPercentage: 45,
        order: 2,
        createdBy: managerId,
        updatedBy: managerId,
      }
    ]);

    console.log('Milestones and approvals created. Seeding exactly 12 reports...');

    // Seed 12 reports across the 4 projects
    const reportData = [
      // Project 1: ProjectPulse Website (4 reports)
      { projectId: p1._id.toString(), week: 1, health: 95 },
      { projectId: p1._id.toString(), week: 2, health: 92 },
      { projectId: p1._id.toString(), week: 3, health: 95 },
      { projectId: p1._id.toString(), week: 4, health: 95 },
      // Project 2: SmartShop Buddy (3 reports)
      { projectId: p2._id.toString(), week: 1, health: 70 },
      { projectId: p2._id.toString(), week: 2, health: 65 },
      { projectId: p2._id.toString(), week: 3, health: 65 },
      // Project 3: AI Resume Analyzer (3 reports)
      { projectId: p3._id.toString(), week: 1, health: 88 },
      { projectId: p3._id.toString(), week: 2, health: 91 },
      { projectId: p3._id.toString(), week: 3, health: 91 },
      // Project 4: Retail Vision AI (2 reports)
      { projectId: p4._id.toString(), week: 1, health: 97 },
      { projectId: p4._id.toString(), week: 2, health: 97 },
    ];

    for (const rep of reportData) {
      const start = new Date(Date.now() - (rep.week * 7 + 6) * 24 * 60 * 60 * 1000);
      const end = new Date(Date.now() - rep.week * 7 * 24 * 60 * 60 * 1000);
      await ReportModel.create({
        projectId: rep.projectId,
        weekStartDate: start,
        weekEndDate: end,
        completedWork: `Successfully delivered milestones scheduled for week ${rep.week}. Tested endpoints.`,
        pendingWork: `Preparing updates for the next phase of deployment.`,
        risks: `None observed.`,
        blockers: `None.`,
        nextWeekPlan: `Proceed with integration tests and setup verification.`,
        overallHealthScore: rep.health,
      });
    }

    // Create notifications for activity feed
    await NotificationModel.create([
      {
        userId: managerId,
        title: 'Project Initialized',
        message: 'ProjectPulse Website workspace has been created successfully.',
        type: 'system',
        projectId: p1._id.toString(),
        read: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: clientId,
        title: 'New Portal Invited',
        message: 'You have been added as a client to the ProjectPulse Website project.',
        type: 'system',
        projectId: p1._id.toString(),
        read: false,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: clientId,
        title: 'Approval Required',
        message: 'Manager requested your approval for the milestone: Client Portal Share Links.',
        type: 'action',
        projectId: p1._id.toString(),
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: managerId,
        title: 'Approval Requested',
        message: 'You requested approval from the client for milestone: Client Portal Share Links.',
        type: 'action',
        projectId: p1._id.toString(),
        read: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: clientId,
        title: 'Approval Required',
        message: 'Manager requested your approval for the milestone: LLM Talent Score Engine.',
        type: 'action',
        projectId: p3._id.toString(),
        read: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ]);

    console.log('Realistic project data seeding completed.');
  } catch (err) {
    console.error('Failed to seed default realistic project data:', err);
  }
}

async function seedDefaultUsers() {
  const adminEmail = 'admin@projectpulse.test';
  const managerEmail = 'manager@projectpulse.test';
  const clientEmail = 'client@projectpulse.test';
  const password = 'Password123!';

  try {
    const { register } = await import('../services/authService.js');
    const { UserModel } = await import('../models/User.js');

    const adminExists = await UserModel.findOne({ email: adminEmail });
    if (!adminExists) {
      console.log('Seeding admin user...');
      await register({
        name: 'Admin User',
        email: adminEmail,
        password,
        role: 'admin',
        organizationId: 'ProjectPulse',
      });
    }

    const managerExists = await UserModel.findOne({ email: managerEmail });
    if (!managerExists) {
      console.log('Seeding manager user...');
      await register({
        name: 'Manager User',
        email: managerEmail,
        password,
        role: 'manager',
        organizationId: 'ProjectPulse',
      });
    }

    const clientExists = await UserModel.findOne({ email: clientEmail });
    if (!clientExists) {
      console.log('Seeding client user...');
      await register({
        name: 'Client User',
        email: clientEmail,
        password,
        role: 'client',
        organizationId: 'ProjectPulse',
      });
    }
    console.log('Seeding of test users completed.');
    
    // Seed projects and other resources
    await seedDefaultProjects(managerEmail, clientEmail);
  } catch (err) {
    console.error('Failed to seed default test users:', err);
  }
}

export async function connectToDatabase() {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection established');
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error', error);
  });

  if (env.skipDatabaseConnection) {
    console.warn('MongoDB connection skipped by SKIP_DATABASE_CONNECTION=true. Starting in-memory MongoDB server...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const uri = mongoMemoryServer.getUri();
      console.log(`In-memory MongoDB server started at: ${uri}`);
      await mongoose.connect(uri);
      
      // Turn off skipDatabaseConnection so other services use Mongoose properly
      env.skipDatabaseConnection = false;
      
      // Seed default users for manual verification
      await seedDefaultUsers();
      return;
    } catch (error) {
      console.error('Failed to start in-memory MongoDB server', error);
      mongoose.set('bufferCommands', false);
      return;
    }
  }

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
}
