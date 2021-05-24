import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User from './User';

@Entity()
class Announcement extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Meeting, (meeting) => meeting.annoucements)
  meeting: Meeting;
}

export default Announcement;
