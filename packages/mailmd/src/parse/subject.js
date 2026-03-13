import dayjs from '../utils/dayjs.js';

const BRACKET_RE = /\[([^\]]+)\]/g;

const pad = (n) => String(n).padStart(2, '0');

export function resolvePartialDate(str, now) {
	const match = str.match(
		/^(\d{4})(?:-(\d{1,2})(?:-(\d{1,2})(?:[T ](\d{1,2})(?::(\d{1,2})(?::(\d{1,2}))?)?)?)?)?/
	);

	if (!match) {
		return null;
	}

	const [, y, mo, d, h, mi, s] = match;

	const precision =
		[
			{ value: s, unit: 'second' },
			{ value: mi, unit: 'minute' },
			{ value: h, unit: 'hour' },
			{ value: d, unit: 'day' },
			{ value: mo, unit: 'month' },
		].find(({ value }) => value !== undefined)?.unit ?? 'year';

	const base = dayjs
		.utc(`${y}-${pad(mo ?? 1)}-${pad(d ?? 1)}T${pad(h ?? 0)}:${pad(mi ?? 0)}:${pad(s ?? 0)}`)
		.endOf(precision);

	return base.isAfter(now) ? now : base;
}

const DELETE_RE = /^DELETE\s+(\S+)/i;

export function parseSubject(subject, now = dayjs.utc()) {
	const deleteMatch = subject.match(DELETE_RE);

	if (deleteMatch) {
		return {
			title: '',
			tags: [],
			date: null,
			action: { type: 'delete', targetId: deleteMatch[1] },
		};
	}

	const tags = [];
	let date = null;

	const title = subject
		.replace(BRACKET_RE, (_, content) => {
			const trimmed = content.trim();

			if (/^\d{3,}/.test(trimmed)) {
				date = resolvePartialDate(trimmed, now);
				return '';
			}

			tags.push(
				...trimmed
					.split(',')
					.map((t) => t.trim())
					.filter(Boolean)
			);
			return '';
		})
		.trim();

	return { title, tags: [...new Set(tags)].sort(), date, action: null };
}
