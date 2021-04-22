import { RequestHandler, Response } from 'express';
import type { Query } from 'express-serve-static-core';
import { StatusCodes } from 'http-status-codes';
import { EntityNotFoundError, getRepository, ILike, Not } from 'typeorm';
import { AuthenticatedRequest } from '../auth/authController';
import User, { UserColors } from '../../entity/User';

interface IUserResponse {
  name: string;
  lastName: string;
  email: string;
  createDate: Date;
  color: UserColors;
}

export const getSelf: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response<IUserResponse>
) => {
  try {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail(req.user.id);
    return res.status(StatusCodes.OK).json({
      email: user.email,
      createDate: user.createDate,
      name: user.name,
      lastName: user.lastName,
      color: user.color
    });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface IUserSelectOptionsRequestQuery extends Query {
  searchText: string;
}

interface IUserSelectOptionsResponse {
  options: Array<{
    id: number;
    name: string;
    lastName: string;
    color: UserColors;
  }>;
}

export const getUserSelectOptions: RequestHandler = async (
  req: AuthenticatedRequest<
    Record<string, never>,
    IUserSelectOptionsResponse,
    Record<string, never>,
    IUserSelectOptionsRequestQuery
  >,
  res: Response<IUserSelectOptionsResponse>
) => {
  try {
    const userRepository = getRepository(User);
    const searchWords = req.query.searchText
      .split(' ')
      .map((value) => `%${value}%`);
    const userSelectOptions = await userRepository.find({
      select: ['id', 'name', 'lastName', 'color'],
      where: [
        ...searchWords.map((word) => ({
          id: Not(req.user.id),
          name: ILike(word)
        })),
        ...searchWords.map((word) => ({
          id: Not(req.user.id),
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
};
