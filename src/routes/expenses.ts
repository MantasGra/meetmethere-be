import { Router } from 'express';

import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeetingExpense,
  deleteMeetingExpense,
  editMeetingExpense,
  getMeetingExpenses
} from '../controllers/meeting/expenseController';
import { isMeetingParticipant } from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router({ mergeParams: true });

router.get('/', authenticateRequest, isMeetingParticipant, getMeetingExpenses);

router.post(
  '/',
  authenticateRequest,
  isMeetingParticipant,
  createMeetingExpense
);

router.patch(
  '/:expenseId',
  authenticateRequest,
  isMeetingParticipant,
  editMeetingExpense
);

router.delete(
  '/:expenseId',
  authenticateRequest,
  isMeetingParticipant,
  deleteMeetingExpense
);

router.all('/', notAllowedHandler);

export default router;
