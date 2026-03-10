import { join } from 'node:path';

import { collectPosts } from '@posteingang/api/src/collect.js';
import test from 'ava';

const fixtures = join(import.meta.dirname, '../fixtures/posts');

test('collects and parses published posts', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts.length, 10);
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

	t.is(posts[0].title, 'Table');
	t.is(posts[1].title, 'Jaipur &ndash; Delhi');
});

test('includes slug derived from folder name', async (t) => {
	const posts = await collectPosts(fixtures);

	t.is(posts[0].slug, '2814609dfbfed3bc');
	t.is(posts[1].slug, '91d56f7766c203eb');
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
