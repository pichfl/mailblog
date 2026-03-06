import { access } from 'node:fs/promises';
import { join } from 'node:path';

import { config } from './config.js';
import parseMail from './parse/mail.js';
import dayjs from './utils/dayjs.js';
import writeAttachments from './write/attachements.js';
import writePost from './write/post.js';

export default async function convertMail(readableStream, outDir) {
	const { meta, chunks, attachments } = await parseMail(readableStream);
	const { sentAt, ...postMeta } = meta;
	const outPath = dayjs(postMeta.date).utc().format('YYYY-MM-DD-HHmmss');

	let isUpdate = false;
	try {
		await access(join(outDir, outPath, config.mdFilename));
		isUpdate = true;
	} catch {}

	const finalMeta = { ...postMeta, ...(isUpdate ? { updatedAt: sentAt } : {}) };

	const files = await writeAttachments(outDir, outPath, attachments);
	await writePost(outDir, outPath, finalMeta, chunks, files);

	return join(outDir, outPath, config.mdFilename);
}
