import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import { IUser } from './User';
import UserMeetingDatesPollEntry from './UserMeetingDatesPollEntry';

export interface IMeetingDatesPollEntry {
  id: number;
  startDate: Date;
  endDate: Date;
  users: IUser[];
}

@Entity()
class MeetingDatesPollEntry extends BaseEntity {
  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Meeting, (meeting) => meeting.meetingDatesPollEntries)
  meeting: Meeting;

  @Column()
  meetingId: number;

  @OneToMany(
    () => UserMeetingDatesPollEntry,
    (userMeetingDatesPollEntry) =>
      userMeetingDatesPollEntry.meetingDatesPollEntry
  )
  userMeetingDatesPollEntries: UserMeetingDatesPollEntry[];

  toJSON(): IMeetingDatesPollEntry {
    return {
      id: this.id,
      startDate: this.startDate,
      endDate: this.endDate,
      users:
        this?.userMeetingDatesPollEntries?.map((userEntry) => userEntry.user) ||
        []
    };
  }
}

export default MeetingDatesPollEntry;
