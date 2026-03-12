import { resolvePartialDate, parseSubject } from '@posteingang/mailmd/src/parse/subject.js';
import test from 'ava';
import dayjs from '@posteingang/mailmd/src/utils/dayjs.js';

const NOW = dayjs.utc('2026-03-12T10:30:00.000Z');

test('resolvePartialDate: past year - end of that year', (t) => {
	t.is(resolvePartialDate('2025', NOW).toISOString(), '2025-12-31T23:59:59.999Z');
});

test('resolvePartialDate: current year - now', (t) => {
	t.is(resolvePartialDate('2026', NOW).toISOString(), NOW.toISOString());
});

test('resolvePartialDate: past month - end of that month', (t) => {
	t.is(resolvePartialDate('2026-02', NOW).toISOString(), '2026-02-28T23:59:59.999Z');
});

test('resolvePartialDate: current month - now', (t) => {
	t.is(resolvePartialDate('2026-03', NOW).toISOString(), NOW.toISOString());
});

test('resolvePartialDate: past day - end of that day', (t) => {
	t.is(resolvePartialDate('2026-03-11', NOW).toISOString(), '2026-03-11T23:59:59.999Z');
});

test('resolvePartialDate: today - now', (t) => {
	t.is(resolvePartialDate('2026-03-12', NOW).toISOString(), NOW.toISOString());
});

test('resolvePartialDate: past minute today - end of that minute', (t) => {
	t.is(resolvePartialDate('2026-03-12T08:00', NOW).toISOString(), '2026-03-12T08:00:59.999Z');
});

test('resolvePartialDate: current minute - now', (t) => {
	t.is(resolvePartialDate('2026-03-12T10:30', NOW).toISOString(), NOW.toISOString());
});

test('resolvePartialDate: full datetime - exact time', (t) => {
	t.is(
		resolvePartialDate('2026-03-01T08:00:00', NOW).toISOString(),
		'2026-03-01T08:00:00.999Z'
	);
});

test('resolvePartialDate: non-date string - null', (t) => {
	t.is(resolvePartialDate('foo', NOW), null);
});

test('parseSubject: plain title', (t) => {
	t.deepEqual(parseSubject('Hello World', NOW), { title: 'Hello World', tags: [], date: null });
});

test('parseSubject: single tag', (t) => {
	const { title, tags, date } = parseSubject('[travel] Trip report', NOW);
	t.is(title, 'Trip report');
	t.deepEqual(tags, ['travel']);
	t.is(date, null);
});

test('parseSubject: tag only', (t) => {
	const { title, tags, date } = parseSubject('[travel]', NOW);
	t.is(title, '');
	t.deepEqual(tags, ['travel']);
	t.is(date, null);
});

test('parseSubject: multiple tags', (t) => {
	const { title, tags } = parseSubject('[travel] [photos] India', NOW);
	t.is(title, 'India');
	t.deepEqual(tags, ['photos', 'travel']);
});

test('parseSubject: tags sorted alphabetically', (t) => {
	const { tags } = parseSubject('[zebra] [apple] [mango] Title', NOW);
	t.deepEqual(tags, ['apple', 'mango', 'zebra']);
});

test('parseSubject: duplicate tags deduplicated', (t) => {
	const { tags } = parseSubject('[travel] [travel] [photos] Title', NOW);
	t.deepEqual(tags, ['photos', 'travel']);
});

test('parseSubject: comma-separated tags in one bracket', (t) => {
	const { tags } = parseSubject('[travel, photos, food] Title', NOW);
	t.deepEqual(tags, ['food', 'photos', 'travel']);
});

test('parseSubject: comma-separated tags merged with separate brackets', (t) => {
	const { tags } = parseSubject('[travel, photos] [food] Title', NOW);
	t.deepEqual(tags, ['food', 'photos', 'travel']);
});

test('parseSubject: date override', (t) => {
	const { title, tags, date } = parseSubject('[2025] Year in review', NOW);
	t.is(title, 'Year in review');
	t.deepEqual(tags, []);
	t.is(date.toISOString(), '2025-12-31T23:59:59.999Z');
});

test('parseSubject: date and tag', (t) => {
	const { title, tags, date } = parseSubject('[2026-03-01T08:00] [travel] Departure', NOW);
	t.is(title, 'Departure');
	t.deepEqual(tags, ['travel']);
	t.is(date.toISOString(), '2026-03-01T08:00:59.999Z');
});

test('parseSubject: mixing date and tags works', (t) => {
	const { title, tags, date } = parseSubject('[travel][2026-03-01T08:00] [photos] Departure', NOW);
	t.is(title, 'Departure');
	t.deepEqual(tags, ['photos','travel']);
	t.is(date.toISOString(), '2026-03-01T08:00:59.999Z');
});

test('parseSubject: date only', (t) => {
	const { title, tags, date } = parseSubject('[2026-03-01T08:00]', NOW);
	t.is(title, '');
	t.deepEqual(tags, []);
	t.is(date.toISOString(), '2026-03-01T08:00:59.999Z');
});

test('parseSubject: date and tag without spacing', (t) => {
	const { title, tags, date } = parseSubject('[2026-03-01T08:00][travel]Departure', NOW);
	t.is(title, 'Departure');
	t.deepEqual(tags, ['travel']);
	t.is(date.toISOString(), '2026-03-01T08:00:59.999Z');
});

test('parseSubject: empty subject', (t) => {
	t.deepEqual(parseSubject('', NOW), { title: '', tags: [], date: null });
});
