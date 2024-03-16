import { mkdirp as mkdirp_ } from 'mkdirp';
import chmodr from './chmodr.js';

export default async function mkdirp(outPath, permissions) {
	try {
		await mkdirp_(outPath);
		await chmodr(outPath, permissions);

		return outPath;
	} catch (error) {
		throw new Error(`Error creating directory ${outPath}`, error);
	}
}
