import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable
} from 'typeorm';
import Announcement from './Announcement';
import BaseEntity from './base/BaseEntity';
import Expense from './Expense';
import MeetingDatesPollEntry from './MeetingDatesPollEntry';
import User from './User';
import UserParticipationStatus from './UserParticipationStatus';

export enum MeetingStatus {
  Planned,
  Postponed,
  Started,
  Extended,
  Ended,
  Canceled
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
  @JoinTable()
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
}

export default Meeting;
