import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const config = {
	outDirectory: process.env.OUT_DIRECTORY ?? './out',
};
