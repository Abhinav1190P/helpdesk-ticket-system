import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, auth, createAdmin, registerUser, sampleTicket } from './helpers';

describe('Admin', () => {
  it('blocks non-admins', async () => {
    const { token } = await registerUser();
    expect((await request(app).get('/api/admin/tickets').set(auth(token))).status).toBe(403);
    expect((await request(app).get('/api/admin/stats').set(auth(token))).status).toBe(403);
  });

  it('views all tickets with filter, search and stats; updates status', async () => {
    const admin = await createAdmin();
    const u1 = await registerUser();
    const u2 = await registerUser();

    const t1 = (await request(app).post('/api/tickets').set(auth(u1.token)).send(sampleTicket)).body.ticket;
    await request(app).post('/api/tickets').set(auth(u2.token)).send({ ...sampleTicket, title: 'Invoice (PDF) missing', priority: 'Low', category: 'Billing' });
    await request(app).post('/api/tickets').set(auth(u2.token)).send({ ...sampleTicket, title: 'App crashes on start', category: 'Technical' });

    const all = await request(app).get('/api/admin/tickets').set(auth(admin.token));
    expect(all.status).toBe(200);
    expect(all.body.tickets).toHaveLength(3);
    expect(all.body.tickets[0].createdBy.email).toBeDefined();

    const high = await request(app).get('/api/admin/tickets?priority=High&status=Open').set(auth(admin.token));
    expect(high.body.tickets).toHaveLength(2);

    // Special regex characters are escaped, so "(PDF)" matches literally
    const search = await request(app).get('/api/admin/tickets?search=' + encodeURIComponent('(pdf)')).set(auth(admin.token));
    expect(search.body.tickets).toHaveLength(1);

    const upd = await request(app).patch(`/api/admin/tickets/${t1.id}/status`).set(auth(admin.token)).send({ status: 'Resolved' });
    expect(upd.status).toBe(200);
    expect(upd.body.ticket.status).toBe('Resolved');

    const bad = await request(app).patch(`/api/admin/tickets/${t1.id}/status`).set(auth(admin.token)).send({ status: 'Closed' });
    expect(bad.status).toBe(400);

    const stats = await request(app).get('/api/admin/stats').set(auth(admin.token));
    expect(stats.body.stats).toEqual({
      total: 3,
      byStatus: { Open: 2, 'In Progress': 0, Resolved: 1 },
      byPriority: { Low: 1, Medium: 0, High: 2 },
    });

    // Admin can open any ticket via the shared detail endpoint
    expect((await request(app).get(`/api/tickets/${t1.id}`).set(auth(admin.token))).status).toBe(200);
  });

  it('manages users and cannot change own role', async () => {
    const admin = await createAdmin();
    const u = await registerUser();

    const list = await request(app).get('/api/admin/users').set(auth(admin.token));
    expect(list.status).toBe(200);
    expect(list.body.users).toHaveLength(2);

    const promote = await request(app).patch(`/api/admin/users/${u.user.id}/role`).set(auth(admin.token)).send({ role: 'admin' });
    expect(promote.body.user.role).toBe('admin');
    // Role change takes effect immediately for the promoted user's existing token
    expect((await request(app).get('/api/admin/stats').set(auth(u.token))).status).toBe(200);

    const self = await request(app).patch(`/api/admin/users/${admin.user.id}/role`).set(auth(admin.token)).send({ role: 'user' });
    expect(self.status).toBe(400);
  });

  it('returns 404 JSON for unknown routes and health check works', async () => {
    expect((await request(app).get('/api/nope')).status).toBe(404);
    expect((await request(app).get('/api/health')).body.status).toBe('ok');
  });
});
