import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { User } from '../src/models/User';
import { app, auth, registerUser } from './helpers';

describe('Auth', () => {
  it('registers a user, hashes the password and never returns it', async () => {
    const { res } = await registerUser({ email: 'a@test.dev' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({ email: 'a@test.dev', role: 'user' });
    expect(res.body.user.password).toBeUndefined();

    const stored = await User.findOne({ email: 'a@test.dev' }).select('+password');
    expect(stored!.password).not.toBe('Password123');
    expect(stored!.password.startsWith('$2')).toBe(true); // bcrypt hash
  });

  it('ignores a role sent in the register body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sneaky', email: 'sneaky@test.dev', password: 'Password123', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('user');
  });

  it('rejects duplicate emails and invalid input', async () => {
    await registerUser({ email: 'dup@test.dev' });
    const dup = await request(app).post('/api/auth/register').send({ name: 'X Y', email: 'DUP@test.dev', password: 'Password123' });
    expect(dup.status).toBe(409);

    const bad = await request(app).post('/api/auth/register').send({ name: 'X', email: 'nope', password: 'short' });
    expect(bad.status).toBe(400);
    const fields = new Set(bad.body.details.map((d: { field: string }) => d.field));
    expect([...fields].sort()).toEqual(['email', 'name', 'password']);
  });

  it('logs in with correct credentials only', async () => {
    await registerUser({ email: 'login@test.dev' });
    const ok = await request(app).post('/api/auth/login').send({ email: 'login@test.dev', password: 'Password123' });
    expect(ok.status).toBe(200);
    expect(ok.body.token).toBeTypeOf('string');

    const wrong = await request(app).post('/api/auth/login').send({ email: 'login@test.dev', password: 'Wrong12345' });
    expect(wrong.status).toBe(401);
    const unknown = await request(app).post('/api/auth/login').send({ email: 'ghost@test.dev', password: 'Wrong12345' });
    expect(unknown.status).toBe(401);
    expect(unknown.body.message).toBe(wrong.body.message); // no user enumeration
  });

  it('protects routes and returns the current user', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set(auth('garbage'))).status).toBe(401);

    const { token } = await registerUser({ email: 'me@test.dev' });
    const me = await request(app).get('/api/auth/me').set(auth(token));
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('me@test.dev');

    expect((await request(app).post('/api/auth/logout').set(auth(token))).status).toBe(200);
  });

  it('changes password with the current password', async () => {
    const { token } = await registerUser({ email: 'pw@test.dev' });
    const wrong = await request(app).patch('/api/users/me/password').set(auth(token)).send({ currentPassword: 'nope', newPassword: 'NewPass123' });
    expect(wrong.status).toBe(400);
    const ok = await request(app).patch('/api/users/me/password').set(auth(token)).send({ currentPassword: 'Password123', newPassword: 'NewPass123' });
    expect(ok.status).toBe(200);
    const login = await request(app).post('/api/auth/login').send({ email: 'pw@test.dev', password: 'NewPass123' });
    expect(login.status).toBe(200);
  });
});
