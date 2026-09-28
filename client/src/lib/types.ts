export const STATUSES = ['Open', 'In Progress', 'Resolved'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const CATEGORIES = ['Technical', 'Billing', 'Account', 'Feature Request', 'General'] as const;

export type Status = (typeof STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Category = (typeof CATEGORIES)[number];
export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface TicketOwner {
  id?: string;
  _id?: string;
  name: string;
  email: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdBy: string | TicketOwner;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TicketQuery {
  status?: Status | '';
  priority?: Priority | '';
  category?: Category | '';
  search?: string;
  sort?: 'newest' | 'oldest' | 'updated';
  page?: number;
  limit?: number;
}

export interface Stats {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
}

export interface AdminUser extends User {
  ticketCount: number;
}
