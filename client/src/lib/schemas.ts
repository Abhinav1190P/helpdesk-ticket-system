import { z } from 'zod';
import { CATEGORIES, PRIORITIES } from './types';

// Mirrors the server-side Zod rules so users get instant feedback;
// the server still validates everything independently.
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[A-Za-z]/, 'Password must contain a letter')
  .regex(/\d/, 'Password must contain a number');

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export const ticketSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Choose a category' }) }),
  priority: z.enum(PRIORITIES),
});

export const profileSchema = z.object({ name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60) });

export const passwordSchema = z
  .object({ currentPassword: z.string().min(1, 'Current password is required'), newPassword: password, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type TicketValues = z.infer<typeof ticketSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
