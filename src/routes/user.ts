import { Router } from 'express';
import { authenticateRequest } from '../controllers/auth/authController';
import {
  getSelf,
  getUserSelectOptions
} from '../controllers/user/userController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

router.get('/self', authenticateRequest, getSelf);
router.all('/self', notAllowedHandler);

router.get('/selectOptions', authenticateRequest, getUserSelectOptions);
router.all('/selectOptions', notAllowedHandler);

export default router;
