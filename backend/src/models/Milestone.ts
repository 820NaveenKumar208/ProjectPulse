import { Schema, model, type HydratedDocument } from 'mongoose';

export type MilestoneStatus =
  | 'not_started'
  | 'in_progress'
  | 'ready_for_approval'
  | 'approved'
  | 'changes_requested'
  | 'completed'
  | 'delayed';

export type MilestoneEntity = {
  projectId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: Date;
  completionPercentage: number; // 0-100
  order: number;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MilestoneDocument = HydratedDocument<MilestoneEntity>;

const milestoneSchema = new Schema<MilestoneEntity>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'not_started',
        'in_progress',
        'ready_for_approval',
        'approved',
        'changes_requested',
        'completed',
        'delayed',
      ],
      default: 'not_started',
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    updatedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
milestoneSchema.index({ projectId: 1, order: 1 });
milestoneSchema.index({ projectId: 1, status: 1 });
milestoneSchema.index({ projectId: 1, dueDate: 1 });
milestoneSchema.index({ dueDate: 1 });

export const MilestoneModel = model<MilestoneEntity>('Milestone', milestoneSchema);
