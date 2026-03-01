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
			filename: 'image0.jpg',
			orientation: 'portrait',
			width: 1512,
			height: 2016,
		},
		'image1.jpeg': {
			type: 'image/jpeg',
			filename: 'image1.jpg',
			orientation: 'portrait',
			width: 1512,
			height: 2016,
		},
		'image2.jpeg': {
			type: 'image/jpeg',
			filename: 'image2.jpg',
			orientation: 'square',
			width: 1280,
			height: 1280,
		},
	});

	const outPath = join('out', 'test', 'write-attachments', 'LotusTemple');

	t.like(await stat(join(outPath, 'image0.jpg')), { size: 1307452 });
	t.like(await stat(join(outPath, 'image1.jpg')), { size: 698926 });
	t.like(await stat(join(outPath, 'image2.jpg')), { size: 273194 });
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'write-attachments'));
});
