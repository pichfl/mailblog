import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  inDirectory: process.env.IN_DIRECTORY ?? './in',
  outDirectory: process.env.OUT_DIRECTORY ?? './out',
};
