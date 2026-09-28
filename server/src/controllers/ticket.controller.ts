import type { Request, Response } from 'express';
import type { SortOrder } from 'mongoose';
import { Ticket, TICKET_STATUSES, TICKET_PRIORITIES } from '../models/Ticket';
import { ApiError } from '../utils/ApiError';
import { escapeRegex } from '../utils/escapeRegex';
import type { ListTicketsQuery } from '../validators/schemas';

const SORTS: Record<ListTicketsQuery['sort'], Record<string, SortOrder>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  updated: { updatedAt: -1 },
};

/** Builds a Mongo filter from validated query params. `ownerId` scopes results to one user. */
function buildFilter(q: ListTicketsQuery, ownerId?: string): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  if (ownerId) filter.createdBy = ownerId;
  if (q.status) filter.status = q.status;
  if (q.priority) filter.priority = q.priority;
  if (q.category) filter.category = q.category;
  if (q.search) filter.title = { $regex: escapeRegex(q.search), $options: 'i' };
  return filter;
}

async function paginatedTickets(q: ListTicketsQuery, ownerId?: string, populateOwner = false) {
  const filter = buildFilter(q, ownerId);
  const query = Ticket.find(filter)
    .sort(SORTS[q.sort])
    .skip((q.page - 1) * q.limit)
    .limit(q.limit);
  if (populateOwner) query.populate('createdBy', 'name email');

  const [tickets, total] = await Promise.all([query, Ticket.countDocuments(filter)]);
  return {
    success: true,
    tickets,
    pagination: { page: q.page, limit: q.limit, total, totalPages: Math.max(1, Math.ceil(total / q.limit)) },
  };
}

/**
 * Loads a ticket the current user is allowed to access.
 * Non-owners get 404 (not 403) so we don't reveal that the ticket exists.
 */
async function findAccessibleTicket(req: Request) {
  const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
  if (!ticket) throw ApiError.notFound('Ticket not found');

  const ownerId = String((ticket.createdBy as unknown as { _id: unknown })._id);
  if (req.user!.role !== 'admin' && ownerId !== req.user!.id) throw ApiError.notFound('Ticket not found');
  return ticket;
}

// ---------- User endpoints ----------
export async function createTicket(req: Request, res: Response) {
  const ticket = await Ticket.create({ ...req.body, createdBy: req.user!.id });
  res.status(201).json({ success: true, ticket });
}

export async function listMyTickets(req: Request, res: Response) {
  res.json(await paginatedTickets(res.locals.query, req.user!.id));
}

export async function getTicket(req: Request, res: Response) {
  res.json({ success: true, ticket: await findAccessibleTicket(req) });
}

export async function updateTicket(req: Request, res: Response) {
  const ticket = await findAccessibleTicket(req);
  ticket.set(req.body); // body is already whitelisted by Zod
  await ticket.save();
  res.json({ success: true, ticket });
}

export async function deleteTicket(req: Request, res: Response) {
  const ticket = await findAccessibleTicket(req);
  await ticket.deleteOne();
  res.json({ success: true, message: 'Ticket deleted' });
}

// ---------- Admin endpoints ----------
export async function adminListTickets(_req: Request, res: Response) {
  res.json(await paginatedTickets(res.locals.query, undefined, true));
}

export async function adminUpdateStatus(req: Request, res: Response) {
  const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
  if (!ticket) throw ApiError.notFound('Ticket not found');
  ticket.status = req.body.status;
  await ticket.save();
  res.json({ success: true, ticket });
}

export async function adminStats(_req: Request, res: Response) {
  // One pass over the collection: count tickets per (status, priority) pair,
  // then roll the small result set up in JS (at most 3 x 3 rows).
  const rows = await Ticket.aggregate<{ _id: { status: string; priority: string }; count: number }>([
    { $group: { _id: { status: '$status', priority: '$priority' }, count: { $sum: 1 } } },
  ]);

  // Always return every key (with 0) so the UI doesn't need to handle missing buckets
  const byStatus = Object.fromEntries(TICKET_STATUSES.map((k) => [k, 0])) as Record<(typeof TICKET_STATUSES)[number], number>;
  const byPriority = Object.fromEntries(TICKET_PRIORITIES.map((k) => [k, 0])) as Record<(typeof TICKET_PRIORITIES)[number], number>;
  let total = 0;
  for (const { _id, count } of rows) {
    total += count;
    if (_id.status in byStatus) byStatus[_id.status as keyof typeof byStatus] += count;
    if (_id.priority in byPriority) byPriority[_id.priority as keyof typeof byPriority] += count;
  }

  res.json({ success: true, stats: { total, byStatus, byPriority } });
}
