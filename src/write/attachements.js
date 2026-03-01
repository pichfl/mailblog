import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import sizeOf from 'image-size';

import mkdirp from '../utils/mkdirp.js';

const orientation = ({ width, height }) => {
	if (width > height) {
		return 'landscape';
	}

	if (width < height) {
		return 'portrait';
	}

	return 'square';
};

export default async function writeAttachments(outDir, outPath, attachments) {
	const out = join(outDir, outPath);
	const results = {};

	await mkdirp(out, 0o755);

	for (const [id, attachment] of Object.entries(attachments)) {
		const {
			node: { contentType: type, encoding, filename },
			value,
		} = attachment;
		const filepath = join(out, filename);

		try {
			const valueBuffer = Buffer.from(value.toString(), encoding);
			const { width, height } = sizeOf(valueBuffer);

			await writeFile(filepath, valueBuffer);

			results[id] = {
				type,
				filename,
				orientation: orientation({ width, height }),
				width,
				height,
			};

			await chmod(filepath, 0o644);
		} catch (e) {
			console.error(`Error writing ${filename}:`, e);
		}
	}

	return results;
}
