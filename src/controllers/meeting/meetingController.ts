import { ParamsDictionary, Query } from 'express-serve-static-core';
import { ILike, In, Not, getRepository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedHandler } from '../auth/authController';
import Meeting, { MeetingStatus, IMeeting } from '../../entity/Meeting';
import MeetingDatesPollEntry, {
  IMeetingDatesPollEntry
} from '../../entity/MeetingDatesPollEntry';
import User from '../../entity/User';
import UserMeetingDatesPollEntry from '../../entity/UserMeetingDatesPollEntry';
import { sendMeetingInvitationMail } from '../../services/mailer';
import UserParticipationStatus, {
  ParticipationStatus,
  IParticipant
} from '../../entity/UserParticipationStatus';
import {
  UserSelectOptionsRequestQuery,
  UserSelectOptionsResponse
} from '../user/userController';
import { asyncHandler } from '../../utils/route-handlers';

export interface MeetingRouteParams extends ParamsDictionary {
  id: string;
}

export const isMeetingParticipant = asyncHandler<
  AuthenticatedHandler<MeetingRouteParams>
>(async (req, res, next) => {
  const meetingRepository = getRepository(Meeting);

  const userId = res.locals.user.id;
  const meetingId = parseInt(req.params.id);

  await meetingRepository
    .createQueryBuilder('meeting')
    .where('meeting.id = :meetingId', { meetingId })
    .innerJoin('meeting.participants', 'user', 'user.participantId = :userId', {
      userId
    })
    .getOneOrFail();

  next();
});

export const isMeetingCreator = asyncHandler<
  AuthenticatedHandler<MeetingRouteParams>
>(async (req, res, next) => {
  const meetingRepository = getRepository(Meeting);

  const userId = res.locals.user.id;
  const meetingId = parseInt(req.params.id);

  const meeting = await meetingRepository.findOneOrFail(meetingId, {
    relations: ['creator']
  });

  if (meeting.creator.id !== userId) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  next();
});

const MEETINGS_PAGE_SIZE = 10;

interface UserMeetingsResponse {
  meetings: IMeeting[];
  count: number;
}

interface UserMeetingsQueryParams extends Query {
  page: string;
  typeOfMeeting: '' | 'planned' | 'archived';
}

export const getUserMeetings = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    UserMeetingsResponse,
    Record<string, never>,
    UserMeetingsQueryParams
  >
>(async (req, res) => {
  const meetingRepository = getRepository(Meeting);
  const userId = res.locals.user.id;
  const page = parseInt(req.query.page) || 1;
  const offset = (page - 1) * MEETINGS_PAGE_SIZE;
  const meetingStatuses =
    req.query.typeOfMeeting === 'archived'
      ? [MeetingStatus.Ended, MeetingStatus.Canceled]
      : [
          MeetingStatus.Planned,
          MeetingStatus.Postponed,
          MeetingStatus.Started,
          MeetingStatus.Extended
        ];

  // This query builder is required here as usual find options
  // are unable to apply conditions on joins and this join is important
  // to filter out only meetings where current user participates
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
    .skip(offset)
    .take(MEETINGS_PAGE_SIZE)
    .getManyAndCount();

  return res.status(StatusCodes.OK).json({
    meetings: userParticipatedMeetings[0].map((meeting) => meeting.toJSON()),
    count: userParticipatedMeetings[1]
  });
});

interface MeetingResponse {
  meeting: IMeeting;
}

export const getMeeting = asyncHandler<
  AuthenticatedHandler<MeetingRouteParams, MeetingResponse>
>(async (req, res) => {
  const meetingRepository = getRepository(Meeting);
  const meetingId = parseInt(req.params.id);

  const meeting = await meetingRepository.findOneOrFail(meetingId, {
    join: {
      alias: 'meeting',
      leftJoinAndSelect: {
        creator: 'meeting.creator',
        participants: 'meeting.participants',
        participant: 'participants.participant',
        pollEntries: 'meeting.meetingDatesPollEntries',
        votes: 'pollEntries.userMeetingDatesPollEntries',
        votedUser: 'votes.user'
      }
    }
  });

  return res.status(StatusCodes.OK).json({
    meeting: meeting.toJSON()
  });
});

type INewMeetingDatesPollEntry = Pick<
  IMeetingDatesPollEntry,
  'startDate' | 'endDate'
>;

interface CreateMeetingRequest {
  name: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
  locationString?: string;
  status: MeetingStatus;
  isDatesPollActive: boolean;
  canUsersAddPollEntries: boolean;
  participantIds: number[];
  datesPollEntries: INewMeetingDatesPollEntry[];
}

