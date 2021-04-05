import { Entity, Column, BeforeInsert } from 'typeorm';
import BaseEntity from './base/BaseEntity';
import hashPassword from '../utils/hashPassword';

@Entity()
class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @BeforeInsert()
  hashPassword(): void {
    this.password = hashPassword(this.password);
  }
}

export default User;
