import buildOutPath from './build-out-path.js';
import parseMail from './parse/mail.js';
import writeAttachments from './write/attachements.js';
import writePost from './write/post.js';
import { join } from 'node:path';

export default async function convertMail(readableStream, outDir) {
	const { meta, chunks, attachments } = await parseMail(readableStream);
	const outPath = buildOutPath(meta);
	const files = await writeAttachments(outDir, outPath, attachments);

	await writePost(outDir, outPath, meta, chunks, files);

	return join(outDir, outPath, 'post.md');
}
