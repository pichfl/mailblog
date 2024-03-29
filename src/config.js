import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
	inDirectory: process.env.IN_DIRECTORY ?? './in',
	outDirectory: process.env.OUT_DIRECTORY ?? './out',
	removeFiles: process.env.REMOVE_FILES === 'true' ?? false,
	deployHook: process.env.DEPLOY_HOOK ?? '',
	hostname: process.env.HOSTNAME ?? '/',
};
