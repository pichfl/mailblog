import iconv from 'iconv-lite';
import quotedPrintable from 'quoted-printable';
import toMarkdown from '../to-markdown.js';
import trimNewlines from '../utils/trim-newlines.js';

export function parseMimeString(string, charset) {
	const decodedString = quotedPrintable.decode(string);
	const buffer = Buffer.from(decodedString, 'binary');

	return iconv.decode(buffer, charset);
}

export function parseText(data, headers) {
	const {
		node: { contentType, charset },
		value,
	} = data;
	let text = parseMimeString(value.toString(), charset);
	let type = contentType;

	// Replace non-breaking spaces with regular spaces
	text = text
		.replaceAll('\u00a0', ' ')
		.replaceAll('&nbsp;', ' ')
		.replaceAll('77u/DQoNCg=', '\n');
	text = trimNewlines(text);

	if (type === 'text/html') {
		text = toMarkdown(text);
		type = 'text/markdown';
	}

	return {
		type,
		text,
	};
}
