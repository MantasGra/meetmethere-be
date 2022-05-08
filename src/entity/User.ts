import { BeforeInsert, Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import randToken from 'rand-token';
import BaseEntity from './base/BaseEntity';
import Meeting from './Meeting';
import { hashPassword } from '../utils/hashPassword';
import randomEnum from '../utils/randomEnum';
import Expense from './Expense';
import UserMeetingDatesPollEntry from './UserMeetingDatesPollEntry';
import UserParticipationStatus from './UserParticipationStatus';

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

export interface IUser {
  id: number;
  email: string;
  name: string;
  lastName: string;
  color: UserColors;
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

  @Column({
    select: false,
    length: 16,
    nullable: true
  })
  passwordResetToken: string | null;

  @OneToMany(
    () => UserParticipationStatus,
    (participation) => participation.participant
  )
  participatedMeetings: UserParticipationStatus[];

  @OneToMany(() => Meeting, (meeting) => meeting.creator)
  createdMeetings: Meeting[];

  @BeforeInsert()
  setRandomColor(): void {
    this.color = randomEnum(UserColors);
  }

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    this.password = await hashPassword(this.password);
  }

  async setPassword(password: string): Promise<void> {
    this.password = await hashPassword(password);
  }

  @ManyToMany(() => Expense, (expense) => expense.users)
  expenses: Expense[];

  @OneToMany(() => Expense, 'createdBy')
  createdExpenses: Expense[];

  @OneToMany(
    () => UserMeetingDatesPollEntry,
    (userMeetingDatesPollEntry) => userMeetingDatesPollEntry.user
  )
  userMeetingDatesPollEntries: UserMeetingDatesPollEntry[];

  generatePasswordResetToken(): void {
    this.passwordResetToken = randToken.generate(16);
  }
}

export default User;
