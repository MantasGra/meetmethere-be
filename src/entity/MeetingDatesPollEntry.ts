import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  OneToMany
} from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User from './User';
import UserMeetingDatesPollEntry from './UserMeetingDatesPollEntry';

@Entity()
class MeetingDatesPollEntry extends BaseEntity {
  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Meeting, (meeting) => meeting.meetingDatesPollEntries)
  meeting: Meeting;

  @OneToMany(
    () => UserMeetingDatesPollEntry,
    (userMeetingDatesPollEntry) =>
      userMeetingDatesPollEntry.meetingDatesPollEntry
  )
  userMeetingDatesPollEntries: UserMeetingDatesPollEntry[];
}

export default MeetingDatesPollEntry;
