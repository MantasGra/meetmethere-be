import { Router } from 'express';

import { authenticateRequest } from '../controllers/auth/authController';
import {
  createMeetingActivity,
  deleteMeetingActivity,
  editMeetingActivity,
  getMeetingActivities
} from '../controllers/meeting/activityController';
import {
  isMeetingCreator,
  isMeetingParticipant
} from '../controllers/meeting/meetingController';
import { notAllowedHandler } from '../utils/route-handlers';

const router = Router({ mergeParams: true });

router.get(
  '/',
  authenticateRequest,
  isMeetingParticipant,
  getMeetingActivities
);

router.post(
  '/',
  authenticateRequest,
  isMeetingParticipant,
  isMeetingCreator,
  createMeetingActivity
);

router.patch(
  '/:activityId',
  authenticateRequest,
  isMeetingParticipant,
  isMeetingCreator,
  editMeetingActivity
);

router.delete(
  '/:activityId',
  authenticateRequest,
  isMeetingParticipant,
  isMeetingCreator,
  deleteMeetingActivity
);

router.all('/', notAllowedHandler);

export default router;
