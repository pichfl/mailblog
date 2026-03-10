import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import sizeOf from 'image-size';

import mkdirp from '../utils/mkdirp.js';

export const IMAGE_CONTENT_TYPES = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/avif',
	'image/svg+xml',
	'image/tiff',
	'image/bmp',
	'image/heic',
	'image/heif',
]);

const orientation = ({ width, height }) => {
	if (width > height) {
		return 'landscape';
	}

	if (width < height) {
		return 'portrait';
	}

	return 'square';
};

export default async function writeAttachments(outDir, outPath, raw) {
	const out = join(outDir, outPath);
	const images = {};
	const attachments = {};

	await mkdirp(out, 0o755);

	for (const [id, attachment] of Object.entries(raw)) {
		const {
			node: { contentType: type, encoding, filename },
			value,
		} = attachment;
		const normalizedFilename = filename.replace(/\.jpeg$/i, '.jpg');
		const filepath = join(out, normalizedFilename);

		try {
			const valueBuffer = Buffer.from(value.toString(), encoding);

			await writeFile(filepath, valueBuffer);
			await chmod(filepath, 0o644);

			if (IMAGE_CONTENT_TYPES.has(type)) {
				const { width, height } = sizeOf(valueBuffer);

				images[id] = {
					type,
					filename: normalizedFilename,
					orientation: orientation({ width, height }),
					width,
					height,
				};
			} else {
				attachments[id] = {
					type,
					filename: normalizedFilename,
				};
			}
		} catch (e) {
			console.error(`Error writing ${normalizedFilename}:`, e);
		}
	}

	return { images, attachments };
}
