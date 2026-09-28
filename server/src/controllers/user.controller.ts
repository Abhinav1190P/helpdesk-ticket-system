import type { Request, Response } from 'express';
import { User } from '../models/User';
import { Ticket } from '../models/Ticket';
import { ApiError } from '../utils/ApiError';

export async function updateProfile(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  user.name = req.body.name;
  await user.save();
  res.json({ success: true, user });
}

export async function changePassword(req: Request, res: Response) {
  const user = await User.findById(req.user!.id).select('+password');
  if (!user) throw ApiError.notFound('User not found');
  if (!(await user.comparePassword(req.body.currentPassword))) throw ApiError.badRequest('Current password is incorrect');

  user.password = req.body.newPassword; // re-hashed by the pre-save hook
  await user.save();
  res.json({ success: true, message: 'Password updated' });
}

// ---------- Admin ----------
export async function listUsers(_req: Request, res: Response) {
  const [users, counts] = await Promise.all([
    User.find().sort({ createdAt: -1 }).lean({ virtuals: false }),
    Ticket.aggregate<{ _id: unknown; count: number }>([{ $group: { _id: '$createdBy', count: { $sum: 1 } } }]),
  ]);
  const byUser = new Map(counts.map((c) => [String(c._id), c.count]));

  res.json({
    success: true,
    users: users.map((u) => ({
      id: String(u._id),
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      ticketCount: byUser.get(String(u._id)) ?? 0,
    })),
  });
}

export async function updateUserRole(req: Request, res: Response) {
  if (req.params.id === req.user!.id) throw ApiError.badRequest('You cannot change your own role');
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  user.role = req.body.role;
  await user.save();
  res.json({ success: true, user });
}
