import { RequestHandler, Response } from 'express';
import { Query, ParamsDictionary } from 'express-serve-static-core';
import { EntityNotFoundError, getRepository, In } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../auth/authController';
import Meeting, { MeetingStatus } from '../../entity/Meeting';
import MeetingDatesPollEntry from '../../entity/MeetingDatesPollEntry';
import User from '../../entity/User';
import UserMeetingDatesPollEntry from '../../entity/UserMeetingDatesPollEntry';

const MEETINGS_PAGE_SIZE = 10;

type UserMeetingsResponse =
  | {
      meetings: Meeting[];
      count: number;
    }
  | string;

interface IUserMeetingsQueryParams extends Query {
  page: string;
}

export const getUserMeetings: RequestHandler = async (
  req: AuthenticatedRequest<
    Record<string, never>,
    UserMeetingsResponse,
    Record<string, never>,
    IUserMeetingsQueryParams
  >,
  res: Response<UserMeetingsResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const userId = req.user.id;
    const page = parseInt(req.query.page);
    if (!page) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .send('Please provide a page parameter.');
    }
    const offset = (page - 1) * MEETINGS_PAGE_SIZE;
    const userParticipatedMeetings = await meetingRepository
      .createQueryBuilder('meeting')
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .leftJoinAndSelect('meeting.participants', 'participant')
      .leftJoinAndSelect('meeting.meetingDatesPollEntries', 'pollEntries')
      .leftJoinAndSelect('pollEntries.userMeetingDatesPollEntries', 'votes')
      .leftJoinAndSelect('votes.user', 'votedUser')
      .orderBy('pollEntries.startDate', 'DESC')
      .skip(offset)
      .take(MEETINGS_PAGE_SIZE)
      .getManyAndCount();

    return res.status(StatusCodes.OK).json({
      meetings: userParticipatedMeetings[0],
      count: userParticipatedMeetings[1]
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface IGetMeetingParams extends ParamsDictionary {
  id: string;
}

type MeetingResponse =
  | {
      meeting: Meeting;
    }
  | string;

export const getMeeting: RequestHandler = async (
  req: AuthenticatedRequest<IGetMeetingParams, MeetingResponse>,
  res: Response<MeetingResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const userId = req.user.id;
    const meetingId = parseInt(req.params.id);
    if (!meetingId) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .leftJoinAndSelect('meeting.participants', 'participant')
      .leftJoinAndSelect('meeting.meetingDatesPollEntries', 'pollEntries')
      .leftJoinAndSelect('pollEntries.userMeetingDatesPollEntries', 'votes')
      .leftJoinAndSelect('votes.user', 'votedUser')
      .orderBy('pollEntries.createDate', 'ASC')
      .getOneOrFail();

    return res.status(StatusCodes.OK).json({
      meeting
    });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface ICreateMeetingRequest {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  locationId: string;
  locationString: string;
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
    locationId,
    locationString,
    canUsersAddPollEntries,
    participantIds,
    datesPollEntries
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
      locationId,
      locationString,
      isDatesPollActive,
      canUsersAddPollEntries,
      creator: creatorUser,
      participants: [creatorUser, ...participants]
    });
    await meetingRepository.save(newMeeting);
    const meetingDatesPollEntryRepository = getRepository(
      MeetingDatesPollEntry
    );
    if (isDatesPollActive) {
      for (let i = 0; i < datesPollEntries.length; i++) {
        const pollEntry = meetingDatesPollEntryRepository.create({
          ...datesPollEntries[i],
          meeting: newMeeting
        });
        meetingDatesPollEntryRepository.save(pollEntry);
      }
    }
    return res.status(StatusCodes.CREATED).send({ createdMeeting: newMeeting });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface IMeetingAnnouncementGetParams extends ParamsDictionary {
  id: string;
}

interface IMeetingDatesPollEntryRequest {
  newMeetingDatesPollEntries: MeetingDatesPollEntry[];
  votes: IMeetingDatesPollVote[];
}

interface IMeetingDatesPollVote {
  meetingDatePollEntryId: boolean;
}

export const updateUserMeetingDatePollEntries: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingAnnouncementGetParams,
    MeetingDatesPollEntry[],
    IMeetingDatesPollEntryRequest
  >,
  res: Response<MeetingDatesPollEntry[]>
) => {
  const userId = req.user.id;
  const meetingId = parseInt(req.params.id);
  const meetingRepository = getRepository(Meeting);
  const meetingDatesPollEntryRepository = getRepository(MeetingDatesPollEntry);
  const userMeetingDatesPollEntryRepository = getRepository(
    UserMeetingDatesPollEntry
  );
  const userRepository = getRepository(User);

  try {
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .leftJoinAndSelect('meeting.creator', 'creator')
      .leftJoinAndSelect(
        'meeting.meetingDatesPollEntries',
        'meetingDatesPollEntries'
      )
      .getOneOrFail();

    const user = await userRepository.findOne(userId);

    if (
      !meeting.canUsersAddPollEntries &&
      req.body.newMeetingDatesPollEntries &&
      req.body.newMeetingDatesPollEntries.length &&
      meeting.creator.id !== user.id
    ) {
      return res.status(StatusCodes.FORBIDDEN).send();
    }

    const newPollEntries = req.body.newMeetingDatesPollEntries;
    const pollEntryVotes = req.body.votes;

    if (newPollEntries) {
      for (let i = 0; i < newPollEntries.length; i++) {
        const pollEntry = meetingDatesPollEntryRepository.create({
          ...newPollEntries[i],
          meeting: meeting
        });
        await meetingDatesPollEntryRepository.save(pollEntry);
        const newVote = userMeetingDatesPollEntryRepository.create({
          meetingDatesPollEntry: pollEntry,
          user: user
        });
        await userMeetingDatesPollEntryRepository.save(newVote);
      }
    }

    if (pollEntryVotes) {
      for (let i = 0; i < pollEntryVotes.length; i++) {
        console.log(pollEntryVotes.length);
        const pollEntry = await meetingDatesPollEntryRepository.findOne(
          Object.keys(pollEntryVotes[i])[0]
        );
        if (!pollEntry) {
          return res.status(StatusCodes.BAD_REQUEST).send();
        }
        const previousVote = await userMeetingDatesPollEntryRepository
          .createQueryBuilder('votes')
          .where('votes.meetingDatesPollEntryId = :pollEntryId', {
            pollEntryId: pollEntry.id
          })
          .andWhere('votes.userId = :userId', { userId })
          .getOne();
        if (!previousVote && Object.values(pollEntryVotes[i])[0]) {
          //create entry
          const newVote = userMeetingDatesPollEntryRepository.create({
            meetingDatesPollEntry: pollEntry,
            user: user
          });
          await userMeetingDatesPollEntryRepository.save(newVote);
          continue;
        }
        if (previousVote && !Object.values(pollEntryVotes[i])[0]) {
          //delete entry
          await userMeetingDatesPollEntryRepository.remove(previousVote);
        }
      }
    }

    const updatedPolls = await meetingDatesPollEntryRepository
      .createQueryBuilder('pollEntries')
      .where('pollEntries.meetingId = :meetingId', { meetingId })
      .leftJoinAndSelect('pollEntries.userMeetingDatesPollEntries', 'votes')
      .leftJoinAndSelect('votes.user', 'user')
      .orderBy('pollEntries.createDate', 'ASC')
      .getMany();
    res.status(StatusCodes.OK).json(updatedPolls);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};
