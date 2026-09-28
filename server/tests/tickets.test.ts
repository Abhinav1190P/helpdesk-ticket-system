import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app, auth, registerUser, sampleTicket } from './helpers';

const create = (token: string, body: object = sampleTicket) =>
  request(app).post('/api/tickets').set(auth(token)).send(body);

describe('Tickets (user)', () => {
  it('creates a ticket with defaults and timestamps', async () => {
    const { token, user } = await registerUser();
    const res = await create(token, { ...sampleTicket, priority: undefined });
    expect(res.status).toBe(201);
    expect(res.body.ticket).toMatchObject({ title: sampleTicket.title, status: 'Open', priority: 'Medium', createdBy: user.id });
    expect(res.body.ticket.createdAt).toBeDefined();
    expect(res.body.ticket.updatedAt).toBeDefined();
  });

  it('validates ticket input', async () => {
    const { token } = await registerUser();
    const res = await create(token, { title: 'Hi', description: 'short', category: 'Nope', priority: 'Urgent' });
    expect(res.status).toBe(400);
    expect(res.body.details.length).toBeGreaterThanOrEqual(4);
  });

  it('lists only the current user’s tickets with filters and pagination', async () => {
    const a = await registerUser();
    const b = await registerUser();
    await create(a.token);
    await create(a.token, { ...sampleTicket, title: 'Billing overcharge issue', category: 'Billing', priority: 'Low' });
    await create(b.token);

    const mine = await request(app).get('/api/tickets').set(auth(a.token));
    expect(mine.status).toBe(200);
    expect(mine.body.tickets).toHaveLength(2);
    expect(mine.body.pagination).toMatchObject({ total: 2, page: 1 });

    const low = await request(app).get('/api/tickets?priority=Low').set(auth(a.token));
    expect(low.body.tickets).toHaveLength(1);

    const paged = await request(app).get('/api/tickets?limit=1&page=2').set(auth(a.token));
    expect(paged.body.tickets).toHaveLength(1);
    expect(paged.body.pagination.totalPages).toBe(2);
  });

  it('gets, updates status and deletes own ticket', async () => {
    const { token } = await registerUser();
    const { body } = await create(token);
    const id = body.ticket.id;

    const got = await request(app).get(`/api/tickets/${id}`).set(auth(token));
    expect(got.status).toBe(200);
    expect(got.body.ticket.createdBy.name).toBe('Test User');

    const upd = await request(app).patch(`/api/tickets/${id}`).set(auth(token)).send({ status: 'In Progress' });
    expect(upd.status).toBe(200);
    expect(upd.body.ticket.status).toBe('In Progress');
    expect(upd.body.ticket.priority).toBe('High'); // partial update must not reset other fields

    const empty = await request(app).patch(`/api/tickets/${id}`).set(auth(token)).send({});
    expect(empty.status).toBe(400);

    const del = await request(app).delete(`/api/tickets/${id}`).set(auth(token));
    expect(del.status).toBe(200);
    expect((await request(app).get(`/api/tickets/${id}`).set(auth(token))).status).toBe(404);
  });

  it('prevents users from reading, editing or deleting others’ tickets', async () => {
    const owner = await registerUser();
    const other = await registerUser();
    const id = (await create(owner.token)).body.ticket.id;

    expect((await request(app).get(`/api/tickets/${id}`).set(auth(other.token))).status).toBe(404);
    expect((await request(app).patch(`/api/tickets/${id}`).set(auth(other.token)).send({ status: 'Resolved' })).status).toBe(404);
    expect((await request(app).delete(`/api/tickets/${id}`).set(auth(other.token))).status).toBe(404);
  });

  it('rejects malformed ids and does not allow changing the owner', async () => {
    const { token, user } = await registerUser();
    expect((await request(app).get('/api/tickets/not-an-id').set(auth(token))).status).toBe(400);

    const id = (await create(token)).body.ticket.id;
    const res = await request(app)
      .patch(`/api/tickets/${id}`)
      .set(auth(token))
      .send({ title: 'Updated title here', createdBy: '000000000000000000000000' });
    expect(res.status).toBe(200);
    expect(res.body.ticket.createdBy.id ?? res.body.ticket.createdBy._id).toBe(user.id);
  });
});
