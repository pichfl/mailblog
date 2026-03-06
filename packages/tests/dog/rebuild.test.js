import { cp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { rebuild } from '@posteingang/dog/src/index.js';
import test from 'ava';

const FIXTURES = new URL('../fixtures/posts', import.meta.url).pathname;
const distDir = join(tmpdir(), 'dog-test-rebuild');

test.before(async () => {
	await cp(FIXTURES, distDir, { recursive: true });
	await rebuild(distDir);
});

test('generates posts.json', async (t) => {
	const raw = await readFile(join(distDir, 'posts.json'), 'utf8');
	const json = JSON.parse(raw);

	t.true(json.data.length > 0);
	t.truthy(json.meta.pagination);
});

test('generates individual post files', async (t) => {
	const raw = await readFile(join(distDir, 'posts.json'), 'utf8');
	const { data } = JSON.parse(raw);

	for (const post of data) {
		const postRaw = await readFile(join(distDir, 'posts', `${post.slug}.json`), 'utf8');
		const postJson = JSON.parse(postRaw);
		t.is(postJson.data.slug, post.slug);
	}
});

test('returns posts array', async (t) => {
	const dir = join(tmpdir(), 'dog-test-rebuild-return');
	await cp(FIXTURES, dir, { recursive: true });
	const posts = await rebuild(dir);
	t.true(Array.isArray(posts));
	t.true(posts.length > 0);
	await rm(dir, { recursive: true, force: true });
});

test('POSTs to deploy hook after rebuild', async (t) => {
	const received = [];
	const server = createServer((req, res) => {
		received.push(req.method);
		res.end();
	});

	await new Promise((resolve) => server.listen(0, resolve));
	const { port } = server.address();

	const dir = join(tmpdir(), `dog-test-hook-${port}`);
	await cp(FIXTURES, dir, { recursive: true });
	await rebuild(dir, `http://localhost:${port}/deploy`);

	t.deepEqual(received, ['POST']);

	await new Promise((resolve) => server.close(resolve));
	await rm(dir, { recursive: true, force: true });
});

test.after(async () => {
	await rm(distDir, { recursive: true, force: true });
});
