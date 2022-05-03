import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import Activity from './Activity';
import Announcement from './Announcement';
import BaseEntity from './base/BaseEntity';
import Expense from './Expense';
import MeetingDatesPollEntry, {
  IMeetingDatesPollEntry
} from './MeetingDatesPollEntry';
import User, { IUser } from './User';
import UserParticipationStatus, {
  IParticipant
} from './UserParticipationStatus';

export enum MeetingStatus {
  Planned,
  Postponed,
  Started,
  Extended,
  Ended,
  Canceled
}

export interface IMeeting {
  id: number;
  name: string;
  description: string;
  startDate: Date | null;
  endDate: Date | null;
  status: MeetingStatus;
  locationId: string | null;
  locationString: string | null;
  isDatesPollActive: boolean;
  canUsersAddPollEntries: boolean;
  creator: IUser;
  participants: IParticipant[];
  meetingDatesPollEntries: IMeetingDatesPollEntry[];
}

@Entity()
class Meeting extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: MeetingStatus,
    default: MeetingStatus.Planned
  })
  status: MeetingStatus;

  @Column({ nullable: true })
  locationId: string;

  @Column({ nullable: true })
  locationString: string;

  @Column()
  isDatesPollActive: boolean;

  @Column()
  canUsersAddPollEntries: boolean;

  @ManyToOne(() => User, (user) => user.createdMeetings)
  creator: User;

  @OneToMany(
    () => UserParticipationStatus,
    (participation) => participation.meeting
  )
  participants: UserParticipationStatus[];

  @OneToMany(
    () => MeetingDatesPollEntry,
    (meetingDatePollEntry) => meetingDatePollEntry.meeting
  )
  meetingDatesPollEntries: MeetingDatesPollEntry[];

  @OneToMany(() => Announcement, (announcement) => announcement.meeting)
  annoucements: Announcement[];

  @OneToMany(() => Expense, (expense) => expense.meeting, { cascade: true })
  expenses: Expense[];

  @OneToMany(() => Activity, (activity) => activity.meeting, { cascade: true })
  activities: Activity[];

  toJSON = (): IMeeting => {
    return {
      ...this,
      participants:
        this.participants?.map((participant) => participant.toParticipant()) ||
        [],
      meetingDatesPollEntries:
        this.meetingDatesPollEntries
          ?.sort((entry, otherEntry) => {
            if (
              entry.userMeetingDatesPollEntries?.length ===
              otherEntry.userMeetingDatesPollEntries?.length
            ) {
              return (
                new Date(entry.startDate).getTime() -
                new Date(otherEntry.startDate).getTime()
              );
            }
            return (
              otherEntry.userMeetingDatesPollEntries?.length -
              entry.userMeetingDatesPollEntries?.length
            );
          })
          .map((entry) => entry.toJSON()) || []
    };
  };
}

export default Meeting;
