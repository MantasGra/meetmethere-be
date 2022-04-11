import { Column, Entity } from 'typeorm';
import BaseEntity from './base/BaseEntity';

export interface TokenContents {
  id: number;
}

@Entity()
class Token extends BaseEntity {
  @Column()
  tokenValue: string;
}

export default Token;
