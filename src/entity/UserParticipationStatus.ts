import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User, { IUser } from './User';

export enum ParticipationStatus {
  Invited = 'invited',
  Maybe = 'maybe',
  Going = 'going',
  Declined = 'declined'
}

export interface IParticipant extends IUser {
  userParticipationStatus: ParticipationStatus;
}

@Entity()
class UserParticipationStatus extends BaseEntity {
  @Column()
  userParticipationStatus: ParticipationStatus;

  @ManyToOne(() => User)
  participant: User;

  @Column()
  participantId: number;

  @ManyToOne(() => Meeting)
  meeting: Meeting;

  @Column()
  meetingId: number;

  toParticipant(): IParticipant {
    return {
      ...this?.participant,
      userParticipationStatus: this.userParticipationStatus
    };
  }
}

export default UserParticipationStatus;
