import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { stringify as yaml } from 'yaml';

import trimNewlines from '../utils/trim-newlines.js';

export default async function writePost(outDir, outPath, meta, chunks, files) {
	const filepath = join(outDir, outPath, 'post.md');
	let post = '';

	const assets = Object.keys(files).map((id) => {
		const file = files[id];
		const chunk = chunks.find((c) => c.id === id);
		return {
			filename: chunk?.filename || id,
			width: file.width,
			height: file.height,
			orientation: file.orientation,
		};
	});

	const frontmatter = {
		...meta,
		...(assets.length > 0 ? { assets } : {}),
	};

	post += '---\n';
	post += yaml(frontmatter);
	post += '---\n';
	post += '\n';

	for (let i = 0; i < chunks.length; i++) {
		const { type, id, filename, ...chunk } = chunks[i];
		const nextChunk = chunks[i + 1];

		if (type.startsWith('text')) {
			post += chunk.text;
			continue;
		}

		// Handle images followed by a potential caption
		if (type.startsWith('image')) {
			let img = '';

			if (nextChunk?.type.startsWith('text') && nextChunk?.text.match(/^\^\s.*/)) {
				const lines = nextChunk.text.split('\n');

				chunk.caption = lines.shift().replace(/^\^\s/, '');
				nextChunk.text = trimNewlines(lines.join('\n'));
			}

			const { width, height, orientation, placeholder } = files[id];
			const src = filename;

			if (chunk.caption) {
				img += '<figure>';
			}

			img += `<img src="${src}" alt="" width="${width}" height="${height}" data-orientation="${orientation}" style="--ph:url(${placeholder})">`;

			if (chunk.caption) {
				img += `<figcaption>${chunk.caption}</figcaption>`;
				img += '</figure>';
			}

			if (chunk.contentId) {
				post = post.replace(`[[${chunk.contentId}]]`, img);
			} else {
				post += img;
				post += '\n\n';
			}
		}
	}

	post = post.trim();
	post += '\n';

	await writeFile(filepath, post, { encoding: 'utf8' });
	await chmod(filepath, 0o644);

	return filepath;
}
