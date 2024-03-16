import iconv from 'iconv-lite';
import quotedPrintable from 'quoted-printable';
import toMarkdown from '../to-markdown.js';
import trimNewlines from '../utils/trim-newlines.js';

export function parseText(data, headers) {
	const {
		node: { contentType, charset },
		value,
	} = data;

	const mimeString = value.toString();
	const decodedString = quotedPrintable.decode(mimeString);
	const buffer = Buffer.from(decodedString, 'binary');
	let text = iconv.decode(buffer, charset);
	let type = contentType;

	// Replace non-breaking spaces with regular spaces
	text = text.replaceAll('\u00a0', ' ').replaceAll('&nbsp;', ' ');
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
