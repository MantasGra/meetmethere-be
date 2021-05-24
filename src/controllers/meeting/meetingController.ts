import { Request, RequestHandler, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { EntityNotFoundError, getRepository, ILike, In, Not } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../auth/authController';
import Meeting, { MeetingStatus } from '../../entity/Meeting';
import MeetingDatesPollEntry from '../../entity/MeetingDatesPollEntry';
import User from '../../entity/User';
import UserMeetingDatesPollEntry from '../../entity/UserMeetingDatesPollEntry';
import { sendMeetingInvitationMail } from '../../services/mailer';
import UserParticipationStatus from '../../entity/UserParticipationStatus';
import {
  IUserSelectOptionsRequestQuery,
  IUserSelectOptionsResponse
} from '../user/userController';

const MEETINGS_PAGE_SIZE = 10;

export enum ParticipationStatus {
  Invited = 'invited',
  Maybe = 'maybe',
  Going = 'going',
  Declined = 'declined'
}

type UserMeetingsResponse =
  | {
      meetings: any[];
      count: number;
    }
  | string;

interface IUserMeetingsQueryParams extends Query {
  page: string;
  typeOfMeeting: string;
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
    const meetingStatuses =
      req.query.typeOfMeeting === 'planned' ? ['0', '1', '2', '3'] : ['4', '5'];
    const userParticipatedMeetings = await meetingRepository
      .createQueryBuilder('meeting')
      .leftJoin('meeting.participants', 'participants')
      .innerJoin('participants.participant', 'user', 'user.id = :userId', {
        userId
      })
      .where('meeting.status IN (:...meetingStatuses)', {
        meetingStatuses: meetingStatuses
      })
      .orderBy('meeting.startDate', 'ASC')
      .leftJoinAndSelect('meeting.creator', 'creator')
      .leftJoinAndSelect('meeting.participants', 'participants2')
      .leftJoinAndSelect('participants2.participant', 'participant')
      .leftJoinAndSelect('meeting.meetingDatesPollEntries', 'pollEntries')
      .leftJoinAndSelect('pollEntries.userMeetingDatesPollEntries', 'votes')
      .leftJoinAndSelect('votes.user', 'votedUser')
      .orderBy('pollEntries.createDate', 'ASC')
      .skip(offset)
      .take(MEETINGS_PAGE_SIZE)
      .getManyAndCount();

    return res.status(StatusCodes.OK).json({
      meetings: userParticipatedMeetings[0].map((meeting) => ({
        ...meeting,
        participants: meeting.participants.map((participant) => ({
          userParticipationStatus: participant.userParticipationStatus,
          ...participant.participant
        }))
      })),
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
  res: Response<any>
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
      .innerJoin(
        'meeting.participants',
        'user',
        'user.participantId = :userId',
        {
          userId
        }
      )
      .leftJoinAndSelect('meeting.creator', 'creator')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .leftJoinAndSelect('participants.participant', 'participant')
      .leftJoinAndSelect('meeting.meetingDatesPollEntries', 'pollEntries')
      .leftJoinAndSelect('pollEntries.userMeetingDatesPollEntries', 'votes')
      .leftJoinAndSelect('votes.user', 'votedUser')
      .orderBy('pollEntries.createDate', 'ASC')
      .getOneOrFail();

    return res.status(StatusCodes.OK).json({
      meeting: {
        ...meeting,
        participants: meeting.participants.map((participant) => ({
          userParticipationStatus: participant.userParticipationStatus,
          ...participant.participant
        }))
      }
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
    const participantStatusRepository = getRepository(UserParticipationStatus);
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
      creator: creatorUser
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
        await meetingDatesPollEntryRepository.save(pollEntry);
      }
    }

    const participantsStatuses = participantStatusRepository.create(
      participants.map((user) => ({
        participant: user,
        meeting: newMeeting,
        userParticipationStatus: ParticipationStatus.Invited
      }))
    );

    await participantStatusRepository.save([
      participantStatusRepository.create({
        participant: creatorUser,
        meeting: newMeeting,
        userParticipationStatus: ParticipationStatus.Going
      }),
      ...participantsStatuses
    ]);

    sendMeetingInvitationMail(
      participants,
      newMeeting,
      process.env.APP_URL + '/invitations'
    );
    const refreshedMeeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId: newMeeting.id })
      .leftJoinAndSelect('meeting.creator', 'creator')
      .leftJoinAndSelect('meeting.participants', 'participants')
      .leftJoinAndSelect('participants.participant', 'participant')
      .leftJoinAndSelect('meeting.meetingDatesPollEntries', 'pollEntries')
      .leftJoinAndSelect('pollEntries.userMeetingDatesPollEntries', 'votes')
      .leftJoinAndSelect('votes.user', 'votedUser')
      .getOne();

    return res.status(StatusCodes.CREATED).send({
      createdMeeting: {
        ...refreshedMeeting,
        participants: refreshedMeeting.participants.map((participant) => ({
          userParticipationStatus: participant.userParticipationStatus,
          ...participant.participant
        }))
      }
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface IMeetingUpdateParams extends ParamsDictionary {
  id: string;
}

interface IUpdatedFieldsRequest {
  name: string;
  description: string;
  status: MeetingStatus;
  locationId: string;
  locationString: string;
  startDate: Date;
  endDate: Date;
}

interface IUpdatedFieldsResponse extends IUpdatedFieldsRequest {
  id: number;
}

export const updateMeeting: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingUpdateParams,
    IUpdatedFieldsResponse,
    IUpdatedFieldsRequest
  >,
  res: Response<IUpdatedFieldsResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const meetingId = parseInt(req.params.id);
    const userId = req.user.id;
    if (!meetingId) {
      return res.status(StatusCodes.BAD_REQUEST).send();
    }
    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.creator', 'creator', 'creator.id = :userId', {
        userId
      })
      .getOneOrFail();

    await meetingRepository.update(meetingId, req.body);
    return res.status(StatusCodes.OK).json({
      id: meetingId,
      ...req.body
    });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
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
      .innerJoin(
        'meeting.participants',
        'user',
        'user.participantId = :userId',
        {
          userId
        }
      )
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

interface IMeetingStatusRequest {
  status: ParticipationStatus;
}

export const setUserMeetingStatus: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingAnnouncementGetParams,
    Record<string, any>,
    IMeetingStatusRequest
  >,
  res: Response
) => {
  const userId = req.user.id;
  const meetingId = parseInt(req.params.id);
  const meetingRepository = getRepository(Meeting);
  const userRepository = getRepository(User);
  const userParticipationStatusRepository = getRepository(
    UserParticipationStatus
  );
  try {
    const user = await userRepository.findOne(userId);
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

    const userParticipationStatus = await userParticipationStatusRepository.findOne(
      {
        participant: user,
        meeting: meeting
      }
    );

    await userParticipationStatusRepository.save({
      ...userParticipationStatus,
      userParticipationStatus: req.body.status
    });

    return res.status(StatusCodes.OK).send();
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface IInviteUserToMeetingRequest {
  userIds: number[];
}

export const inviteUserToMeeting: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingAnnouncementGetParams,
    Record<string, any>,
    IInviteUserToMeetingRequest
  >,
  res: Response
) => {
  const userId = req.user.id;
  const meetingId = parseInt(req.params.id);
  const meetingRepository = getRepository(Meeting);
  const userRepository = getRepository(User);
  const userParticipationStatusRepository = getRepository(
    UserParticipationStatus
  );
  try {
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.creator', 'user', 'creatorId = :userId', {
        userId
      })
      .getOneOrFail();

    const invitedUsers = await userRepository.findByIds(req.body.userIds);

    const newInvitations: UserParticipationStatus[] = [];
    for (let i = 0; i < invitedUsers.length; i++) {
      const previousInvitation = await userParticipationStatusRepository.findOne(
        {
          meeting: meeting,
          participant: invitedUsers[i]
        }
      );

      if (!previousInvitation) {
        const invitation = userParticipationStatusRepository.create({
          meeting: meeting,
          participant: invitedUsers[i],
          userParticipationStatus: ParticipationStatus.Invited
        });

        newInvitations.push(invitation);
      }
    }

    await userParticipationStatusRepository.save(newInvitations);

    const invitedUserIds = newInvitations.map(
      (newInvitation) => newInvitation.participant.id
    );

    const newlyInvitedUsers = invitedUsers.filter((user) =>
      invitedUserIds.includes(user.id)
    );

    sendMeetingInvitationMail(
      newlyInvitedUsers,
      meeting,
      process.env.APP_URL + '/invitations'
    );

    return res.status(StatusCodes.OK).send(
      newInvitations.map((invitation) => ({
        userParticipationStatus: invitation.userParticipationStatus,
        ...invitation.participant
      }))
    );
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface IMeetingParams extends ParamsDictionary {
  id: string;
}

export const getMeetingInvitationSelectOptions: RequestHandler = async (
  req: AuthenticatedRequest<
    IMeetingParams,
    IUserSelectOptionsResponse,
    Record<string, never>,
    IUserSelectOptionsRequestQuery
  >,
  res: Response<IUserSelectOptionsResponse>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const meetingId = parseInt(req.params.id);
    const meetingParticipantIds = (
      await meetingRepository
        .createQueryBuilder('meeting')
        .where('meeting.id = :meetingId', { meetingId })
        .leftJoinAndSelect('meeting.participants', 'participants')
        .leftJoinAndSelect('participants.participant', 'participant')
        .getOne()
    ).participants.map((participant) => participant.participant.id);
    const userRepository = getRepository(User);
    const searchWords = req.query.searchText
      .split(' ')
      .map((value) => `%${value}%`);
    const userSelectOptions = await userRepository.find({
      select: ['id', 'name', 'lastName', 'color'],
      where: [
        ...searchWords.map((word) => ({
          id: Not(In(meetingParticipantIds)),
          name: ILike(word)
        })),
        ...searchWords.map((word) => ({
          id: Not(In(meetingParticipantIds)),
          lastName: ILike(word)
        }))
      ],
      order: { createDate: 'DESC' }
    });
    return res.status(StatusCodes.OK).json({
      options: userSelectOptions.map((option) => ({
        id: option.id,
        name: option.name,
        lastName: option.lastName,
        color: option.color
      }))
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

export const getUserInvitedMeetings: RequestHandler = async (
  req: AuthenticatedRequest<
    Record<string, any>,
    UserParticipationStatus[],
    Record<string, any>
  >,
  res: Response<UserParticipationStatus[]>
) => {
  const userId = req.user.id;
  const userParticipationStatusRepository = getRepository(
    UserParticipationStatus
  );
  try {
    const invitations = await userParticipationStatusRepository
      .createQueryBuilder('invitations')
      .where('invitations.participantId = :userId', { userId })
      .andWhere('invitations.userParticipationStatus = :invitedStatus', {
        invitedStatus: ParticipationStatus.Invited
      })
      .leftJoinAndSelect('invitations.meeting', 'meeting')
      .getMany();

    return res.status(StatusCodes.OK).json(invitations);
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};
