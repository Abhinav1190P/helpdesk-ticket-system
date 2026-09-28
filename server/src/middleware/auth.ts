import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import { User, Role } from '../models/User';

/**
 * Verifies the Bearer token and attaches { id, role } to req.user.
 * The user is re-loaded from the DB so that deleted users or changed roles
 * take effect immediately instead of waiting for the token to expire.
 */
export async function protect(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized('Missing or malformed Authorization header');

  let payload;
  try {
    payload = verifyToken(header.slice(7));
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }

  const user = await User.findById(payload.sub).select('role').lean();
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = { id: String(user._id), role: user.role as Role };
  next();
}

/** Role guard — must run after `protect` */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
