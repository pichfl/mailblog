import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import convertMail from '@posteingang/mailmd/src/convert-mail.js';
import test from 'ava';
import { rimraf } from 'rimraf';

import { readMail } from '../utils.js';

test('Converts Lotus Temple E-Mail into Markdown and files', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/LotusTemple.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = dirname(mdPath);

	t.like(await stat(join(outPath, 'image0.jpg')), {
		size: 1307452,
		mode: 33188,
	});
	t.like(await stat(join(outPath, 'image1.jpg')), {
		size: 698926,
		mode: 33188,
	});
	t.like(await stat(join(outPath, 'image2.jpg')), {
		size: 273194,
		mode: 33188,
	});

	const content = await readFile(mdPath, 'utf8');
	const expected = await readFile('./fixtures/posts/835d8eae08283e02/message.md', 'utf-8');
	t.is(content, expected);

	// Validate CHMOD
	t.is((await stat(mdPath)).mode.toString(8), '100644');
	t.is((await stat(outPath)).mode.toString(8), '40755');
});

test('Converts "Jaipur-Delhi.eml" into Markdown and files', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/Jaipur-Delhi.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = dirname(mdPath);

	t.like(await stat(join(outPath, 'IMG_1537.jpg')), { size: 317667 });

	const content = await readFile(mdPath, 'utf8');
	const expected = await readFile('./fixtures/posts/91d56f7766c203eb/message.md', 'utf-8');
	t.is(content, expected);
});

test('Converts "Table.eml" into Markdown and files', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/Table.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = dirname(mdPath);

	t.like(await stat(join(outPath, 'image1.jpg')), { size: 716334 });

	const content = await readFile(mdPath, 'utf8');
	const expected = await readFile('./fixtures/posts/2814609dfbfed3bc/message.md', 'utf-8');
	t.is(content, expected);
});

test('Converts "html.eml" into Markdown and files', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/html.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = dirname(mdPath);

	t.like(await stat(join(outPath, 'IMG_0010.jpg')), { size: 36745 });

	const content = await readFile(mdPath, 'utf8');
	const expected = await readFile('./fixtures/posts/27491f8bcf3cd63c/message.md', 'utf-8');
	t.is(content, expected);
});

test('Converts "text.eml" into Markdown and files', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/text.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = dirname(mdPath);

	t.like(await stat(join(outPath, 'IMG_0010.jpg')), { size: 36745 });

	const content = await readFile(mdPath, 'utf8');
	const expected = await readFile('./fixtures/posts/5c8855100472d5cb/message.md', 'utf-8');
	t.is(content, expected);
});

test('Converts email with tags into Markdown with merged frontmatter', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/Finnland.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = dirname(mdPath);

	t.like(await stat(join(outPath, '_DSC5194.jpg')), { size: 27332 });
	t.like(await stat(join(outPath, '_DSC5212.jpg')), { size: 22254 });

	const content = await readFile(mdPath, 'utf8');
	const expected = await readFile('./fixtures/posts/614dcf742bdfacf3/message.md', 'utf-8');
	t.is(content, expected);
});

test('Merges body frontmatter date into post with email date as updatedAt', async (t) => {
	const { path: mdPath } = await convertMail(
		await readMail('messages/update.eml'),
		join('out', 'test', 'convert-mail')
	);

	const content = await readFile(mdPath, 'utf8');
	t.true(content.includes('id: 02710c57f2a2946e'));
	t.true(content.includes('date: 2024-02-23T13:51:59.000Z'));
	t.true(content.includes('updatedAt: 2024-03-10T12:00:00.000Z'));
	t.true(content.includes('Updated content.'));
});

test('Returns delete action without writing files', async (t) => {
	const result = await convertMail(
		await readMail('messages/delete.eml'),
		join('out', 'test', 'convert-mail')
	);

	t.deepEqual(result, { type: 'delete', targetId: 'f4c87e63fce15eac' });
});

test('Skips post already in .Trash', async (t) => {
	const outDir = join('out', 'test', 'convert-mail-trashed');
	const postId = 'f4c87e63fce15eac';

	await mkdir(join(outDir, '.Trash', postId), { recursive: true });
	await writeFile(join(outDir, '.Trash', postId, 'message.md'), '---\ntitle: test\n---\n');

	try {
		const result = await convertMail(await readMail('messages/(No Subject).eml'), outDir);
		t.deepEqual(result, { type: 'trashed', targetId: postId });

		const postDirExists = await stat(join(outDir, postId)).then(
			() => true,
			() => false
		);
		t.false(postDirExists, 'post directory was not re-created');
	} finally {
		await rimraf(outDir);
	}
});

test.before('cleanup', async () => {
	await rimraf(join('out', 'test', 'convert-mail'));
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'convert-mail'));
});
