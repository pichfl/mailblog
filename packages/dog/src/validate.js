import { createHmac } from 'node:crypto';
import { open } from 'node:fs/promises';

async function readRawHeaders(filePath) {
	const fh = await open(filePath);
	const buf = Buffer.allocUnsafe(4096);
	const { bytesRead } = await fh.read(buf, 0, 4096, 0);
	await fh.close();
	const text = buf.slice(0, bytesRead).toString('utf8');
	const end = text.search(/\r?\n\r?\n/);
	return end >= 0 ? text.slice(0, end) : text;
}

function extractAddress(headerValue) {
	const match = headerValue.match(/<([^>]+)>/);
	return (match ? match[1] : headerValue).toLowerCase().trim();
}

function getHeader(raw, name) {
	const unfolded = raw.replace(/\r?\n[ \t]+/g, ' ');
	return unfolded.match(new RegExp(`^${name}:\\s*(.+)`, 'im'))?.[1]?.trim() ?? '';
}

export async function verifyEmail(filePath, salt) {
	const raw = await readRawHeaders(filePath);
	const from = extractAddress(getHeader(raw, 'from'));
	const to = extractAddress(getHeader(raw, 'to'));

	const [local] = to.split('@');
	const plusIndex = local.indexOf('+');
	if (plusIndex < 0) {
		return false;
	}

	const tag = local.slice(plusIndex + 1);
	if (!tag) {
		return false;
	}

	const expected = createHmac('sha256', salt).update(from).digest('hex').slice(0, tag.length);
	return expected === tag;
}
