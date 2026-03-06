import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

import convertMdToMail, {
	parseMarkdownToPlainText,
	extractAttachments,
} from '@posteingang/mailmd/src/convert-md.js';
import test from 'ava';
import { rimraf } from 'rimraf';

const testImageContent = 'fake-image-content';

const needsFolderTests = ['convertMdToMail'];

test.beforeEach(async (t) => {
	if (needsFolderTests.some((name) => t.title.includes(name))) {
		const testName = t.title.split(' › ').pop().replace(/\s+/g, '-');
		t.context.testFolder = join('out', 'test', 'convert-md', testName);
		await mkdir(t.context.testFolder, { recursive: true });
	}
});

test.afterEach(async (t) => {
	if (needsFolderTests.some((name) => t.title.includes(name)) && t.context.testFolder) {
		await rm(t.context.testFolder, { recursive: true, force: true });
	}
});

test('parseMarkdownToPlainText › preserves bold and italic formatting', (t) => {
	const input = 'This is **bold** and this is *italic* text.';
	const expected = 'This is **bold** and this is *italic* text.';
	t.is(parseMarkdownToPlainText(input), expected);
});

test('parseMarkdownToPlainText › preserves markdown images', (t) => {
	const input = 'Here is an image: ![Alt text](image.jpg)';
	const expected = 'Here is an image: ![Alt text](image.jpg)';
	t.is(parseMarkdownToPlainText(input), expected);
});

test('parseMarkdownToPlainText › replaces HTML images with CID placeholders and keeps captions', (t) => {
	const input = '<img src="test.jpg" alt="" width="640" height="480">\n^ This is a caption';
	const expected = '[cid:test]\n^ This is a caption';
	t.is(parseMarkdownToPlainText(input), expected);
});

test('parseMarkdownToPlainText › replaces standalone HTML images with CID placeholders', (t) => {
	const input = 'Text before <img src="standalone.jpg" alt="" width="300" height="200"> text after';
	const expected = 'Text before [cid:standalone] text after';
	t.is(parseMarkdownToPlainText(input), expected);
});

test('parseMarkdownToPlainText › preserves caption markers as text', (t) => {
	const input = 'Some text\n^ Image caption\nMore text';
	const expected = 'Some text\n^ Image caption\nMore text';
	t.is(parseMarkdownToPlainText(input), expected);
});

test('parseMarkdownToPlainText › normalizes multiple newlines', (t) => {
	const input = 'Paragraph 1\n\n\n\nParagraph 2\n\n\n\n\nParagraph 3';
	const expected = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
	t.is(parseMarkdownToPlainText(input), expected);
});

test('parseMarkdownToPlainText › handles complex mixed content', (t) => {
	const input = `# Main Title

This is **bold** and *italic* text with a [link](https://example.com).

<img src="image1.jpg" alt="" width="640" height="480">
^ Image caption here

Some \`inline code\` and more text.

Final paragraph.`;

	const expected = `# Main Title

This is **bold** and *italic* text with a [link](https://example.com).

[cid:image1]
^ Image caption here

Some \`inline code\` and more text.

Final paragraph.`;

	t.is(parseMarkdownToPlainText(input), expected);
});

test('extractAttachments › extracts single image attachment', (t) => {
	const content = '<img src="test.jpg" alt="" width="640" height="480">';
	const folderPath = '/test/path';
	const result = extractAttachments(content, folderPath);

	t.deepEqual(result, [
		{
			filename: 'test.jpg',
			path: '/test/path/test.jpg',
			cid: 'test',
		},
	]);
});

test('extractAttachments › extracts multiple image attachments', (t) => {
	const content = `
		<img src="image1.jpg" alt="" width="640" height="480">
		Some text
		<img src="image2.png" alt="" width="300" height="200">
		More text
		<img src="image3.gif" alt="" width="100" height="100">
	`;
	const folderPath = '/test/path';
	const result = extractAttachments(content, folderPath);

	t.deepEqual(result, [
		{
			filename: 'image1.jpg',
			path: '/test/path/image1.jpg',
			cid: 'image1',
		},
		{
			filename: 'image2.png',
			path: '/test/path/image2.png',
			cid: 'image2',
		},
		{
			filename: 'image3.gif',
			path: '/test/path/image3.gif',
			cid: 'image3',
		},
	]);
});

test('extractAttachments › handles no images', (t) => {
	const content = 'Just plain text with no images.';
	const folderPath = '/test/path';
	const result = extractAttachments(content, folderPath);

	t.deepEqual(result, []);
});

test('extractAttachments › handles complex image attributes', (t) => {
	const content =
		'<img src="complex.jpg" alt="Alt text" width="640" height="480" data-orientation="landscape" style="border: 1px solid red;">';
	const folderPath = '/test/path';
	const result = extractAttachments(content, folderPath);

	t.deepEqual(result, [
		{
			filename: 'complex.jpg',
			path: '/test/path/complex.jpg',
			cid: 'complex',
		},
	]);
});

