import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout
} from '../controllers/auth/authController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

router.get('/token', refreshToken);
router.all('/token', notAllowedHandler);

router.post('/login', login);
router.all('/login', notAllowedHandler);

router.post('/logout', logout);
router.all('/logout', notAllowedHandler);

router.post('/register', register);
router.all('/register', notAllowedHandler);

export default router;
