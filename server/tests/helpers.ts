import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';

export const app = createApp();

let counter = 0;
export async function registerUser(overrides: Partial<{ name: string; email: string; password: string }> = {}) {
  counter += 1;
  const body = { name: 'Test User', email: `user${counter}@test.dev`, password: 'Password123', ...overrides };
  const res = await request(app).post('/api/auth/register').send(body);
  return { token: res.body.token as string, user: res.body.user, password: body.password, res };
}

export async function createAdmin() {
  const { token, user } = await registerUser({ name: 'Admin' });
  await User.updateOne({ _id: user.id }, { role: 'admin' });
  return { token, user }; // role is re-read from DB on every request, so the same token works
}

export const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

export const sampleTicket = {
  title: 'Cannot reset my password',
  description: 'The reset email never arrives in my inbox.',
  category: 'Account',
  priority: 'High',
};