interface CreateMeetingResponse {
  createdMeeting: IMeeting;
}

export const createMeeting = asyncHandler<
  AuthenticatedHandler<
    Record<string, never>,
    CreateMeetingResponse,
    CreateMeetingRequest
  >
>(async (req, res) => {
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
  const meetingRepository = getRepository(Meeting);
  const userRepository = getRepository(User);
  const participantStatusRepository = getRepository(UserParticipationStatus);
  const userId = res.locals.user.id;
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
  const meetingDatesPollEntryRepository = getRepository(MeetingDatesPollEntry);
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

  const refreshedMeeting = await meetingRepository.findOne(newMeeting.id, {
    join: {
      alias: 'meeting',
      leftJoinAndSelect: {
        creator: 'meeting.creator',
        participants: 'meeting.participants',
        participant: 'participants.participant',
        pollEntries: 'meeting.meetingDatesPollEntries'
      }
    }
  });

  return res.status(StatusCodes.CREATED).send({
    createdMeeting: refreshedMeeting.toJSON()
  });
});

interface UpdateMeetingRequest {
  name?: string;
  description?: string;
  status?: MeetingStatus;
  locationId?: string;
  locationString?: string;
  startDate?: Date;
  endDate?: Date;
}

interface UpdateMeetingResponse {
  updatedMeeting: IMeeting;
}

export const updateMeeting = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    UpdateMeetingResponse,
    UpdateMeetingRequest
  >
>(async (req, res) => {
  const meetingRepository = getRepository(Meeting);
  const meetingId = parseInt(req.params.id);

  await meetingRepository.update(meetingId, req.body);

  const refreshedMeeting = await meetingRepository.findOne(meetingId, {
    join: {
      alias: 'meeting',
      leftJoinAndSelect: {
        creator: 'meeting.creator',
        participants: 'meeting.participants',
        participant: 'participants.participant',
        pollEntries: 'meeting.meetingDatesPollEntries'
      }
    }
  });
  return res
    .status(StatusCodes.OK)
    .json({ updatedMeeting: refreshedMeeting.toJSON() });
});

interface IMeetingDatesPollVotes {
  [meetingDatePollEntryId: string]: boolean;
}

interface MeetingDatesPollEntryRequest {
  newMeetingDatesPollEntries: INewMeetingDatesPollEntry[];
  votes: IMeetingDatesPollVotes;
}

export const updateUserMeetingDatePollEntries = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    IMeetingDatesPollEntry[],
    MeetingDatesPollEntryRequest
  >
>(async (req, res) => {
  const userId = res.locals.user.id;
  const meetingId = parseInt(req.params.id);
  const meetingRepository = getRepository(Meeting);
  const meetingDatesPollEntryRepository = getRepository(MeetingDatesPollEntry);
  const userMeetingDatesPollEntryRepository = getRepository(
    UserMeetingDatesPollEntry
  );
  const userRepository = getRepository(User);
  const meeting = await meetingRepository.findOne(meetingId, {
    join: {
      alias: 'meeting',
      leftJoinAndSelect: {
        creator: 'meeting.creator',
        pollEntries: 'meeting.meetingDatesPollEntries'
      }
    }
  });

  if (!meeting.isDatesPollActive) {
    return res.status(StatusCodes.BAD_REQUEST).send();
  }

  const user = await userRepository.findOne(userId);

  const newPollEntries = req.body.newMeetingDatesPollEntries;
  const pollEntryVotes = req.body.votes;

  if (
    !meeting.canUsersAddPollEntries &&
    newPollEntries &&
    newPollEntries.length &&
    meeting.creator.id !== user.id
  ) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

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
    const pollEntryKeys = Object.keys(pollEntryVotes);
    for (let i = 0; i < pollEntryKeys.length; i++) {
      const entryId = parseInt(pollEntryKeys[i]);
      const pollEntry = await meetingDatesPollEntryRepository.findOne(entryId);
      if (!pollEntry) {
        return res.status(StatusCodes.BAD_REQUEST).send();
      }
      const previousVote = await userMeetingDatesPollEntryRepository.findOne({
        where: {
          meetingDatesPollEntryId: entryId,
          userId
        }
      });

      if (!previousVote && pollEntryVotes[entryId]) {
        //create entry
        const newVote = userMeetingDatesPollEntryRepository.create({
          meetingDatesPollEntry: pollEntry,
          user: user
        });
        await userMeetingDatesPollEntryRepository.save(newVote);
        continue;
      }
      if (previousVote && !pollEntryVotes[entryId]) {
        //delete entry
        await userMeetingDatesPollEntryRepository.remove(previousVote);
      }
    }
  }

  const updatedPollEntries = await meetingDatesPollEntryRepository.find({
    where: {
      meetingId
    },
    join: {
      alias: 'pollEntry',
      leftJoinAndSelect: {
        votes: 'pollEntry.userMeetingDatesPollEntries',
        user: 'votes.user'
      }
    },
    order: {
      createDate: 'ASC'
    }
  });

  res
    .status(StatusCodes.OK)
    .json(updatedPollEntries.map((pollEntry) => pollEntry.toJSON()));
});

