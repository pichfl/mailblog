import { randomUUID } from 'node:crypto';

import { Splitter } from '@zone-eu/mailsplit';
import he from 'he';

import dayjs from '../utils/dayjs.js';
import { parseHeaders } from './header.js';
import { parseText } from './text.js';

export default async function parseMail(readableStream) {
	return new Promise((resolve, reject) => {
		const splitter = new Splitter();
		let chunks = [];
		const attachments = {};
		const meta = {};
		let previousHeaders = {};

		splitter.on('data', (data) => {
			switch (data.type) {
				case 'node': {
					const headers = parseHeaders(data);

					if (headers.from && headers.messageId) {
						// Metadata
						meta.id = (headers.messageId?.value ?? randomUUID())
							.trim()
							.replace(/^<|>$/g, '')
							.trim();
						meta.date = dayjs(headers['date']?.value).utc().toISOString();
						meta.title = he.encode(headers['subject']?.value ?? '', {
							useNamedReferences: true,
						});
						// frontmatter.headers = headers;

						return;
					}

					previousHeaders = headers;

					break;
				}
				case 'body': {
					if (data.node.contentType.startsWith('text')) {
						const chunk = parseText(data, previousHeaders);

						if (chunk.text) {
							chunks.push(chunk);
						}

						return;
					}

					// Concatinate Attachments
					const { node, value } = data;
					const contentId = previousHeaders.contentId?.value?.replace(/^<|>$/g, '');

					const id = contentId ?? data.contentLocation ?? node.filename;

					if (!attachments[id]) {
						chunks.push({
							type: node.contentType,
							id,
							filename: node.filename,
							contentId,
						});

						attachments[id] = {
							headers: previousHeaders,
							node,
							value,
						};
					} else {
						attachments[id].value = Buffer.concat([attachments[id].value, value]);
					}

					break;
				}
			}
		});

		splitter.on('end', async () => {
			// Drop PLain Text if HTML is present
			if (chunks.find((chunk) => chunk.type === 'text/html' || chunk.type === 'text/markdown')) {
				chunks = chunks.filter((chunk) => chunk.type !== 'text/plain');
			}

			const emailFrontmatter = {};
			for (const chunk of chunks) {
				if (chunk.frontmatter && Object.keys(chunk.frontmatter).length > 0) {
					Object.assign(emailFrontmatter, chunk.frontmatter);
				}
			}

			const mergedMeta = { ...meta, ...emailFrontmatter };

			resolve({ chunks, attachments, meta: mergedMeta });
		});

		splitter.on('error', (error) => reject(error));

		readableStream.pipe(splitter);
	});
}
