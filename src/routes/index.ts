import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { notAllowedHandler, notFoundHandler } from '../utils/route-handlers';
import authRouter from './auth';
import meetingRouter from './meeting';
import userRouter from './user';

const router = Router();

const rateLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });

router.use(rateLimiter);

router.get('/', (req, res) => {
  return res.status(200).send('Service is available!');
});
router.all('/', notAllowedHandler);

router.use('/auth', authRouter);

router.use('/meeting', meetingRouter);

router.use('/user', userRouter);

router.use(notFoundHandler);

export default router;
