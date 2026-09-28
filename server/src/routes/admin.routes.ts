import { Router } from 'express';
import * as tickets from '../controllers/ticket.controller';
import * as users from '../controllers/user.controller';
import { protect, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { idParamSchema, listTicketsQuerySchema, updateRoleSchema, updateStatusSchema } from '../validators/schemas';

const router = Router();
router.use(protect, requireRole('admin'));

router.get('/stats', tickets.adminStats);
router.get('/tickets', validate({ query: listTicketsQuerySchema }), tickets.adminListTickets);
router.patch('/tickets/:id/status', validate({ params: idParamSchema, body: updateStatusSchema }), tickets.adminUpdateStatus);
router.delete('/tickets/:id', validate({ params: idParamSchema }), tickets.deleteTicket);

router.get('/users', users.listUsers);
router.patch('/users/:id/role', validate({ params: idParamSchema, body: updateRoleSchema }), users.updateUserRole);

export default router;
