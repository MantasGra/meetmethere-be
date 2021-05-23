import { RequestHandler, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { EntityNotFoundError, getRepository, In } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../auth/authController';
import Meeting from '../../entity/Meeting';
import Expense from '../../entity/Expense';
import User from '../../entity/User';


interface MeetingExpenseRouteParams extends ParamsDictionary {
  id: string;
};

interface EditMeetingExpenseRouteParams extends ParamsDictionary {
  expenseId: string;
  meetingId: string;
};

export const getMeetingExpenses: RequestHandler = async (
  req: AuthenticatedRequest<
    MeetingExpenseRouteParams,
    Expense[],
    Record<string, never>
  >,
  res: Response<Expense[]>
) => {
  try {
    const meetingRepository = getRepository(Meeting);
    const expenseRepository = getRepository(Expense);
    const userId = req.user.id;
    const meetingId = parseInt(req.params.id);

    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .getOneOrFail();

    const expenses = await expenseRepository
      .createQueryBuilder('expense')
      .where('expense.meetingId = :meetingId', { meetingId })
      .leftJoinAndSelect('expense.users', 'user')
      .getMany();

    return res.status(StatusCodes.OK).json(expenses);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
};

interface ICreateMeetingExpenseRequest {
  name: string;
  description: string;
  amount: number;
  userIds: number[];
}

interface IEditMeetingExpenseRequest {
  id: number;
  name: string;
  description: string;
  amount: number;
  userIds: number[];
}

export const createMeetingExpense: RequestHandler = async (
  req: AuthenticatedRequest<
    MeetingExpenseRouteParams,
    Expense,
    ICreateMeetingExpenseRequest,
    Record<string, never>
  >,
  res: Response<Expense>
) => {
  const meetingRepository = getRepository(Meeting);
  const expenseRepository = getRepository(Expense);
  const userRepository = getRepository(User);
  const userId = req.user.id;
  const creatorUser = await userRepository.findOne(userId);
  const meetingId = parseInt(req.params.id);

  try {
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .getOneOrFail();

      const users = await userRepository.find({
        where: {
          id: In(req.body.userIds)
        }
      });

      const expense = expenseRepository.create({
        ...req.body,
        meeting: meeting,
        users: users,
        createdBy: creatorUser
      })

      await expenseRepository.save(expense);
      return res.status(StatusCodes.CREATED).json(expense);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}

export const editMeetingExpense: RequestHandler = async (
  req: AuthenticatedRequest<
    EditMeetingExpenseRouteParams,
    Expense,
    IEditMeetingExpenseRequest,
    Record<string, never>
  >,
  res: Response<Expense>
) => {
  const meetingRepository = getRepository(Meeting);
  const expenseRepository = getRepository(Expense);
  const userRepository = getRepository(User);
  const userId = req.user.id;
  const creatorUser = await userRepository.findOne(userId);
  const meetingId = parseInt(req.params.meetingId);
  const expenseId = parseInt(req.params.expenseId);

  try {
    await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .getOneOrFail();

      const users = await userRepository.find({
        where: {
          id: In(req.body.userIds)
        }
      });
      
      const expense = await expenseRepository.findOne(expenseId);

      const result = await expenseRepository.save({
        ...expense,
        name: req.body.name,
        description: req.body.description,
        amount: req.body.amount,
        users: users,
        createdBy: creatorUser
      });
      return res.status(StatusCodes.CREATED).json(result);
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}

export const deleteMeetingExpense: RequestHandler = async (
  req: AuthenticatedRequest<
    EditMeetingExpenseRouteParams,
    Expense,
    IEditMeetingExpenseRequest,
    Record<string, never>
  >,
  res: Response<Expense>
) => {
  const expenseRepository = getRepository(Expense);
  const userRepository = getRepository(User);
  const meetingRepository = getRepository(Meeting);
  const userId = req.user.id;
  const creatorUser = await userRepository.findOne(userId);

  const meetingId = parseInt(req.params.meetingId);
  const expenseId = parseInt(req.params.expenseId);

  try {
    const meeting = await meetingRepository
      .createQueryBuilder('meeting')
      .where('meeting.id = :meetingId', { meetingId })
      .innerJoin('meeting.participants', 'user', 'user.id = :userId', {
        userId
      })
      .leftJoinAndSelect('meeting.creator', 'creator')
      .getOneOrFail();
      
      const expense = await expenseRepository
      .createQueryBuilder('expense')
      .where('expense.id = :expenseId', { expenseId })
      .leftJoinAndSelect('expense.createdBy', 'createdBy')
      .getOne();

      if (creatorUser.id === expense.createdBy.id && creatorUser.id === meeting.creator.id) {
        await expenseRepository.softRemove(expense);
        return res.status(StatusCodes.NO_CONTENT).send();
      }
      return res.status(StatusCodes.FORBIDDEN).send();
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.NOT_FOUND).send();
    }
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
}