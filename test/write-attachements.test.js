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
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGPgEBfXMzFh0DXS/vn7R2BIEIOXl1lTbaqxgQaDupqirYWRh70VALqdCc8WT7RXAAAAAElFTkSuQmCC',
			width: 1512,
			height: 2016,
		},
		'image1.jpeg': {
			type: 'image/jpeg',
			filename: 'image1.jpeg',
			orientation: 'portrait',
			placeholder:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AO/v9eHm8bXD1gD7+//p7PmjqbkAd3RjfHxpamlcABgCACMXACkiABb3FB9cnMTKAAAAAElFTkSuQmCC',
			width: 1512,
			height: 2016,
		},
		'image2.jpeg': {
			type: 'image/jpeg',
			filename: 'image2.jpeg',
			orientation: 'square',
			placeholder:
				'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APz9/f7+/vz9/Pz8/QDr6unGwr/Av7rp6OcAQisnJRQUOxsVSSkeABkAAEckG04hFzEOAI1WGRGf0K0KAAAAAElFTkSuQmCC',
			width: 1280,
			height: 1280,
		},
	});

	const outPath = join('out', 'test', 'write-attachments', 'LotusTemple');

	t.like(await stat(join(outPath, 'image0.jpeg')), { size: 1307452 });
	t.like(await stat(join(outPath, 'image1.jpeg')), { size: 698926 });
	t.like(await stat(join(outPath, 'image2.jpeg')), { size: 273194 });
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'write-attachments'));
});
