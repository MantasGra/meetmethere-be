import { RequestHandler, Response } from 'express';
import { Query, ParamsDictionary } from 'express-serve-static-core';
import { EntityNotFoundError, getRepository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../auth/authController';
import Meeting from '../../entity/Meeting';
import Announcement from '../../entity/Announcement';
import User from '../../entity/User';

const ANNOUNCEMENTS_PAGE_SIZE = 5;

interface IMeetingAnnouncementsQueryParams extends Query {
  page: string;
}

interface IMeetingAnnouncementGetParams extends ParamsDictionary {
  id: string;
}

type MeetingAnnouncementsResponse =
  | {
      announcements: Announcement[];
      count: number;
    }
  | string;

export const getMeetingAnnouncements: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingAnnouncementGetParams,
    MeetingAnnouncementsResponse,
    Record<string, never>,
    IMeetingAnnouncementsQueryParams
  >,
  res: Response<MeetingAnnouncementsResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const announcementsRepository = getRepository(Announcement);
    const userId = req.user.id;
    const meetingId = parseInt(req.params.id);
    const page = parseInt(req.query.page);
    if (!meetingId || !page) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }
    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin(
        'meeting.participants',
        'user',
        'user.participantId = :userId',
        {
          userId
        }
      )
      .getOneOrFail();

    const offset = (page - 1) * ANNOUNCEMENTS_PAGE_SIZE;

    const announcements = await announcementsRepository
      .createQueryBuilder('announcement')
      .where('announcement.meetingId = :meetingId', { meetingId })
      .leftJoinAndSelect('announcement.user', 'user')
      .orderBy('announcement.createDate', 'DESC')
      .skip(offset)
      .take(ANNOUNCEMENTS_PAGE_SIZE)
      .getManyAndCount();

    return res.status(StatusCodes.OK).json({
      announcements: announcements[0],
      count: announcements[1]
    });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface ICreateAnnouncementRequest {
  title: string;
  description: string;
}

type CreateAnnouncementResponse =
  | {
      createdAnnouncement: Pick<
        Announcement,
        'id' | 'title' | 'description' | 'user' | 'createDate'
      >;
    }
  | string;

export const createMeetingAnnouncement: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingAnnouncementGetParams,
    CreateAnnouncementResponse,
    ICreateAnnouncementRequest,
    Record<string, never>
  >,
  res: Response<CreateAnnouncementResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const announcementsRepository = getRepository(Announcement);
    const userRepository = getRepository(User);
    const userId = req.user.id;
    const meetingId = req.params.id;
    const { title, description } = req.body;
    const creatorUser = await userRepository.findOne(userId);
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin(
        'meeting.participants',
        'user',
        'user.participantId = :userId',
        {
          userId
        }
      )
      .getOneOrFail();
    const newAnnouncement = announcementsRepository.create({
      title,
      description,
      user: creatorUser,
      meeting
    });
    await announcementsRepository.save(newAnnouncement);
    return res.status(StatusCodes.CREATED).json({
      createdAnnouncement: {
        id: newAnnouncement.id,
        title: newAnnouncement.title,
        description: newAnnouncement.description,
        user: newAnnouncement.user,
        createDate: newAnnouncement.createDate
      }
    });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};


interface IMeetingAnnouncementEditParams extends ParamsDictionary {
  meetingId: string;
  announcementId: string;
}

export const editMeetingAnnouncement: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingAnnouncementEditParams,
    Announcement,
    ICreateAnnouncementRequest,
    Record<string, never>
  >,
  res: Response<Announcement>
) => {
  const meetingRepository = getRepository(Meeting);
  const announcementRepository = getRepository(Announcement);
  const userId = req.user.id;
  const meetingId = parseInt(req.params.meetingId);
  const announcementId = parseInt(req.params.announcementId);

  try {
    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .andWhere('meeting.creatorId = :userId', { userId })
      .getOneOrFail();

    const announcement = await announcementRepository.findOneOrFail(
      announcementId
    );

    const result = await announcementRepository.save({
      ...announcement,
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


export const deleteMeetingAnnouncement: RequestHandler = async (
  req: AuthenticatedRequest<IMeetingAnnouncementEditParams>,
  res: Response
) => {
  const announcementRepository = getRepository(Announcement);
  const meetingRepository = getRepository(Meeting);
  const userId = req.user.id;

  const meetingId = parseInt(req.params.meetingId);
  const announcementId = parseInt(req.params.announcementId);

  try {
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin(
        'meeting.participants',
        'user',
        'user.participantId = :userId',
        {
          userId
        }
      )
      .leftJoinAndSelect('meeting.creator', 'creator')
      .getOneOrFail();

    const announcement = await announcementRepository
      .createQueryBuilder('announcement')
      .where('announcement.id = :announcementId', { announcementId })
      .leftJoinAndSelect('announcement.user', 'user')
      .getOneOrFail();

    if (announcement.user.id === userId || meeting.creator.id === userId) {
      await announcementRepository.softRemove(announcement);
      return res.status(StatusCodes.NO_CONTENT).send();
    }
    return res.status(StatusCodes.FORBIDDEN).send();
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};
