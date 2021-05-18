import { Entity, Column, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User from './User';

@Entity()
class MeetingDatesPollEntry extends BaseEntity {
  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Meeting, (meeting) => meeting.meetingDatesPollEntries)
  meeting: Meeting;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];
}

export default MeetingDatesPollEntry;
