import { UniqueViolationError, wrapError } from 'db-errors';
import { RequestHandler, Response } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import StatusCodes from 'http-status-codes';
import jwt, { TokenExpiredError, VerifyErrors } from 'jsonwebtoken';
import { EntityNotFoundError, getRepository } from 'typeorm';

import User from '../../entity/User';
import Token, { TokenContents } from '../../entity/Token';
import { verifyPassword } from '../../utils/hashPassword';
import { asyncHandler } from '../../utils/route-handlers';

export interface IRegisterRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export const register = asyncHandler<
  RequestHandler<Record<string, never>, string, IRegisterRequest>
>(async (req, res) => {
  try {
    const userRepository = getRepository(User);
    const newUser = req.body;
    const user = userRepository.create({
      name: newUser.name,
      lastName: newUser.lastName,
      email: newUser.email,
      password: newUser.password
    });
    await userRepository.save(user);
    return res.status(StatusCodes.CREATED).send();
  } catch (error) {
    const coughtError = wrapError(error);
    if (coughtError instanceof UniqueViolationError) {
      return res.status(StatusCodes.BAD_REQUEST).send('User already exists');
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
});

export interface ILoginRequest {
  email: string;
  password: string;
}

const addToken = (res: Response, tokenKey: string, token: string): Response =>
  res.cookie(tokenKey, token, {
    httpOnly: true,
    ...(process.env.ENVIRONMENT === 'PROD' && {
      sameSite: 'none',
      secure: true
    })
  });

export const login = asyncHandler<
  RequestHandler<Record<string, never>, string, ILoginRequest>
>(async (req, res) => {
  try {
    const userRepository = getRepository(User);
    const tokenRepository = getRepository(Token);

    const loginCredentials = req.body;
    const user = await userRepository.findOneOrFail(
      {
        email: loginCredentials.email
      },
      { select: ['id', 'password'] }
    );

    const passwordMatches = await verifyPassword(
      loginCredentials.password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials.');
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET
    );

    const newToken = tokenRepository.create({ tokenValue: refreshToken });
    await tokenRepository.save(newToken);

    return addToken(
      addToken(res.status(StatusCodes.OK), 'accessToken', accessToken),
      'refreshToken',
      refreshToken
    ).send();
  } catch (error) {
    if (error instanceof EntityNotFoundError) {
      return res.status(StatusCodes.UNAUTHORIZED).send('Invalid credentials.');
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  }
});

export const refreshToken = asyncHandler<RequestHandler>(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).send();
  }

  try {
    const tokenRepository = getRepository(Token);
    await tokenRepository.findOneOrFail({ tokenValue: refreshToken });
  } catch (error) {
    return res.status(StatusCodes.FORBIDDEN).send('Invalid token.');
  }

  jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET,
    (err: VerifyErrors, user: TokenContents) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).send('Invalid token.');
      }
      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      return addToken(
        res.status(StatusCodes.OK),
        'accessToken',
        accessToken
      ).send();
    }
  );
});

export const logout = asyncHandler<RequestHandler>(async (req, res) => {
  const { refreshToken } = req.cookies;
  const tokenRepository = getRepository(Token);
  await tokenRepository.delete({ tokenValue: refreshToken });
  return res
    .status(StatusCodes.OK)
    .clearCookie('accessToken', {
      httpOnly: true,
      ...(process.env.ENVIRONMENT === 'PROD' && {
        sameSite: 'none',
        secure: true
      })
    })
    .clearCookie('refreshToken', {
      httpOnly: true,
      ...(process.env.ENVIRONMENT === 'PROD' && {
        sameSite: 'none',
        secure: true
      })
    })
    .send();
});

/* eslint-disable @typescript-eslint/no-explicit-any */
export type AuthenticatedHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = Query,
  Locals extends Record<string, any> = Record<string, any>
> = RequestHandler<
  P,
  ResBody,
  ReqBody,
  ReqQuery,
  Locals & { user: TokenContents }
>;
/* eslint-enable @typescript-eslint/no-explicit-any */

export const authenticateRequest: AuthenticatedHandler = (req, res, next) => {
  const { accessToken } = req.cookies;

  if (accessToken) {
    jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
      (err: VerifyErrors, user: TokenContents) => {
        if (err instanceof TokenExpiredError) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({ message: 'Invalid token.', expired: true });
        }
        if (err) {
          return res.status(StatusCodes.FORBIDDEN).send('Invalid token.');
        }

        res.locals.user = user;
        next();
      }
    );
  } else {
    res.status(StatusCodes.UNAUTHORIZED).send();
  }
};
