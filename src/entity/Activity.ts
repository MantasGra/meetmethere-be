import { Column, Entity, ManyToOne } from 'typeorm';
import BaseEntity, { omitBaseDates } from './base/BaseEntity';
import Meeting from './Meeting';

export interface IActivity {
  id: number;
  name: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

@Entity()
class Activity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToOne(() => Meeting, { nullable: false })
  meeting: Meeting;

  @Column()
  meetingId: number;

  toJSON = (): IActivity => {
    const result = { ...omitBaseDates(this) };
    delete result.meetingId;
    return result;
  };
}

export default Activity;
