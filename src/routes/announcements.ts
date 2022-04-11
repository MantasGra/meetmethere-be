import { Router } from 'express';

import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeetingAnnouncement,
  deleteMeetingAnnouncement,
  editMeetingAnnouncement,
  getMeetingAnnouncements
} from '../controllers/meeting/announcementController';
import { isMeetingParticipant } from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router({ mergeParams: true });

router.get(
  '/',
  authenticateRequest,
  isMeetingParticipant,
  getMeetingAnnouncements
);

router.post(
  '/',
  authenticateRequest,
  isMeetingParticipant,
  createMeetingAnnouncement
);

router.patch(
  '/:announcementId',
  authenticateRequest,
  isMeetingParticipant,
  editMeetingAnnouncement
);

router.delete(
  '/:announcementId',
  authenticateRequest,
  isMeetingParticipant,
  deleteMeetingAnnouncement
);

router.all('/', notAllowedHandler);

export default router;
