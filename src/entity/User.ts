import { Entity, Column } from 'typeorm';
import BaseEntity from './base/BaseEntity';

@Entity()
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column({ select: false })
  password: string;
}
