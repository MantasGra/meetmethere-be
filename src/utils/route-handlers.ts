import {
  ErrorRequestHandler,
  Request,
  Response,
  RequestHandler,
  NextFunction
} from 'express';
import { StatusCodes } from 'http-status-codes';
import { EntityNotFoundError } from 'typeorm';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send('4 OH 4 :(');
};

export const notAllowedHandler: RequestHandler = (req, res) => {
  res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send('This method is not allowed!');
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (process.env.ENVIRONMENT === 'DEV') {
    console.error(err);
  }
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(StatusCodes.FORBIDDEN).send();
  }
  if (err instanceof EntityNotFoundError) {
    return res.status(StatusCodes.NOT_FOUND).send();
  }
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
};

// Should no longer be necessary with express version 5.x.x
export const asyncHandler =
  <T extends RequestHandler>(handler: T) =>
  (req: Request, res: Response, next: NextFunction): Promise<void> =>
    Promise.resolve(handler(req, res, next)).catch(next);
