import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import test from 'ava';
import { rimraf } from 'rimraf';

import { generate as generateApi } from '../src/adapters/strapi5.js';

const outDir = join(tmpdir(), 'mdapi-test');

const posts = [
	{
		id: 'BBBB-0002@example.com',
		date: new Date('2024-02-01T09:00:00.000Z'),
		slug: '2024-02-01-090000',
		title: 'Post with Tags and Assets',
		tags: ['travel', 'photos'],
		assets: [{ filename: 'photo.jpg', width: 1280, height: 960, orientation: 'landscape' }],
		content: 'Post with tags and an image.',
	},
	{
		id: 'AAAA-0001@example.com',
		date: new Date('2024-01-01T12:00:00.000Z'),
		slug: '2024-01-01-120000',
		title: 'Simple Post',
		content: 'Just some text.',
	},
];

test.before(async () => {
	await generateApi(posts, outDir);
});

test('writes posts.json with correct envelope', async (t) => {
	const raw = await readFile(join(outDir, 'posts.json'), 'utf8');
	const json = JSON.parse(raw);

	t.is(json.data.length, 2);
	t.deepEqual(json.meta.pagination, { page: 1, pageSize: 2, pageCount: 1, total: 2 });
});

test('assigns sequential ids starting at 1', async (t) => {
	const raw = await readFile(join(outDir, 'posts.json'), 'utf8');
	const { data } = JSON.parse(raw);

	t.is(data[0].id, 1);
	t.is(data[1].id, 2);
});

test('maps fields to Strapi v5 flat shape', async (t) => {
	const raw = await readFile(join(outDir, 'posts.json'), 'utf8');
	const { data } = JSON.parse(raw);
	const entry = data[0];

	t.is(entry.documentId, 'BBBB-0002@example.com');
	t.is(entry.slug, '2024-02-01-090000');
	t.is(entry.title, 'Post with Tags and Assets');
	t.truthy(entry.publishedAt);
	t.truthy(entry.createdAt);
	t.deepEqual(entry.tags, ['travel', 'photos']);
	t.is(entry.content, 'Post with tags and an image.');
});

test('omits tags/assets when absent', async (t) => {
	const raw = await readFile(join(outDir, 'posts.json'), 'utf8');
	const { data } = JSON.parse(raw);
	const simple = data[1];

	t.false('tags' in simple);
	t.false('assets' in simple);
});

test('writes individual post files', async (t) => {
	const raw = await readFile(join(outDir, 'posts', '2024-02-01-090000.json'), 'utf8');
	const { data } = JSON.parse(raw);

	t.is(data.slug, '2024-02-01-090000');
	t.is(data.title, 'Post with Tags and Assets');
});

test.after(async () => {
	await rimraf(outDir);
});
