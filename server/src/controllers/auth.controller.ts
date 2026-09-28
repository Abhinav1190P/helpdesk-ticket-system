import type { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';

const authResponse = (user: InstanceType<typeof User>) => ({
  success: true,
  token: signToken({ sub: String(user._id), role: user.role }),
  user: user.toJSON(),
});

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');

  // Role is never taken from the request body — public sign-ups are always "user"
  const user = await User.create({ name, email, password, role: 'user' });
  res.status(201).json(authResponse(user));
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // Same message for unknown email and wrong password (avoids user enumeration)
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');

  res.json(authResponse(user));
}

/**
 * JWTs are stateless, so logout is handled client-side by discarding the token.
 * This endpoint exists so the client has a single, explicit logout call
 * (and is the place to add a token denylist if revocation is ever needed).
 */
export async function logout(_req: Request, res: Response) {
  res.json({ success: true, message: 'Logged out' });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, user });
}
