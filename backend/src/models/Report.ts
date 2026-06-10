import { Schema, model, type HydratedDocument } from 'mongoose';

export type ReportEntity = {
  projectId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  completedWork: string;
  pendingWork: string;
  risks: string;
  blockers: string;
  nextWeekPlan: string;
  overallHealthScore: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ReportDocument = HydratedDocument<ReportEntity>;

const reportSchema = new Schema<ReportEntity>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    weekStartDate: {
      type: Date,
      required: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    completedWork: {
      type: String,
      default: '',
    },
    pendingWork: {
      type: String,
      default: '',
    },
    risks: {
      type: String,
      default: '',
    },
    blockers: {
      type: String,
      default: '',
    },
    nextWeekPlan: {
      type: String,
      default: '',
    },
    overallHealthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
);

// Index for getting recent reports
reportSchema.index({ projectId: 1, createdAt: -1 });

export const ReportModel = model<ReportEntity>('Report', reportSchema);
