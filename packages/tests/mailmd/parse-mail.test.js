import parseMail from '@posteingang/mailmd/src/parse/mail.js';
import test from 'ava';

import { readMail } from '../utils.js';

test('Parses Lotus Temple E-Mail into chunks', async (t) => {
	const result = await parseMail(await readMail('messages/LotusTemple.eml'));

	t.like(result.meta, {
		id: '835d8eae08283e02',
		date: '2024-02-14T18:11:56.000Z',
		sentAt: '2024-02-14T18:11:56.000Z',
		title: 'Lotus Temple',
	});

	t.deepEqual(Object.keys(result.attachments), ['image0.jpeg', 'image1.jpeg', 'image2.jpeg']);

	t.like(result.attachments, {
		'image0.jpeg': {
			headers: {
				contentDisposition: {
					filename: 'image0.jpeg',
					value: 'inline',
				},
				contentTransferEncoding: {
					value: 'base64',
				},
				contentType: {
					name: 'image0.jpeg',
					value: 'image/jpeg',
					'x-apple-part-url': '15889290-1A51-4170-BB27-209B2787A36E-L0-001',
				},
			},
		},
		'image1.jpeg': {
			headers: {
				contentDisposition: {
					filename: 'image1.jpeg',
					value: 'inline',
				},
				contentTransferEncoding: {
					value: 'base64',
				},
				contentType: {
					name: 'image1.jpeg',
					value: 'image/jpeg',
					'x-apple-part-url': '0970482C-9A78-49B8-BBBE-54E994A23117-L0-001',
				},
			},
		},
		'image2.jpeg': {
			headers: {
				contentDisposition: {
					filename: 'image2.jpeg',
					value: 'inline',
				},
				contentTransferEncoding: {
					value: 'base64',
				},
				contentType: {
					name: 'image2.jpeg',
					value: 'image/jpeg',
					'x-apple-part-url': '257140B3-FA8D-497D-A353-258C96E31F81-L0-001',
				},
			},
		},
	});

	t.truthy(result.attachments['image0.jpeg'].node);
	t.truthy(result.attachments['image1.jpeg'].node);
	t.truthy(result.attachments['image2.jpeg'].node);

	t.truthy(result.attachments['image0.jpeg'].value);
	t.truthy(result.attachments['image1.jpeg'].value);
	t.truthy(result.attachments['image2.jpeg'].value);

	t.deepEqual(result.chunks, [
		{
			contentId: undefined,
			filename: 'image0.jpeg',
			id: 'image0.jpeg',
			type: 'image/jpeg',
		},
		{
			type: 'text/plain',
			text: '^ Aastha Kunj Park',
			meta: {},
		},
		{
			contentId: undefined,
			filename: 'image1.jpeg',
			id: 'image1.jpeg',
			type: 'image/jpeg',
		},
		{
			type: 'text/plain',
			text: '^ Inside the Lotus Temple Gardens',
			meta: {},
		},
		{
			contentId: undefined,
			filename: 'image2.jpeg',
			id: 'image2.jpeg',
			type: 'image/jpeg',
		},
		{
			type: 'text/plain',
			text:
				'No pictures from inside the Bahai temple, but it is a stunning architectural structure. \n' +
				'\n' +
				'The concrete roof arches feel almost weightless and let light filter in through gaps between the petals. We were very lucky to experience moments in peace and calmness almost on our own in an otherwise busy and crowded place. ',
			meta: {},
		},
	]);
});

