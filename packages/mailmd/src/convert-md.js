import { readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

import matter from 'gray-matter';

import { config } from './config.js';

function parseMarkdownToPlainText(content) {
	return (
		content
			// Replace image tags with content ID placeholders for embedding
			.replace(/<img[^>]+src="([^"]+)"[^>]*>/g, (match, src) => {
				const cid = src.replace(/^\.\//, '').replace(/\.[^.]+$/, '');
				return `[cid:${cid}]`;
			})
			// Clean up extra whitespace
			.replace(/\n{3,}/g, '\n\n')
			.trim()
	);
}

function extractAttachments(content, folderPath) {
	const attachments = [];
	const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
	let match;

	while ((match = imgRegex.exec(content)) !== null) {
		const filename = match[1].replace(/^\.\//, '');
		const filepath = join(folderPath, filename);

		attachments.push({
			filename,
			path: filepath,
			cid: filename.replace(/\.[^.]+$/, ''),
		});
	}

	return attachments;
}

// Export internal functions for testing
export { parseMarkdownToPlainText, extractAttachments };

export default async function convertMdToMail(folderPath, options = {}) {
	const messagePath = join(folderPath, config.mdFilename);
	const messageContent = await readFile(messagePath, 'utf8');
	const { data, content } = matter(messageContent);
	const plainTextContent = parseMarkdownToPlainText(content);
	const attachments = extractAttachments(content, folderPath);
	const folderName = basename(folderPath);

	const mailConfig = {
		from: options.from || undefined,
		to: options.to || undefined,
		subject: options.subject || folderName || undefined,
		text: `${matter.stringify('', data).trim()}\n\n${plainTextContent}`,
		attachments,
	};

	return mailConfig;
}
