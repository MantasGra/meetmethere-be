import { Router } from 'express';
import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeetingExpense,
  deleteMeetingExpense,
  editMeetingExpense,
  getMeetingExpenses
} from '../controllers/meeting/expenseController';
import {
  createMeetingAnnouncement,
  getMeetingAnnouncements
} from '../controllers/meeting/announcementController';
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
router.get('/:id/announcements', authenticateRequest, getMeetingAnnouncements);
router.post(
  '/:id/announcements',
  authenticateRequest,
  createMeetingAnnouncement
);
router.all('/:id/announcements', notAllowedHandler);

export default router;
