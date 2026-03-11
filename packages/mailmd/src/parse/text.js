import matter from 'gray-matter';
import iconv from 'iconv-lite';
import quotedPrintable from 'quoted-printable';

import toMarkdown from '../to-markdown.js';
import trimNewlines from '../utils/trim-newlines.js';

export function parseMimeString(string, charset) {
	const decodedString = quotedPrintable.decode(string);
	const buffer = Buffer.from(decodedString, 'binary');

	return iconv.decode(buffer, charset);
}

export function parseText(data, _headers) {
	const {
		node: { contentType, charset },
		value,
	} = data;
	let text = parseMimeString(value.toString(), charset);
	let type = contentType;

	// Replace non-breaking spaces with regular spaces
	text = text.replaceAll('\u00a0', ' ').replaceAll('&nbsp;', ' ').replaceAll('77u/DQoNCg=', '\n').replaceAll('77u/', '');
	text = trimNewlines(text);

	if (type === 'text/html') {
		text = toMarkdown(text);
		type = 'text/markdown';
	}

	let meta = {};
	try {
		const parsed = matter(text);
		if (parsed.data && Object.keys(parsed.data).length > 0) {
			meta = parsed.data;
			text = trimNewlines(parsed.content);
		}
	} catch {
		// ignore errors
	}

	return {
		type,
		text,
		meta,
	};
}