test('Parses HTML E-Mail into chunks', async (t) => {
	const result = await parseMail(await readMail('messages/html.eml'));

	t.like(result.meta, {
		id: '27491f8bcf3cd63c',
		date: '2024-01-14T21:00:23.000Z',
		sentAt: '2024-01-14T21:00:23.000Z',
		title: 'HTLM #2',
	});

	t.deepEqual(Object.keys(result.attachments), ['204AA714-2C40-4EC8-86CF-28DCC26CB36B']);
	t.like(result.attachments, {
		'204AA714-2C40-4EC8-86CF-28DCC26CB36B': {
			headers: {
				contentDisposition: {
					filename: 'IMG_0010.jpeg',
					value: 'inline',
				},
				contentId: {
					value: '<204AA714-2C40-4EC8-86CF-28DCC26CB36B>',
				},
				contentTransferEncoding: {
					value: 'base64',
				},
				contentType: {
					name: 'IMG_0010.jpeg',
					value: 'image/jpeg',
					'x-unix-mode': '0666',
				},
			},
		},
	});

	t.truthy(result.attachments['204AA714-2C40-4EC8-86CF-28DCC26CB36B'].node);
	t.truthy(result.attachments['204AA714-2C40-4EC8-86CF-28DCC26CB36B'].value);

	t.deepEqual(result.chunks, [
		{
			text: `Das ist eine Testnachricht. 
Mit **Extra** Text und _Umbruch_.

Mit Emoji 😍 Und Bild!

[[204AA714-2C40-4EC8-86CF-28DCC26CB36B]]

^ Mit Bildunterschrift

> Lorem Ipsum bla blah 

Das hier wird _italic_ und Das hier wird **fett**

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin consequat magna sed orci malesuada varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi at arcu lorem. Proin eu magna et sapien hendrerit vestibulum in eu ex. Quisque in posuere nisl. 

Etiam aliquet lobortis dui ut aliquam. Donec ornare, dolor sed fringilla pharetra, dui felis iaculis urna, at aliquam lacus arcu vitae mauris. Donec quis suscipit nisi. Sed tincidunt quam rhoncus pharetra rutrum. Fusce at urna bibendum, hendrerit arcu aliquam, vestibulum metus.

\`\`\`js
code
\`\`\``,
			type: 'text/markdown',
			meta: {},
		},
		{
			contentId: '204AA714-2C40-4EC8-86CF-28DCC26CB36B',
			filename: 'IMG_0010.jpeg',
			id: '204AA714-2C40-4EC8-86CF-28DCC26CB36B',
			type: 'image/jpeg',
		},
	]);
});

test('Parses (No Subject).eml', async (t) => {
	const result = await parseMail(await readMail('messages/(No Subject).eml'));

	t.like(result.meta, {
		id: 'f4c87e63fce15eac',
		date: '2024-02-14T17:41:28.000Z',
		sentAt: '2024-02-14T17:41:28.000Z',
		title: '',
	});

	t.deepEqual(Object.keys(result.attachments), []);
	t.deepEqual(result.attachments, {});

	t.deepEqual(result.chunks, [
		{
			text: `We went to Lajpat Nagar market to buy dress shoes for the main event and a nice golden yellow kurta for the haldi ceremony for me. I got fitted for a turban that will be wound for me, too. 

Which means I'm done shopping for the wedding and we can spent a few days doing touristy things.`,
			type: 'text/plain',
			meta: {},
		},
	]);
});

test('Parses Taj Mahal.eml', async (t) => {
	const result = await parseMail(await readMail('messages/Taj Mahal.eml'));

	t.like(result.meta, {
		id: '662cb06c829f0be5',
		date: '2024-02-19T08:57:06.000Z',
		sentAt: '2024-02-19T08:57:06.000Z',
		title: 'Taj Mahal',
	});

	t.deepEqual(Object.keys(result.attachments), ['IMG_1117.jpg']);

	t.like(result.attachments, {
		'IMG_1117.jpg': {
			headers: {
				contentDisposition: {
					filename: 'IMG_1117.jpg',
					value: 'inline',
				},
				contentTransferEncoding: {
					value: 'base64',
				},
				contentType: {
					name: 'IMG_1117.jpg',
					value: 'image/jpeg',
					'x-apple-part-url': '4211E669-CD97-4959-951B-A8F2C9E88406',
				},
			},
		},
	});

	t.deepEqual(result.chunks, [
		{
			contentId: undefined,
			filename: 'IMG_1117.jpg',
			id: 'IMG_1117.jpg',
			type: 'image/jpeg',
		},
	]);
});
