import { describe, it, expect, beforeEach } from 'vitest';
import { MilestoneModel } from '../models/Milestone.js';

describe('Milestone Management', () => {
  const mockProjectId = 'project-123';
  const managerId = 'manager-001';

  beforeEach(async () => {
    // Clear milestones before each test
    await MilestoneModel.deleteMany({});
  });

  describe('Milestone Creation', () => {
    it('should create a milestone with valid data', async () => {
      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Design Phase',
        description: 'Complete UI/UX design',
        dueDate: new Date('2024-12-31'),
        status: 'not_started',
        completionPercentage: 0,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      expect(milestone).toBeDefined();
      expect(milestone.projectId).toBe(mockProjectId);
      expect(milestone.title).toBe('Design Phase');
      expect(milestone.status).toBe('not_started');
      expect(milestone.completionPercentage).toBe(0);
    });

    it('should require title for milestone', async () => {
      try {
        await MilestoneModel.create({
          projectId: mockProjectId,
          title: '', // Empty title
          dueDate: new Date('2024-12-31'),
          status: 'not_started',
          completionPercentage: 0,
          order: 0,
          createdBy: managerId,
          updatedBy: managerId,
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('minlength');
      }
    });

    it('should require dueDate for milestone', async () => {
      try {
        await MilestoneModel.create({
          projectId: mockProjectId,
          title: 'Test Milestone',
          // Missing dueDate
          status: 'not_started',
          completionPercentage: 0,
          order: 0,
          createdBy: managerId,
          updatedBy: managerId,
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('required');
      }
    });

    it('should validate completion percentage range', async () => {
      try {
        await MilestoneModel.create({
          projectId: mockProjectId,
          title: 'Test Milestone',
          dueDate: new Date('2024-12-31'),
          status: 'not_started',
          completionPercentage: 150, // Invalid: > 100
          order: 0,
          createdBy: managerId,
          updatedBy: managerId,
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('max');
      }
    });
  });

  describe('Milestone Listing and Retrieval', () => {
    it('should list all milestones for a project', async () => {
      // Create multiple milestones
      await MilestoneModel.create([
        {
          projectId: mockProjectId,
          title: 'Phase 1',
          dueDate: new Date('2024-11-30'),
          status: 'not_started',
          completionPercentage: 0,
          order: 0,
          createdBy: managerId,
          updatedBy: managerId,
        },
        {
          projectId: mockProjectId,
          title: 'Phase 2',
          dueDate: new Date('2024-12-31'),
          status: 'not_started',
          completionPercentage: 0,
          order: 1,
          createdBy: managerId,
          updatedBy: managerId,
        },
      ]);

      const milestones = await MilestoneModel.find({ projectId: mockProjectId }).sort({ order: 1 });

      expect(milestones).toHaveLength(2);
      expect(milestones[0].title).toBe('Phase 1');
      expect(milestones[1].title).toBe('Phase 2');
    });

    it('should retrieve a milestone by ID', async () => {
      const created = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Test Milestone',
        dueDate: new Date('2024-12-31'),
        status: 'not_started',
        completionPercentage: 0,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      const retrieved = await MilestoneModel.findById(created._id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Test Milestone');
    });

    it('should filter milestones by status', async () => {
      await MilestoneModel.create([
        {
          projectId: mockProjectId,
          title: 'Not Started',
          dueDate: new Date('2024-11-30'),
          status: 'not_started',
          completionPercentage: 0,
          order: 0,
          createdBy: managerId,
          updatedBy: managerId,
        },
        {
          projectId: mockProjectId,
          title: 'In Progress',
          dueDate: new Date('2024-12-15'),
          status: 'in_progress',
          completionPercentage: 50,
          order: 1,
          createdBy: managerId,
          updatedBy: managerId,
        },
        {
          projectId: mockProjectId,
          title: 'Completed',
          dueDate: new Date('2024-12-31'),
          status: 'completed',
          completionPercentage: 100,
          order: 2,
          createdBy: managerId,
          updatedBy: managerId,
        },
      ]);

      const inProgress = await MilestoneModel.find({
        projectId: mockProjectId,
        status: 'in_progress',
      });

      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].completionPercentage).toBe(50);
    });
  });

  describe('Milestone Updates', () => {
    it('should update milestone status', async () => {
      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Test Milestone',
        dueDate: new Date('2024-12-31'),
        status: 'not_started',
        completionPercentage: 0,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      milestone.status = 'in_progress';
      milestone.completionPercentage = 50;
      await milestone.save();

      const updated = await MilestoneModel.findById(milestone._id);
      expect(updated?.status).toBe('in_progress');
      expect(updated?.completionPercentage).toBe(50);
    });

    it('should update milestone due date', async () => {
      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Test Milestone',
        dueDate: new Date('2024-12-31'),
        status: 'not_started',
        completionPercentage: 0,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      const newDueDate = new Date('2024-11-30');
      milestone.dueDate = newDueDate;
      await milestone.save();

      const updated = await MilestoneModel.findById(milestone._id);
      expect(updated?.dueDate.getTime()).toBe(newDueDate.getTime());
    });

    it('should mark milestone as completed', async () => {
      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Test Milestone',
        dueDate: new Date('2024-12-31'),
        status: 'in_progress',
        completionPercentage: 90,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      milestone.status = 'completed';
      milestone.completionPercentage = 100;
      await milestone.save();

      const updated = await MilestoneModel.findById(milestone._id);
      expect(updated?.status).toBe('completed');
      expect(updated?.completionPercentage).toBe(100);
    });
  });

  describe('Milestone Deletion', () => {
    it('should delete a milestone', async () => {
      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Test Milestone',
        dueDate: new Date('2024-12-31'),
        status: 'not_started',
        completionPercentage: 0,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      await MilestoneModel.deleteOne({ _id: milestone._id });

      const deleted = await MilestoneModel.findById(milestone._id);
      expect(deleted).toBeNull();
    });

    it('should reorder milestones after deletion', async () => {
      const milestones = await MilestoneModel.create([
        {
          projectId: mockProjectId,
          title: 'Milestone 1',
          dueDate: new Date('2024-11-30'),
          status: 'not_started',
          completionPercentage: 0,
          order: 0,
          createdBy: managerId,
          updatedBy: managerId,
        },
        {
          projectId: mockProjectId,
          title: 'Milestone 2',
          dueDate: new Date('2024-12-15'),
          status: 'not_started',
          completionPercentage: 0,
          order: 1,
          createdBy: managerId,
          updatedBy: managerId,
        },
        {
          projectId: mockProjectId,
          title: 'Milestone 3',
          dueDate: new Date('2024-12-31'),
          status: 'not_started',
          completionPercentage: 0,
          order: 2,
          createdBy: managerId,
          updatedBy: managerId,
        },
      ]);

      // Delete middle milestone
      await MilestoneModel.deleteOne({ _id: milestones[1]._id });

      // Reorder remaining
      const remaining = await MilestoneModel.find({ projectId: mockProjectId }).sort({ order: 1 });
      for (let i = 0; i < remaining.length; i++) {
        remaining[i].order = i;
        await remaining[i].save();
      }

      const reordered = await MilestoneModel.find({ projectId: mockProjectId }).sort({ order: 1 });
      expect(reordered).toHaveLength(2);
      expect(reordered[0].order).toBe(0);
      expect(reordered[1].order).toBe(1);
    });
  });

  describe('Milestone Status Transitions', () => {
    it('should support valid status transitions', async () => {
      const statuses = [
        'not_started',
        'in_progress',
        'ready_for_approval',
        'approved',
        'completed',
      ] as const;

      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Test Milestone',
        dueDate: new Date('2024-12-31'),
        status: 'not_started',
        completionPercentage: 0,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      for (const status of statuses) {
        milestone.status = status;
        await milestone.save();

        const updated = await MilestoneModel.findById(milestone._id);
        expect(updated?.status).toBe(status);
      }
    });

    it('should handle delayed status for overdue milestones', async () => {
      const milestone = await MilestoneModel.create({
        projectId: mockProjectId,
        title: 'Overdue Milestone',
        dueDate: new Date('2023-01-01'), // Past date
        status: 'in_progress',
        completionPercentage: 75,
        order: 0,
        createdBy: managerId,
        updatedBy: managerId,
      });

      milestone.status = 'delayed';
      await milestone.save();

      const updated = await MilestoneModel.findById(milestone._id);
      expect(updated?.status).toBe('delayed');
    });
  });

  describe('Milestone Indexes', () => {
    it('should have compound index on projectId and order', async () => {
      const indexes = await MilestoneModel.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (idx: any) => idx.key && idx.key.projectId === 1 && idx.key.order === 1
      );
      expect(hasIndex).toBe(true);
    });

    it('should have compound index on projectId and status', async () => {
      const indexes = await MilestoneModel.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (idx: any) => idx.key && idx.key.projectId === 1 && idx.key.status === 1
      );
      expect(hasIndex).toBe(true);
    });

    it('should have index on dueDate', async () => {
      const indexes = await MilestoneModel.collection.getIndexes();
      const hasIndex = Object.values(indexes).some(
        (idx: any) => idx.key && idx.key.dueDate === 1
      );
      expect(hasIndex).toBe(true);
    });
  });
});
