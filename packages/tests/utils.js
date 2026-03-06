import { open } from 'node:fs/promises';
import path from 'node:path';

const FIXTURES = path.join(import.meta.dirname, 'fixtures');

export async function readMail(filepath) {
	const fd = await open(path.resolve(FIXTURES, filepath));
	return fd.createReadStream();
}
