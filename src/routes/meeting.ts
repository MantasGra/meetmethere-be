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
  createMeetingAnnouncement,
  deleteMeetingAnnouncement,
  editMeetingAnnouncement,
  getMeetingAnnouncements
} from '../controllers/meeting/announcementController';
import {
  createMeeting,
  getMeeting,
  getMeetingInvitationSelectOptions,
  getUserInvitedMeetings,
  getUserMeetings,
  inviteUserToMeeting,
  setUserMeetingStatus,
  updateMeeting,
  updateUserMeetingDatePollEntries
} from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router();

// MEETINGS
router.get('/invitations', authenticateRequest, getUserInvitedMeetings);
router.all('/invitations', notAllowedHandler);

router.get('/', authenticateRequest, getUserMeetings);
router.post('/', authenticateRequest, createMeeting);
router.post('/:id/vote', authenticateRequest, updateUserMeetingDatePollEntries);
router.all('/', notAllowedHandler);

router.get('/:id', authenticateRequest, getMeeting);
router.patch('/:id', authenticateRequest, updateMeeting);
router.all('/:id', notAllowedHandler);

router.get(
  '/:id/invitationOptions',
  authenticateRequest,
  getMeetingInvitationSelectOptions
);
router.all('/:id/invitationOptions', notAllowedHandler);

router.post('/:id/status', authenticateRequest, setUserMeetingStatus);
router.post('/:id/invite', authenticateRequest, inviteUserToMeeting);

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

// ANNOUNCEMENTS
router.get('/:id/announcements', authenticateRequest, getMeetingAnnouncements);
router.post(
  '/:id/announcements',
  authenticateRequest,
  createMeetingAnnouncement
);

router.put(
  '/:meetingId/announcements/:announcementId',
  authenticateRequest,
  editMeetingAnnouncement
);
router.delete(
  '/:meetingId/announcements/:announcementId',
  authenticateRequest,
  deleteMeetingAnnouncement
);
router.all('/:id/announcements', notAllowedHandler);

export default router;
