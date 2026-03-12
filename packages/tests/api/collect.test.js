import { join } from 'node:path';

import { collectPosts } from '@posteingang/api/src/collect.js';
import test from 'ava';

const fixtures = join(import.meta.dirname, '../fixtures/posts');

test('collects and parses all posts', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts.length, 12);
});

test('sorts posts by date descending', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts[0].title, 'Finnland');
	t.is(posts[1].title, 'Table');
});

test('includes slug derived from folder name', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts[0].slug, '614dcf742bdfacf3');
	t.is(posts[1].slug, '2814609dfbfed3bc');
});

test('parses frontmatter fields', async (t) => {
	const posts = await collectPosts(fixtures);
	const withAssets = posts.find(({ id }) => id === 'BBBB-0002@example.com');

	t.deepEqual(withAssets.tags, ['travel', 'photos']);
	t.deepEqual(withAssets.images, [
		{ filename: './photo.jpg', width: 1280, height: 960, orientation: 'landscape' },
	]);
	t.is(typeof withAssets.content, 'string');
	t.true(withAssets.content.length > 0);
});
