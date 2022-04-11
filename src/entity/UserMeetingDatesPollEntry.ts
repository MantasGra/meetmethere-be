import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import MeetingDatesPollEntry from './MeetingDatesPollEntry';
import User from './User';

@Entity()
class UserMeetingDatesPollEntry extends BaseEntity {
  @ManyToOne(() => MeetingDatesPollEntry)
  meetingDatesPollEntry: MeetingDatesPollEntry;

  @Column()
  meetingDatesPollEntryId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;
}

export default UserMeetingDatesPollEntry;
