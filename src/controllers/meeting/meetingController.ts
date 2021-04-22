import { RequestHandler, Response } from 'express';
import { Query } from 'express-serve-static-core';
import { getRepository, In } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../auth/authController';
import Meeting, { MeetingStatus } from '../../entity/Meeting';
import User from '../../entity/User';

const MEETINGS_PAGE_SIZE = 10;

interface IUserMeetingsResponse {
  meetings: any; //TODO: add type
}

interface IUserMeetingsQueryParams extends Query {
  page: string;
}

export const getUserMeetings: RequestHandler = async (
  req: AuthenticatedRequest<
    Record<string, never>,
    IUserMeetingsResponse,
    Record<string, never>,
    IUserMeetingsQueryParams
  >,
  res: Response<IUserMeetingsResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const userId = req.user.id;
    const offset = (parseInt(req.query.page) - 1) * MEETINGS_PAGE_SIZE;
    const userParticipatedMeetings = await meetingRepository
      .createQueryBuilder('meeting')
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .leftJoinAndSelect('meeting.participants', 'participant')
      .orderBy('meeting.createDate')
      .skip(offset)
      .take(MEETINGS_PAGE_SIZE)
      .getManyAndCount();

    return res
      .status(StatusCodes.OK)
      .json({ meetings: userParticipatedMeetings });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface ICreateMeetingRequest {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: MeetingStatus;
  isDatesPollActive: boolean;
  canUsersAddPollEntries: boolean;
  participantIds: number[];
}

export const createMeeting: RequestHandler = async (
  req: AuthenticatedRequest<Record<string, never>, ICreateMeetingRequest>,
  res: Response
) => {
  const {
    name,
    description,
    startDate,
    endDate,
    status,
    isDatesPollActive,
    canUsersAddPollEntries,
    participantIds
  } = req.body;
  try {
    const meetingRepository = getRepository(Meeting);
    const userRepository = getRepository(User);
    const userId = req.user.id;
    const creatorUser = await userRepository.findOne(userId);
    const participants = await userRepository.find({
      where: {
        id: In(participantIds)
      }
    });
    const newMeeting = meetingRepository.create({
      name,
      description,
      startDate,
      endDate,
      status,
      isDatesPollActive,
      canUsersAddPollEntries,
      creator: creatorUser,
      participants: [creatorUser, ...participants]
    });
    await meetingRepository.save(newMeeting);
    return res.status(StatusCodes.CREATED).send({ createdMeeting: newMeeting });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};
