import { Schema, model, type HydratedDocument } from 'mongoose';

export type NotificationType =
  | 'MILESTONE_COMPLETED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_APPROVED'
  | 'APPROVAL_REJECTED'
  | 'REPORT_GENERATED';

export type NotificationEntity = {
  userId: string;
  projectId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export type NotificationDocument = HydratedDocument<NotificationEntity>;

const notificationSchema = new Schema<NotificationEntity>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'MILESTONE_COMPLETED',
        'APPROVAL_REQUESTED',
        'APPROVAL_APPROVED',
        'APPROVAL_REJECTED',
        'REPORT_GENERATED',
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for fast querying of user's notifications
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export const NotificationModel = model<NotificationEntity>('Notification', notificationSchema);
