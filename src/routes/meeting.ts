import { Router } from 'express';
import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeetingActivity,
  deleteMeetingActivity,
  editMeetingActivity,
  getMeetingActivities
} from '../controllers/meeting/activityController';
import {
  createMeetingExpense,
  deleteMeetingExpense,
  editMeetingExpense,
  getMeetingExpenses
} from '../controllers/meeting/expenseController';
import {
  createMeeting,
  getMeeting,
  getUserMeetings
} from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

// MEETINGS
router.get('/', authenticateRequest, getUserMeetings);
router.post('/', authenticateRequest, createMeeting);
router.all('/', notAllowedHandler);

router.get('/:id', authenticateRequest, getMeeting);
router.all('/:id', notAllowedHandler);

// EXPENSES
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

// ACTIVITIES
router.get('/:id/activities', authenticateRequest, getMeetingActivities);
router.post('/:id/activities', authenticateRequest, createMeetingActivity);
router.put(
  '/:meetingId/activities/:activityId',
  authenticateRequest,
  editMeetingActivity
);
router.delete(
  '/:meetingId/activities/:activityId',
  authenticateRequest,
  deleteMeetingActivity
);
router.all('/:id/activities', notAllowedHandler);

export default router;
