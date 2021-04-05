import { RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { EntityNotFoundError, getRepository } from 'typeorm';
import User from '../../entity/User';
import { AuthenticatedRequest } from '../auth/authController';

interface IUserResponse {
  email: string;
  createDate: Date;
}

export const getSelf: RequestHandler = async (
  req: AuthenticatedRequest,
  res: Response<IUserResponse>
) => {
  try {
    const userRepository = getRepository(User);
    const user = await userRepository.findOneOrFail(req.user.id);
    return res
      .status(StatusCodes.OK)
      .json({ email: user.email, createDate: user.createDate });
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};
