import { Entity, Column, ManyToOne } from 'typeorm';
import { ParticipationStatus } from '../controllers/meeting/meetingController';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User from './User';

@Entity()
class UserParticipationStatus extends BaseEntity {
  @Column()
  userParticipationStatus: ParticipationStatus;

  @ManyToOne(() => User)
  participant: User;

  @ManyToOne(() => Meeting)
  meeting: Meeting;
}

export default UserParticipationStatus;
