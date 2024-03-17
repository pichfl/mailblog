import { chmod, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { stringify as yaml } from 'yaml';
import { config } from '../config.js';
import trimNewlines from '../utils/trim-newlines.js';

export default async function writePost(outDir, outPath, meta, chunks, files) {
	const filepath = join(outDir, outPath, 'post.md');
	let post = '';

	post += '---\n';
	post += yaml(meta);
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
			if (
				nextChunk?.type.startsWith('text') &&
				nextChunk?.text.match(/^\^\s.*/)
			) {
				const lines = nextChunk.text.split('\n');

				chunk.caption = lines.shift().replace(/^\^\s/, '');
				nextChunk.text = trimNewlines(lines.join('\n'));
			}

			const { width, height, orientation, placeholder } = files[id];
			const src = [
				config.hostname.replace(/\/+$/, ''),
				...outPath.split(sep),
				filename,
			].join('/');

			if (chunk.caption) {
				post += '<figure>';
			}

			post += `<img src="${src}" alt="" width="${width}" height="${height}" data-orientation="${orientation}" style="--ph:url(${placeholder})">`;

			if (chunk.caption) {
				post += `<figcaption>${chunk.caption}</figcaption>`;
				post += '</figure>';
			}

			post += '\n\n';
		}
	}

	post += '\n';

	await writeFile(filepath, post, { encoding: 'utf8' });
	await chmod(filepath, 0o644);

	return filepath;
}