test('convertMdToMail › converts basic markdown with frontmatter', async (t) => {
	const messageContent = `---
from: sender@example.com
to: recipient@example.com
subject: Test Subject
date: 2024-01-01T00:00:00.000Z
---

# Hello World

This is a test message.`;

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder);

	t.deepEqual(result, {
		from: undefined,
		to: undefined,
		subject: 'converts-basic-markdown-with-frontmatter',
		text: `---
from: sender@example.com
to: recipient@example.com
subject: Test Subject
date: 2024-01-01T00:00:00.000Z
---

# Hello World

This is a test message.`,
		attachments: [],
	});
});

test('convertMdToMail › uses CLI options to override frontmatter', async (t) => {
	const messageContent = `---
from: original@example.com
to: original-to@example.com
subject: Original Subject
---

Test content.`;

	const options = {
		from: 'override@example.com',
		to: 'override-to@example.com',
		subject: 'Override Subject',
	};

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder, options);

	t.is(result.from, 'override@example.com');
	t.is(result.to, 'override-to@example.com');
	t.is(result.subject, 'Override Subject');
});

test('convertMdToMail › uses folder name as subject', async (t) => {
	const messageContent = `---
from: sender@example.com
to: recipient@example.com
title: Title as Subject
---

Test content.`;

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder);

	t.is(result.subject, 'uses-folder-name-as-subject');
});

test('convertMdToMail › falls back to folder name for subject', async (t) => {
	const messageContent = `---
from: sender@example.com
to: recipient@example.com
---

Test content.`;

	const testFolder = join('out', 'test', 'my-folder-name');
	await mkdir(testFolder, { recursive: true });
	await writeFile(join(testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(testFolder);

	t.is(result.subject, 'my-folder-name');

	await rm(testFolder, { recursive: true, force: true });
});

test('convertMdToMail › includes basic email fields', async (t) => {
	const messageContent = `---
from: sender@example.com
to: recipient@example.com
subject: Test
---

Test content.`;

	const options = {
		from: 'override@example.com',
		to: 'override-to@example.com',
	};

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder, options);

	t.is(result.from, 'override@example.com');
	t.is(result.to, 'override-to@example.com');
	t.is(result.subject, 'includes-basic-email-fields');
});

test('convertMdToMail › includes undefined fields', async (t) => {
	const messageContent = `---
subject: Only Subject
---

Test content.`;

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder);

	t.is(result.from, undefined);
	t.is(result.to, undefined);
	t.is(result.subject, 'includes-undefined-fields');
	t.true('from' in result);
	t.true('to' in result);
	t.true('subject' in result);
});

test('convertMdToMail › handles images and attachments', async (t) => {
	await writeFile(join(t.context.testFolder, 'test1.jpg'), testImageContent);
	await writeFile(join(t.context.testFolder, 'test2.png'), testImageContent);

	const messageContent = `---
from: sender@example.com
to: recipient@example.com
subject: Images Test
---

# Image Test

Here's an image:

<img src="test1.jpg" alt="" width="640" height="480">
^ First image caption

Some text between images.

<img src="test2.png" alt="" width="300" height="200">

More text.`;

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder);

	t.is(result.attachments.length, 2);
	t.deepEqual(result.attachments, [
		{
			filename: 'test1.jpg',
			path: join(t.context.testFolder, 'test1.jpg'),
			cid: 'test1',
		},
		{
			filename: 'test2.png',
			path: join(t.context.testFolder, 'test2.png'),
			cid: 'test2',
		},
	]);

	t.false(result.text.includes('<img'));
	t.false(result.text.includes('test1.jpg'));
	t.false(result.text.includes('test2.png'));
	t.true(result.text.includes('[cid:test1]'));
	t.true(result.text.includes('[cid:test2]'));
	t.true(result.text.includes('^ First image caption'));
});

test('convertMdToMail › handles complex markdown content', async (t) => {
	const messageContent = `---
from: sender@example.com
to: recipient@example.com
subject: Complex Test
---

# Main Heading

This message has **bold** and *italic* text.

## Subheading

Here's a [link](https://example.com) and some \`code\`.

> This is a blockquote

And a list:
- Item 1
- Item 2
- Item 3

Final paragraph.`;

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder);

	const expectedTextContent = `# Main Heading

This message has **bold** and *italic* text.

## Subheading

Here's a [link](https://example.com) and some \`code\`.

> This is a blockquote

And a list:
- Item 1
- Item 2
- Item 3

Final paragraph.`;

	t.true(result.text.includes(expectedTextContent));
});

test('convertMdToMail › handles empty content', async (t) => {
	const messageContent = `---
from: sender@example.com
to: recipient@example.com
subject: Empty Test
---

`;

	await writeFile(join(t.context.testFolder, 'message.md'), messageContent);
	const result = await convertMdToMail(t.context.testFolder);

	t.is(result.from, undefined);
	t.is(result.to, undefined);
	t.is(result.subject, 'handles-empty-content');
	t.true(result.text.includes('---'));
	t.deepEqual(result.attachments, []);
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'convert-md'));
});
