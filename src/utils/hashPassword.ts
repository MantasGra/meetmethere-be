import { createHash } from 'crypto';

const hashPassword = (password: string): string =>
  createHash('sha256').update(password).digest('hex');

export default hashPassword;
