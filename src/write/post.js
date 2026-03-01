import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { stringify as yaml } from 'yaml';

import trimNewlines from '../utils/trim-newlines.js';

function detectCaption(nextChunk) {
	if (!nextChunk?.type.startsWith('text') || !nextChunk?.text.match(/^\^\s.*/)) {
		return null;
	}

	const lines = nextChunk.text.split('\n');
	const caption = lines.shift().replace(/^\^\s/, '');
	nextChunk.text = trimNewlines(lines.join('\n')).replace(/\n{3,}/g, '\n\n');

	return caption;
}

function processImageWithContentId(post, chunk, img) {
	const placeholder = `[[${chunk.contentId}]]`;
	const placeholderRegex = new RegExp(
		`\\[\\[${chunk.contentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]\\]\\n\\n\\^\\s(.+)`,
		'g'
	);
	const match = post.match(placeholderRegex);

	if (match) {
		chunk.caption = match[0].replace(placeholderRegex, '$1');
		const replacement = `${img}\n^ ${chunk.caption}`;
		return post.replace(placeholderRegex, replacement);
	}

	if (chunk.caption) {
		const replacement = `${img}\n^ ${chunk.caption}`;
		return post.replace(placeholder, replacement);
	}

	return post.replace(placeholder, img);
}

export default async function writePost(outDir, outPath, meta, chunks, files) {
	const filepath = join(outDir, outPath, 'post.md');
	let post = '';

	const assets = Object.keys(files).map((id) => {
		const file = files[id];
		return {
			filename: file.filename,
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
		const { type, id, ...chunk } = chunks[i];
		const nextChunk = chunks[i + 1];

		if (type.startsWith('text')) {
			post += chunk.text;
			continue;
		}

		// Handle images followed by a potential caption
		if (type.startsWith('image')) {
			const caption = detectCaption(nextChunk);
			if (caption) {
				chunk.caption = caption;
			}

			const { width, height, orientation, filename: normalizedFilename } = files[id];
			const img = `<img src="${normalizedFilename}" alt="" width="${width}" height="${height}" data-orientation="${orientation}">`;

			if (chunk.contentId) {
				post = processImageWithContentId(post, chunk, img);
			} else {
				if (chunk.caption) {
					const result = `${img}\n^ ${chunk.caption}`;
					if (post && !post.endsWith('\n\n')) {
						post += '\n\n';
					}
					post += result;
					post += '\n\n';
				} else {
					if (post && !post.endsWith('\n\n')) {
						post += '\n\n';
					}
					post += img;
					post += '\n\n';
				}
			}
		}
	}

	post = post.trim();
	post += '\n';

	await writeFile(filepath, post, { encoding: 'utf8' });
	await chmod(filepath, 0o644);

	return filepath;
}
