import { Router } from 'express';
import { authenticateRequest } from '../controllers/auth/authController';
import { getSelf } from '../controllers/user/userController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

router.get('/self', authenticateRequest, getSelf);
router.all('/self', notAllowedHandler);

export default router;
