import { In, getRepository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { MeetingRouteParams } from './meetingController';
import { AuthenticatedHandler } from '../auth/authController';
import Meeting from '../../entity/Meeting';
import Expense, { IExpense } from '../../entity/Expense';
import User from '../../entity/User';
import { asyncHandler } from '../../utils/route-handlers';

interface MeetingExpenseRouteParams extends MeetingRouteParams {
  expenseId: string;
}

export const getMeetingExpenses: AuthenticatedHandler<
  MeetingRouteParams,
  IExpense[]
> = async (req, res) => {
  const expenseRepository = getRepository(Expense);
  const meetingId = parseInt(req.params.id);

  const expenses = await expenseRepository.find({
    where: { meeting: { id: meetingId } },
    relations: ['users', 'createdBy']
  });

  return res
    .status(StatusCodes.OK)
    .json(expenses.map((expense) => expense.toJSON()));
};

interface ExpenseRequest extends Omit<IExpense, 'users' | 'createdBy'> {
  userIds: number[];
}

export const createMeetingExpense = asyncHandler<
  AuthenticatedHandler<MeetingRouteParams, IExpense, ExpenseRequest>
>(async (req, res) => {
  const expenseRepository = getRepository(Expense);
  const userRepository = getRepository(User);
  const userId = res.locals.user.id;
  const meetingId = parseInt(req.params.id);

  const creatorUser = await userRepository.findOne(userId);

  const users = await userRepository.find({
    where: {
      id: In(req.body.userIds)
    }
  });

  const expense = expenseRepository.create({
    ...req.body,
    meetingId,
    users: users,
    createdBy: creatorUser
  });

  await expenseRepository.save(expense);
  return res.status(StatusCodes.CREATED).json(expense.toJSON());
});

type EditExpenseRequest = Partial<ExpenseRequest>;

export const editMeetingExpense = asyncHandler<
  AuthenticatedHandler<MeetingExpenseRouteParams, IExpense, EditExpenseRequest>
>(async (req, res) => {
  const expenseRepository = getRepository(Expense);
  const userRepository = getRepository(User);
  const userId = res.locals.user.id;

  const expenseId = parseInt(req.params.expenseId);

  const user = await userRepository.findOne(userId);

  const userIds = req.body.userIds;
  let users: User[];

  if (userIds) {
    users = await userRepository.find({
      where: {
        id: In(userIds)
      }
    });
  }

  const expense = await expenseRepository.findOneOrFail(expenseId, {
    relations: ['users', 'createdBy']
  });

  if (expense.createdBy.id !== user.id) {
    return res.status(StatusCodes.FORBIDDEN).send();
  }

  const { name, description, amount } = req.body;

  const updatedExpense = expenseRepository.merge(expense, {
    ...(name !== undefined ? { name } : {}),
    ...(description !== undefined ? { description } : {}),
    ...(amount !== undefined ? { amount } : {})
  });

  if (users) {
    updatedExpense.users = users;
  }

  await expenseRepository.save(updatedExpense);
  return res.status(StatusCodes.OK).json(updatedExpense.toJSON());
});

export const deleteMeetingExpense = asyncHandler<
  AuthenticatedHandler<MeetingExpenseRouteParams>
>(async (req, res) => {
  const expenseRepository = getRepository(Expense);
  const userRepository = getRepository(User);
  const meetingRepository = getRepository(Meeting);
  const userId = res.locals.user.id;

  const meetingId = parseInt(req.params.id);
  const expenseId = parseInt(req.params.expenseId);
  const creatorUser = await userRepository.findOneOrFail(userId);
  const meeting = await meetingRepository.findOneOrFail(meetingId, {
    relations: ['creator']
  });

  const expense = await expenseRepository.findOneOrFail(expenseId, {
    relations: ['createdBy']
  });

  if (
    creatorUser.id === expense.createdBy.id ||
    creatorUser.id === meeting.creator.id
  ) {
    await expenseRepository.softRemove(expense);
    return res.status(StatusCodes.NO_CONTENT).send();
  }
  return res.status(StatusCodes.FORBIDDEN).send();
});
