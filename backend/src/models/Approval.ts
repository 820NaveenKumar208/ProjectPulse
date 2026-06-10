import { Schema, model, type HydratedDocument } from 'mongoose';

export type ApprovalRecordStatus = 'pending' | 'approved' | 'changes_requested';

export type ApprovalEntity = {
  milestoneId: string;
  projectId: string;
  requestedBy: string; // manager who marked as complete
  requestedAt: Date;
  status: ApprovalRecordStatus;
  respondedBy?: string; // client who approved/rejected
  respondedAt?: Date;
  comment?: string; // approval comment or reason for changes
  reason?: string; // specific reason if changes requested
  createdAt: Date;
  updatedAt: Date;
};

export type ApprovalDocument = HydratedDocument<ApprovalEntity>;

const approvalSchema = new Schema<ApprovalEntity>(
  {
    milestoneId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    requestedBy: {
      type: String,
      required: true,
    },
    requestedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'changes_requested'],
      default: 'pending',
      index: true,
    },
    respondedBy: {
      type: String,
      default: undefined,
    },
    respondedAt: {
      type: Date,
      default: undefined,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: undefined,
    },
    reason: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common queries
approvalSchema.index({ milestoneId: 1, status: 1 });
approvalSchema.index({ projectId: 1, status: 1 });
approvalSchema.index({ requestedAt: 1 });
approvalSchema.index({ respondedAt: 1 });

export const ApprovalModel = model<ApprovalEntity>('Approval', approvalSchema);
