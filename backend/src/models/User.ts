import { Schema, model, type HydratedDocument } from 'mongoose';

import { userRoles, type UserRole } from '../types/roles.js';

export type UserEntity = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  organizationId: string;
  refreshTokenHashes: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type UserDocument = HydratedDocument<UserEntity>;

const userSchema = new Schema<UserEntity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: userRoles,
      required: true,
      default: 'client',
      index: true,
    },
    organizationId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    refreshTokenHashes: {
      type: [String],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model<UserEntity>('User', userSchema);
