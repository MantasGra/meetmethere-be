import type { Query } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { ILike, Not, getRepository } from 'typeorm';
import { AuthenticatedHandler } from '../auth/authController';
import User, { IUser } from '../../entity/User';
import { asyncHandler } from '../../utils/route-handlers';

export const getSelf = asyncHandler<
  AuthenticatedHandler<Record<string, never>, IUser>
>(async (req, res) => {
  const userRepository = getRepository(User);
  const user = await userRepository.findOneOrFail(res.locals.user.id);
  return res.status(StatusCodes.OK).json({
    id: user.id,
    email: user.email,
    name: user.name,
    lastName: user.lastName,
    color: user.color
  });
});

export interface UserSelectOptionsRequestQuery extends Query {
  searchText: string;
}

export interface UserSelectOptionsResponse {
  options: Omit<IUser, 'email'>[];
}

export const getUserSelectOptions = asyncHandler<
  AuthenticatedHandler<
    Record<string, never>,
    UserSelectOptionsResponse,
    Record<string, never>,
    UserSelectOptionsRequestQuery
  >
>(async (req, res) => {
  try {
    const userRepository = getRepository(User);
    const searchWords = (req.query.searchText || '')
      .split(' ')
      .map((value) => `%${value}%`);
    const userSelectOptions = await userRepository.find({
      select: ['id', 'name', 'lastName', 'color'],
      where: [
        ...searchWords.map((word) => ({
          id: Not(res.locals.user.id),
          name: ILike(word)
        })),
        ...searchWords.map((word) => ({
          id: Not(res.locals.user.id),
          lastName: ILike(word)
        }))
      ],
      order: { createDate: 'DESC' }
    });
    return res.status(StatusCodes.OK).json({
      options: userSelectOptions.map((option) => ({
        id: option.id,
        name: option.name,
        lastName: option.lastName,
        color: option.color
      }))
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
});
