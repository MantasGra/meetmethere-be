import { Router } from 'express';
import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeeting,
  getMeeting,
  getUserMeetings
} from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

router.get('/', authenticateRequest, getUserMeetings);
router.post('/', authenticateRequest, createMeeting);
router.all('/', notAllowedHandler);

router.get('/:id', authenticateRequest, getMeeting);
router.all('/:id', notAllowedHandler);

export default router;
