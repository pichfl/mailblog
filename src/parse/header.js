import iconv from 'iconv-lite';
import Libmime from 'libmime';
import { camelCase } from 'lodash-es';
import { Headers } from 'mailsplit';

const libmime = new Libmime.Libmime({ iconv });

const allowList = new Set([
	'from',
	'to',
	'references',
	'subject',
	'message-id',
	'date',
	'content-type',
	'content-id',
	'content-transfer-encoding',
	'content-disposition',
	'content-description',
	'content-location',
]);

export function parseHeaders(data) {
	try {
		const headers = new Headers(data.getHeaders())

		return headers.getList().reduce((acc, { key, line }) => {
			const { value, params } = libmime.parseHeaderValue(
				libmime.decodeHeader(line).value
			);

			if (allowList.has(key)) {
				acc[camelCase(key)] = { value: libmime.decodeWords(value), ...params };
			}
			return acc;
		}, new Object(null));
	} catch (error) {
		console.error('Error parsing headers', error);
	}

	return {};
}
