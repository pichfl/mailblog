import { join } from 'node:path';

import { collectPosts } from '@posteingang/api/src/collect.js';
import test from 'ava';

const fixtures = join(import.meta.dirname, '../fixtures/posts');

test('collects and parses published posts', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts.length, 2);
});

test('excludes published: false posts', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(
		posts.find((p) => p.title === 'Draft Post'),
		undefined
	);
});

test('sorts posts by date descending', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts[0].title, 'Post with Tags and Assets');
	t.is(posts[1].title, 'Simple Post');
});

test('includes slug derived from folder name', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts[0].slug, '2024-02-01-090000');
	t.is(posts[1].slug, '2024-01-01-120000');
});

test('parses frontmatter fields', async (t) => {
	const posts = await collectPosts(fixtures);
	const withAssets = posts[0];

	t.deepEqual(withAssets.tags, ['travel', 'photos']);
	t.deepEqual(withAssets.assets, [
		{ filename: 'photo.jpg', width: 1280, height: 960, orientation: 'landscape' },
	]);
	t.is(typeof withAssets.content, 'string');
	t.true(withAssets.content.length > 0);
});
