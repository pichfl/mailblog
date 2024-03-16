import { stat } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'ava';
import { rimraf } from 'rimraf';

import parseMail from '../src/parse/mail.js';
import writeAttachments from '../src/write/attachements.js';
import { readMail } from './utils.js';

test('Writes attachements of "Lotus Temple.eml"', async (t) => {
	const result = await parseMail(await readMail('./messages/LotusTemple.eml'));
	const attachments = await writeAttachments(
		'out',
		join('test', 'write-attachments', 'LotusTemple'),
		result.attachments
	);

	t.deepEqual(attachments, {
		'image0.jpeg': {
			type: 'image/jpeg',
			filename: 'image0.jpeg',
			orientation: 'portrait',
			placeholder:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGPgEBfXMzFh0DXS/vn7R2BIEIOnh1lTbaqxkQaDupqirYWRh70VALp+Cc5dcnROAAAAAElFTkSuQmCC',
			format: 'png',
			width: 900,
			height: 1200,
			channels: 3,
			premultiplied: false,
			size: 2517274,
		},
		'image1.jpeg': {
			type: 'image/jpeg',
			filename: 'image1.jpeg',
			orientation: 'portrait',
			placeholder:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AO/v9eHm8bXE1gD7+//p7PmjqbkAd3RjfHxramlbABgCACMXACkiABcoFCFh8Yv5AAAAAElFTkSuQmCC',
			format: 'png',
			width: 900,
			height: 1200,
			channels: 3,
			premultiplied: false,
			size: 1477718,
		},
		'image2.jpeg': {
			type: 'image/jpeg',
			filename: 'image2.jpeg',
			orientation: 'square',
			placeholder:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APz9/f7+/vz9/Pz8/QDr6unHwsDAvrrp6OcAQisnJRQUOxsVSikfABkAAEgjG1AkFzEOAI21GRnGCzH2AAAAAElFTkSuQmCC',
			format: 'png',
			width: 1200,
			height: 1200,
			channels: 3,
			premultiplied: false,
			size: 1862166,
		},
	});

	const outPath = join('out', 'test', 'write-attachments', 'LotusTemple');

	t.like(await stat(join(outPath, 'image0.jpeg')), { size: 2517274 });
	t.like(await stat(join(outPath, 'image1.jpeg')), { size: 1477718 });
	t.like(await stat(join(outPath, 'image2.jpeg')), { size: 1862166 });
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'write-attachments'));
});
