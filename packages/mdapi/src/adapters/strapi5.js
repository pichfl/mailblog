import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

function toEntry(post, index) {
	const { id: documentId, date, slug, title, tags, assets, content } = post;
	return {
		id: index + 1,
		documentId,
		slug,
		title,
		publishedAt: date,
		createdAt: date,
		updatedAt: date,
		...(tags ? { tags } : {}),
		...(assets ? { assets } : {}),
		content,
	};
}

export async function generate(posts, outputDir) {
	const entries = posts.map(toEntry);
	await mkdir(join(outputDir, 'posts'), { recursive: true });

	const list = {
		data: entries,
		meta: {
			pagination: { page: 1, pageSize: entries.length, pageCount: 1, total: entries.length },
		},
	};
	await writeFile(join(outputDir, 'posts.json'), JSON.stringify(list, null, 2));

	for (const entry of entries) {
		await writeFile(
			join(outputDir, 'posts', `${entry.slug}.json`),
			JSON.stringify({ data: entry }, null, 2)
		);
	}
}
