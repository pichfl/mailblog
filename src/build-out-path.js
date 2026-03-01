import dayjs from './utils/dayjs.js';

export default function buildOutPath(meta) {
	const date = dayjs(meta.date).utc();
	return date.format('YYYY-MM-DD-HHmmss');
}
