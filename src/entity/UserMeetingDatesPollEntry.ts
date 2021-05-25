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
import MeetingDatesPollEntry from './MeetingDatesPollEntry';
import User from './User';

@Entity()
class UserMeetingDatesPollEntry extends BaseEntity {
  @ManyToOne(() => MeetingDatesPollEntry)
  meetingDatesPollEntry: MeetingDatesPollEntry;

  @ManyToOne(() => User)
  user: User;
}

export default UserMeetingDatesPollEntry;
