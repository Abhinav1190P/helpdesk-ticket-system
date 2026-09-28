import { Schema, model, InferSchemaType, Types } from 'mongoose';

export const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved'] as const;
export const TICKET_PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const TICKET_CATEGORIES = ['Technical', 'Billing', 'Account', 'Feature Request', 'General'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];

const ticketSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, enum: TICKET_CATEGORIES, required: true },
    priority: { type: String, enum: TICKET_PRIORITIES, default: 'Medium' },
    status: { type: String, enum: TICKET_STATUSES, default: 'Open' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  // timestamps -> createdAt ("Created date") and updatedAt ("Updated date")
  { timestamps: true },
);

// Common query shapes: a user's tickets newest-first, admin filters
ticketSchema.index({ createdBy: 1, createdAt: -1 });
ticketSchema.index({ status: 1, priority: 1 });

ticketSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export type TicketAttrs = InferSchemaType<typeof ticketSchema> & { createdBy: Types.ObjectId };
export const Ticket = model('Ticket', ticketSchema);
