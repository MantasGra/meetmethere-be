import { Entity, Column, ManyToOne } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';

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
}

export default Activity;
