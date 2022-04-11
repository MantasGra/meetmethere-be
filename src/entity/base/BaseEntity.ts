import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ select: false })
  createDate: Date;

  @UpdateDateColumn({ select: false })
  updateDate: Date;

  @DeleteDateColumn({ select: false })
  deleteDate: Date;
}

export const omitBaseDates = <T extends BaseEntity>(
  entity: T
): Omit<T, 'createDate' | 'updateDate' | 'deleteDate'> => {
  const result = { ...entity };
  delete result.createDate;
  delete result.updateDate;
  delete result.deleteDate;
  return result;
};

export default BaseEntity;
