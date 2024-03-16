import { chmod, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sizeOf from 'image-size';
import { getPlaiceholder } from 'plaiceholder';
import sharp from 'sharp';
import mkdirp from '../utils/mkdirp.js';

const resizable = new Set(['image/jpeg', 'image/jpg', 'image/png']);

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
			const { base64: placeholder } = await getPlaiceholder(valueBuffer);

			if (!resizable.has(type)) {
				await writeFile(filepath, value, encoding);
				const size = sizeOf(valueBuffer);

				results[id] = {
					type,
					filename,
					placeholder,
					orientation: orientation(size),
					...size,
				};

				continue;
			}

			const size = await sharp(valueBuffer)
				.rotate()
				.resize(1200, 1200, {
					fit: 'inside',
					withoutEnlargement: true,
				})
				.toFormat('png')
				.toFile(filepath);

			results[id] = {
				type,
				filename,
				placeholder,
				orientation: orientation(size),
				...size,
			};
		} catch (e) {
			console.error(`Error writing ${filename}:`, e);
		}

		await chmod(filepath, 0o644);
	}

	return results;
}
