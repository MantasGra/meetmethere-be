import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import BaseEntity, { omitBaseDates } from './base/BaseEntity';
import Meeting from './Meeting';
import User, { IUser } from './User';

export interface IExpense {
  name: string;
  description: string;
  amount: number;
  users: IUser[];
  createdBy: IUser;
}

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

  @Column()
  meetingId: number;

  toJSON = (): IExpense => {
    const resultingJSON = { ...omitBaseDates(this) };
    delete resultingJSON.meetingId;
    return resultingJSON;
  };
}

export default Expense;
