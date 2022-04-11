import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User, { IUser } from './User';

export interface IAnnouncement {
  id: number;
  title: string;
  description: string;
  user: IUser;
  createDate: Date;
}

@Entity()
class Announcement extends BaseEntity {
  @Column()
  title: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Meeting, (meeting) => meeting.annoucements)
  meeting: Meeting;

  @Column()
  meetingId: number;

  toJSON = (): IAnnouncement => {
    const resultingJSON = { ...this };
    delete resultingJSON.deleteDate;
    delete resultingJSON.updateDate;
    delete resultingJSON.meetingId;
    return resultingJSON;
  };
}

export default Announcement;
