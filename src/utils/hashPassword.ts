import { compare, hash } from 'bcrypt';

const ROUNDS_OF_SALT = 10;

export const hashPassword = async (password: string): Promise<string> =>
  await hash(password, ROUNDS_OF_SALT);

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => await compare(password, hash);
