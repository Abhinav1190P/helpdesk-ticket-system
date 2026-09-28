import { Router } from 'express';
import * as users from '../controllers/user.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { changePasswordSchema, updateProfileSchema } from '../validators/schemas';
import { me } from '../controllers/auth.controller';

const router = Router();
router.use(protect);

router.get('/me', me);
router.patch('/me', validate({ body: updateProfileSchema }), users.updateProfile);
router.patch('/me/password', validate({ body: changePasswordSchema }), users.changePassword);

export default router;
