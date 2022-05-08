import { Router } from 'express';
import {
  changePassword,
  login,
  logout,
  refreshToken,
  register,
  authenticateRequest,
  requestPasswordReset,
  resetPassword
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

router.post('/changepassword', authenticateRequest, changePassword);
router.all('/changepassword', notAllowedHandler);

router.post('/requestpasswordreset', requestPasswordReset);
router.all('/requestpasswordreset', notAllowedHandler);

router.post('/resetpassword', resetPassword);
router.all('/resetpassword', notAllowedHandler);

export default router;
