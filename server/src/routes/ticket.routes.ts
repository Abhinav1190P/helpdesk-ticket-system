import { Router } from 'express';
import * as tickets from '../controllers/ticket.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTicketSchema, idParamSchema, listTicketsQuerySchema, updateTicketSchema } from '../validators/schemas';

const router = Router();
router.use(protect);

router
  .route('/')
  .get(validate({ query: listTicketsQuerySchema }), tickets.listMyTickets)
  .post(validate({ body: createTicketSchema }), tickets.createTicket);

router
  .route('/:id')
  .get(validate({ params: idParamSchema }), tickets.getTicket)
  .patch(validate({ params: idParamSchema, body: updateTicketSchema }), tickets.updateTicket)
  .delete(validate({ params: idParamSchema }), tickets.deleteTicket);

export default router;
