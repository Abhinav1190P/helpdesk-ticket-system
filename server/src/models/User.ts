import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';
import bcrypt from 'bcryptjs';

export const ROLES = ['user', 'admin'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // select: false -> the hash is never returned by queries unless explicitly requested
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'user' },
  },
  { timestamps: true },
);

// Hash the password whenever it is set or changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Strip sensitive/internal fields whenever a user is serialized to JSON
userSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export type UserAttrs = InferSchemaType<typeof userSchema>;
export interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}
export type UserDoc = HydratedDocument<UserAttrs, UserMethods>;

export const User = model<UserAttrs, import('mongoose').Model<UserAttrs, {}, UserMethods>>('User', userSchema);
