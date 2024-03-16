import { join } from 'node:path';
import dayjs from 'dayjs';

export default function buildOutPath(meta) {
	const date = dayjs(meta.date);
	return join(
		date.format('YYYY'),
		date.format('MM'),
		date.format('DD'),
		date.format('HHmmss')
	);
}
