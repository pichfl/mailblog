import { join } from 'node:path';

import { config } from './config.js';
import parseMail from './parse/mail.js';
import writeAttachments from './write/attachements.js';
import writePost from './write/post.js';

export default async function convertMail(readableStream, outDir) {
	const { meta, chunks, attachments } = await parseMail(readableStream);
	const { sentAt, ...postMeta } = meta;
	const outPath = postMeta.id;

	const finalMeta = { ...postMeta, updatedAt: sentAt };

	const files = await writeAttachments(outDir, outPath, attachments);
	await writePost(outDir, outPath, finalMeta, chunks, files);

	return join(outDir, outPath, config.mdFilename);
}
