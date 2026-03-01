import dayjs from 'dayjs';

export default function buildOutPath(meta) {
	const date = dayjs(meta.date);
	return date.format('YYYY-MM-DD-HHmmss');
}
