import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable
} from 'typeorm';
import Activity from './Activity';
import Announcement from './Announcement';
import BaseEntity from './base/BaseEntity';
import Expense from './Expense';
import MeetingDatesPollEntry from './MeetingDatesPollEntry';
import User from './User';

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

  @ManyToMany(() => User, (user) => user.participatedMeetings)
  @JoinTable()
  participants: User[];

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
}

export default Meeting;
