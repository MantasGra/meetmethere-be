import { Router } from 'express';
import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeetingExpense,
  deleteMeetingExpense,
  editMeetingExpense,
  getMeetingExpenses
} from '../controllers/meeting/expenseController';
import {
  createMeeting,
  getMeeting,
  getUserMeetings,
  updateUserMeetingDatePollEntries
} from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

router.get('/', authenticateRequest, getUserMeetings);
router.post('/', authenticateRequest, createMeeting);
router.post('/:id/vote', authenticateRequest, updateUserMeetingDatePollEntries);
router.all('/', notAllowedHandler);

router.get('/:id', authenticateRequest, getMeeting);
router.all('/:id', notAllowedHandler);

router.get('/:id/expenses', authenticateRequest, getMeetingExpenses);
router.post('/:id/expenses', authenticateRequest, createMeetingExpense);
router.put(
  '/:meetingId/expenses/:expenseId',
  authenticateRequest,
  editMeetingExpense
);
router.delete(
  '/:meetingId/expenses/:expenseId',
  authenticateRequest,
  deleteMeetingExpense
);
router.all('/:id/expenses', notAllowedHandler);
router.all('/:meetingId/expenses/:expenseId', notAllowedHandler);
export default router;
