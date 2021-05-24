import { Entity, Column, BeforeInsert, ManyToMany, OneToMany } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import hashPassword from '../utils/hashPassword';
import randomEnum from '../utils/randomEnum';
import Expense from './Expense';

export enum UserColors {
  QueenBlue = '#33658A',
  DarkSkyBlue = '#86BBD8',
  MossGreen = '#758E4F',
  HoneyYellow = '#F6AE2D',
  SafetyOrangeBlazeOrange = '#F26419',
  DarkPurple = '#160F29',
  Champagne = '#F3DFC1',
  DesertSand = '#DDBEA8',
  LightGoldenrodYellow = '#FAFFD8',
  PastelPink = '#D6A2AD'
}

@Entity()
class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserColors,
    default: UserColors.QueenBlue
  })
  color: UserColors;

  @ManyToMany(() => Meeting, (meeting) => meeting.participants)
  participatedMeetings: Meeting[];

  @OneToMany(() => Meeting, (meeting) => meeting.creator)
  createdMeetings: Meeting[];

  @BeforeInsert()
  setRandomColor(): void {
    this.color = randomEnum(UserColors);
  }

  @BeforeInsert()
  hashPassword(): void {
    this.password = hashPassword(this.password);
  }

  @ManyToMany(() => Expense, (expense) => expense.users)
  expenses: Expense[];

  @OneToMany(() => Expense, 'createdBy')
  createdExpenses: Expense[];
}

export default User;
