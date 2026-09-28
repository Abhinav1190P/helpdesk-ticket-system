import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../models/User';

export interface JwtPayload {
  sub: string; // user id
  role: Role;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}
