import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const config = {
	outDirectory: process.env.OUT_DIRECTORY ?? './out',
	mdFilename: process.env.MD_FILENAME ?? 'message.md',
	hashSalt: process.env.HASH_SALT ?? 'posteingang',
};
