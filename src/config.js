import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
	outDirectory: process.env.OUT_DIRECTORY ?? './out',
};
