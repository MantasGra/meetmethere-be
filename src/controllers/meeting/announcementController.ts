import { Query } from 'express-serve-static-core';
import { getRepository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { MeetingRouteParams } from './meetingController';
import { AuthenticatedHandler } from '../auth/authController';
import Meeting from '../../entity/Meeting';
import Announcement, { IAnnouncement } from '../../entity/Announcement';
import User from '../../entity/User';
import { asyncHandler } from '../../utils/route-handlers';

const ANNOUNCEMENTS_PAGE_SIZE = 5;

interface MeetingAnnouncementsQuery extends Query {
  page: string;
}

interface MeetingAnnouncementsResponse {
  announcements: IAnnouncement[];
  count: number;
}

export const getMeetingAnnouncements = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    MeetingAnnouncementsResponse,
    Record<string, never>,
    MeetingAnnouncementsQuery
  >
>(async (req, res) => {
  const announcementsRepository = getRepository(Announcement);
  const meetingId = parseInt(req.params.id);
  const page = parseInt(req.query.page) || 1;
  if (!meetingId) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  const offset = (page - 1) * ANNOUNCEMENTS_PAGE_SIZE;

  const announcements = await announcementsRepository.findAndCount({
    select: ['createDate', 'description', 'id', 'title'],
    where: { meetingId },
    relations: ['user'],
    order: { createDate: 'DESC' },
    skip: offset,
    take: ANNOUNCEMENTS_PAGE_SIZE
  });

  return res.status(StatusCodes.OK).json({
    announcements: announcements[0].map((announcement) =>
      announcement.toJSON()
    ),
    count: announcements[1]
  });
});

type CreateAnnouncementRequest = Pick<IAnnouncement, 'title' | 'description'>;

interface CreateAnnouncementResponse {
  createdAnnouncement: IAnnouncement;
}

export const createMeetingAnnouncement = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    CreateAnnouncementResponse,
    CreateAnnouncementRequest
  >
>(async (req, res) => {
  const announcementsRepository = getRepository(Announcement);
  const userRepository = getRepository(User);
  const userId = res.locals.user.id;
  const meetingId = parseInt(req.params.id);
  const { title, description } = req.body;
  const creatorUser = await userRepository.findOne(userId);

  const newAnnouncement = announcementsRepository.create({
    title,
    description,
    user: creatorUser,
    meetingId
  });
  await announcementsRepository.save(newAnnouncement);
  return res.status(StatusCodes.CREATED).json({
    createdAnnouncement: newAnnouncement.toJSON()
  });
});

interface MeetingAnnouncementRouteParams extends MeetingRouteParams {
  announcementId: string;
}

type EditAnnouncementRequest = Partial<CreateAnnouncementRequest>;

export const editMeetingAnnouncement: AuthenticatedHandler<
  MeetingAnnouncementRouteParams,
  IAnnouncement,
  EditAnnouncementRequest
> = async (req, res) => {
  const announcementRepository = getRepository(Announcement);
  const userId = res.locals.user.id;
  const announcementId = parseInt(req.params.announcementId);
  const announcement = await announcementRepository.findOneOrFail(
    announcementId,
    {
      select: ['createDate', 'description', 'id', 'title'],
      join: {
        alias: 'announcement',
        innerJoinAndSelect: {
          user: 'announcement.user'
        }
      },
      where: {
        user: {
          id: userId
        }
      }
    }
  );
  const updatedAnnouncement = announcementRepository.merge(
    announcement,
    req.body
  );
  await announcementRepository.save(updatedAnnouncement);
  return res.status(StatusCodes.OK).json(updatedAnnouncement.toJSON());
};

export const deleteMeetingAnnouncement = asyncHandler<
  AuthenticatedHandler<MeetingAnnouncementRouteParams>
>(async (req, res) => {
  const announcementRepository = getRepository(Announcement);
  const meetingRepository = getRepository(Meeting);
  const userId = res.locals.user.id;

  const meetingId = parseInt(req.params.id);
  const announcementId = parseInt(req.params.announcementId);

  const meeting = await meetingRepository.findOne(meetingId, {
    relations: ['creator']
  });

  const announcement = await announcementRepository.findOneOrFail(
    announcementId,
    { relations: ['user'] }
  );

  if (announcement.user.id === userId || meeting.creator.id === userId) {
    await announcementRepository.softRemove(announcement);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
  return res.status(StatusCodes.FORBIDDEN).send();
});
