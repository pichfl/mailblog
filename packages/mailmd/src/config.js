import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const config = {
	outDirectory: process.env.POSTEINGANG_OUT ?? './out',
	mdFilename: process.env.POSTEINGANG_MD_FILENAME ?? 'message.md',
	hashSalt: process.env.POSTEINGANG_SALT ?? 'posteingang',
};
