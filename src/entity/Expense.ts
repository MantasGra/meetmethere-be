import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import User from './User';

@Entity()
class Expense extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ type: 'double' })
  amount: number;

  @ManyToMany(() => User, (user) => user.expenses)
  @JoinTable()
  users: User[];

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @ManyToOne(() => Meeting, { nullable: false })
  meeting: Meeting;
}

export default Expense;
