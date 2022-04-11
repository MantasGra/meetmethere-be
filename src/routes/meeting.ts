import { Router } from 'express';

import activitiesRouter from './activities';
import announcementsRouter from './announcements';
import expensesRouter from './expenses';
import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeeting,
  getMeeting,
  getMeetingInvitationSelectOptions,
  getUserInvitedMeetings,
  getUserMeetings,
  inviteUserToMeeting,
  isMeetingCreator,
  isMeetingParticipant,
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
router.post(
  '/:id/vote',
  authenticateRequest,
  isMeetingParticipant,
  updateUserMeetingDatePollEntries
);
router.all('/', notAllowedHandler);

router.get('/:id', authenticateRequest, isMeetingParticipant, getMeeting);
router.patch(
  '/:id',
  authenticateRequest,
  isMeetingParticipant,
  isMeetingCreator,
  updateMeeting
);
router.all('/:id', notAllowedHandler);

router.get(
  '/:id/invitationOptions',
  authenticateRequest,
  isMeetingParticipant,
  getMeetingInvitationSelectOptions
);
router.all('/:id/invitationOptions', notAllowedHandler);

router.post(
  '/:id/status',
  authenticateRequest,
  isMeetingParticipant,
  setUserMeetingStatus
);
router.post(
  '/:id/invite',
  authenticateRequest,
  isMeetingParticipant,
  isMeetingCreator,
  inviteUserToMeeting
);

router.use('/:id/activities', activitiesRouter);

router.use('/:id/announcements', announcementsRouter);

router.use('/:id/expenses', expensesRouter);

export default router;
