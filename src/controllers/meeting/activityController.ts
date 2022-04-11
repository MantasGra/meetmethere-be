import { StatusCodes } from 'http-status-codes';
import { getRepository } from 'typeorm';

import { MeetingRouteParams } from './meetingController';
import { AuthenticatedHandler } from '../auth/authController';
import Activity, { IActivity } from '../../entity/Activity';
import { asyncHandler } from '../../utils/route-handlers';

export const getMeetingActivities = asyncHandler<
  AuthenticatedHandler<MeetingRouteParams, IActivity[]>
>(async (req, res) => {
  const activityRepository = getRepository(Activity);

  const meetingId = parseInt(req.params.id);

  const activities = await activityRepository.find({
    where: {
      meeting: {
        id: meetingId
      }
    }
  });

  return res
    .status(StatusCodes.OK)
    .json(activities.map((activity) => activity.toJSON()));
});

type CreateActivityRequest = Omit<IActivity, 'id'>;

export const createMeetingActivity = asyncHandler<
  AuthenticatedHandler<MeetingRouteParams, IActivity, CreateActivityRequest>
>(async (req, res) => {
  const activityRepository = getRepository(Activity);

  const meetingId = parseInt(req.params.id);

  const activity = activityRepository.create({
    ...req.body,
    meetingId
  });

  await activityRepository.save(activity);
  return res.status(StatusCodes.CREATED).json(activity.toJSON());
});

interface MeetingActivityRouteParams extends MeetingRouteParams {
  activityId: string;
}

type EditActivityRequest = Partial<CreateActivityRequest>;

export const editMeetingActivity = asyncHandler<
  AuthenticatedHandler<
    MeetingActivityRouteParams,
    IActivity,
    EditActivityRequest
  >
>(async (req, res) => {
  const activityRepository = getRepository(Activity);

  const activityId = parseInt(req.params.activityId);

  const activity = await activityRepository.findOneOrFail(activityId);

  const updatedActivity = activityRepository.merge(activity, req.body);

  await activityRepository.save(updatedActivity);

  return res.status(StatusCodes.OK).json(updatedActivity.toJSON());
});

export const deleteMeetingActivity = asyncHandler<
  AuthenticatedHandler<MeetingActivityRouteParams>
>(async (req, res) => {
  const activityRepository = getRepository(Activity);

  const activityId = parseInt(req.params.activityId);

  const activity = await activityRepository.findOneOrFail(activityId);

  await activityRepository.softRemove(activity);
  return res.status(StatusCodes.NO_CONTENT).send();
});
