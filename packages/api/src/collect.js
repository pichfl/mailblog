import { readFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

import { glob } from 'glob';
import matter from 'gray-matter';

export async function collectPosts(inputDir) {
	const files = await glob('**/message.md', { cwd: inputDir, absolute: true });
	const posts = [];

	for (const file of files) {
		const raw = await readFile(file, 'utf8');
		const { data: frontmatter, content } = matter(raw);
		posts.push({ ...frontmatter, slug: basename(dirname(file)), content: content.trim() });
	}

	return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}
