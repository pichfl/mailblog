import { open } from 'node:fs/promises';
import path from 'node:path';

export async function readMail(filepath) {
	const fd = await open(path.resolve(import.meta.dirname, filepath));
	return fd.createReadStream();
}