interface MeetingStatusRequest {
  status: ParticipationStatus;
}

export const setUserMeetingStatus = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    Record<string, never>,
    MeetingStatusRequest
  >
>(async (req, res) => {
  const userId = res.locals.user.id;
  const meetingId = parseInt(req.params.id);
  const userParticipationStatusRepository = getRepository(
    UserParticipationStatus
  );

  const userParticipationStatus =
    await userParticipationStatusRepository.findOne({
      participantId: userId,
      meetingId
    });

  await userParticipationStatusRepository.save({
    ...userParticipationStatus,
    userParticipationStatus: req.body.status
  });

  return res.status(StatusCodes.OK).send();
});

interface InviteUserToMeetingRequest {
  userIds: number[];
}

interface InviteUserToMeetingResponse {
  newParticipants: IParticipant[];
}

export const inviteUserToMeeting = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    InviteUserToMeetingResponse,
    InviteUserToMeetingRequest
  >
>(async (req, res) => {
  const meetingId = parseInt(req.params.id);
  const meetingRepository = getRepository(Meeting);
  const userRepository = getRepository(User);
  const userParticipationStatusRepository = getRepository(
    UserParticipationStatus
  );

  const meeting = await meetingRepository.findOne(meetingId);

  const invitedUsers = await userRepository.findByIds(req.body.userIds);

  const newInvitations: UserParticipationStatus[] = [];
  const newlyInvitedUsers: User[] = [];
  for (let i = 0; i < invitedUsers.length; i++) {
    const previousInvitation = await userParticipationStatusRepository.findOne({
      meeting: meeting,
      participant: invitedUsers[i]
    });

    if (!previousInvitation) {
      const invitation = userParticipationStatusRepository.create({
        meeting: meeting,
        participant: invitedUsers[i],
        userParticipationStatus: ParticipationStatus.Invited
      });

      newInvitations.push(invitation);
      newlyInvitedUsers.push(invitedUsers[i]);
    }
  }

  await userParticipationStatusRepository.save(newInvitations);

  sendMeetingInvitationMail(
    newlyInvitedUsers,
    meeting,
    process.env.APP_URL + '/invitations'
  );

  return res.status(StatusCodes.OK).send({
    newParticipants: newInvitations.map((invitation) =>
      invitation.toParticipant()
    )
  });
});

export const getMeetingInvitationSelectOptions = asyncHandler<
  AuthenticatedHandler<
    MeetingRouteParams,
    UserSelectOptionsResponse,
    Record<string, never>,
    UserSelectOptionsRequestQuery
  >
>(async (req, res) => {
  const meetingRepository = getRepository(Meeting);
  const meetingId = parseInt(req.params.id);
  const searchText = req.query.searchText || '';

  const meeting = await meetingRepository.findOne(meetingId, {
    join: {
      alias: 'meeting',
      leftJoinAndSelect: {
        participants: 'meeting.participants'
      }
    }
  });
  const meetingParticipantIds = meeting.participants.map(
    (participant) => participant.participantId
  );
  const userRepository = getRepository(User);
  const searchWords = searchText.split(' ').map((value) => `%${value}%`);
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
});

// TODO: verify with FE to check for best response format, current seems edgy
export const getUserInvitedMeetings = asyncHandler<
  AuthenticatedHandler<Record<string, never>, UserParticipationStatus[]>
>(async (req, res) => {
  const userId = res.locals.user.id;
  const userParticipationStatusRepository = getRepository(
    UserParticipationStatus
  );
  const invitations = await userParticipationStatusRepository.find({
    where: {
      participantId: userId,
      userParticipationStatus: ParticipationStatus.Invited
    },
    join: {
      alias: 'invitations',
      leftJoinAndSelect: {
        meeting: 'invitations.meeting'
      }
    }
  });

  return res.status(StatusCodes.OK).json(invitations);
});
