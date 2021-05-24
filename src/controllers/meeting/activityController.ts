import { RequestHandler, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { EntityNotFoundError, getRepository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../auth/authController';
import Meeting from '../../entity/Meeting';
import Activity from '../../entity/Activity';

interface MeetingActivityRouteParams extends ParamsDictionary {
  id: string;
}

interface EditMeetingActivityRouteParams extends ParamsDictionary {
  activityId: string;
  meetingId: string;
}

export const getMeetingActivities: RequestHandler = async (
  req: AuthenticatedRequest<
    MeetingActivityRouteParams,
    Activity[],
    Record<string, never>
  >,
  res: Response<Activity[]>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const activityRepository = getRepository(Activity);
    const userId = req.user.id;
    const meetingId = parseInt(req.params.id);

    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .getOneOrFail();

    const activities = await activityRepository
      .createQueryBuilder('activity')
      .where('activity.meetingId = :meetingId', { meetingId })
      .getMany();

    return res.status(StatusCodes.OK).json(activities);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface ICreateMeetingActivityRequest {
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

interface IEditMeetingActivityRequest {
  id: number;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

export const createMeetingActivity: RequestHandler = async (
  req: AuthenticatedRequest<
    MeetingActivityRouteParams,
    Activity,
    ICreateMeetingActivityRequest,
    Record<string, never>
  >,
  res: Response<Activity>
) => {
  const meetingRepository = getRepository(Meeting);
  const activityRepository = getRepository(Activity);
  const userId = req.user.id;
  const meetingId = parseInt(req.params.id);

  try {
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('meeting.creatorId = :userId', { userId })
      .getOneOrFail();

    const activity = activityRepository.create({
      ...req.body,
      meeting: meeting
    });

    await activityRepository.save(activity);
    return res.status(StatusCodes.CREATED).json(activity);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

export const editMeetingActivity: RequestHandler = async (
  req: AuthenticatedRequest<
    EditMeetingActivityRouteParams,
    Activity,
    IEditMeetingActivityRequest,
    Record<string, never>
  >,
  res: Response<Activity>
) => {
  const meetingRepository = getRepository(Meeting);
  const activityRepository = getRepository(Activity);
  const userId = req.user.id;
  const meetingId = parseInt(req.params.meetingId);
  const activityId = parseInt(req.params.activityId);

  try {
    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('meeting.creatorId = :userId', { userId })
      .getOneOrFail();

    const activity = await activityRepository.findOneOrFail(activityId);

    const result = await activityRepository.save({
      ...activity,
      ...req.body
    });
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

export const deleteMeetingActivity: RequestHandler = async (
  req: AuthenticatedRequest<EditMeetingActivityRouteParams>,
  res: Response
) => {
  const activityRepository = getRepository(Activity);
  const meetingRepository = getRepository(Meeting);
  const userId = req.user.id;

  const meetingId = parseInt(req.params.meetingId);
  const activityId = parseInt(req.params.activityId);

  try {
    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('meeting.creatorId = :userId', { userId })
      .getOneOrFail();

    const activity = await activityRepository
      .createQueryBuilder('activity')
      .where('activity.id = :activityId', { activityId })
      .getOneOrFail();

    await activityRepository.softRemove(activity);
    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};
