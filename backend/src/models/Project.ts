import { Schema, model, type HydratedDocument } from 'mongoose';

export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'archived';
export type HealthStatus = 'excellent' | 'good' | 'at_risk' | 'critical';

export type ProjectEntity = {
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  progress: number; // 0-100
  healthScore: number; // 0-100
  healthStatus: HealthStatus;
  shareToken?: string;
  shareEnabled: boolean;
  shareExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDocument = HydratedDocument<ProjectEntity>;

const projectSchema = new Schema<ProjectEntity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    clientId: {
      type: String,
      required: true,
      index: true,
    },
    managerId: {
      type: String,
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'paused', 'completed', 'archived'],
      default: 'planning',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    healthScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    healthStatus: {
      type: String,
      enum: ['excellent', 'good', 'at_risk', 'critical'],
      default: 'good',
    },
    shareToken: {
      type: String,
      default: undefined,
      index: true,
      sparse: true,
    },
    shareEnabled: {
      type: Boolean,
      default: false,
    },
    shareExpiresAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
projectSchema.index({ clientId: 1, status: 1 });
projectSchema.index({ managerId: 1, status: 1 });
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ endDate: 1 });

export const ProjectModel = model<ProjectEntity>('Project', projectSchema);
