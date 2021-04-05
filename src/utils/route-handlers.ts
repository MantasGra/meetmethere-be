import { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).send('4 OH 4 :(');
};

export const notAllowedHandler: RequestHandler = (req, res) => {
  res
    .status(StatusCodes.METHOD_NOT_ALLOWED)
    .send('This method is not allowed!');
};

export const errorHandler: ErrorRequestHandler = (err, req, res) => {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
};
