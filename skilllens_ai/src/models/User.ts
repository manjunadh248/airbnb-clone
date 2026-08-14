// ==============================
// Mongoose Models — User
// ==============================

import mongoose, { Schema, models, type Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  image?: string;
  assessments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    image: { type: String },
    assessments: [{ type: Schema.Types.ObjectId, ref: 'Assessment' }],
  },
  { timestamps: true }
);

// Prevent model recompilation in development
const User = models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
