import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

import test from 'ava';
import { rimraf } from 'rimraf';

import convertMail from '../src/convert-mail.js';
import { readMail } from './utils.js';

test('Converts Lotus Temple E-Mail into Markdown and files', async (t) => {
	await convertMail(
		await readMail('./messages/LotusTemple.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = join('out', 'test', 'convert-mail', '2024-02-14-181156');

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
	t.is(
		await readFile(join(outPath, 'message.md'), 'utf8'),
		`---
id: DFCFA91D-782C-4CA2-B642-342D946A0656@ylk.gd
date: 2024-02-14T18:11:56.000Z
title: Lotus Temple
assets:
  - filename: image0.jpg
    width: 1512
    height: 2016
    orientation: portrait
  - filename: image1.jpg
    width: 1512
    height: 2016
    orientation: portrait
  - filename: image2.jpg
    width: 1280
    height: 1280
    orientation: square
---

<img src="image0.jpg" alt="" width="1512" height="2016" data-orientation="portrait">
^ Aastha Kunj Park

<img src="image1.jpg" alt="" width="1512" height="2016" data-orientation="portrait">
^ Inside the Lotus Temple Gardens

<img src="image2.jpg" alt="" width="1280" height="1280" data-orientation="square">

No pictures from inside the Bahai temple, but it is a stunning architectural structure. 

The concrete roof arches feel almost weightless and let light filter in through gaps between the petals. We were very lucky to experience moments in peace and calmness almost on our own in an otherwise busy and crowded place.
`
	);

	// Validate CHMOD

	t.is(
		(
			await stat(join('out', 'test', 'convert-mail', '2024-02-14-181156', 'message.md'))
		).mode.toString(8),
		'100644'
	);

	t.is(
		(await stat(join('out', 'test', 'convert-mail', '2024-02-14-181156'))).mode.toString(8),
		'40755'
	);
});

test('Converts "Jaipur-Delhi.eml" into Markdown and files', async (t) => {
	await convertMail(
		await readMail('./messages/Jaipur-Delhi.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = join('out', 'test', 'convert-mail', '2024-02-23-135159');

	t.like(await stat(join(outPath, 'IMG_1537.jpg')), { size: 317667 });
	t.is(
		await readFile(join(outPath, 'message.md'), 'utf8'),
		`---
id: 5203A9F6-8CA1-46A4-90A8-4E7092F39C7D@ylk.gd
date: 2024-02-23T13:51:59.000Z
title: Jaipur &ndash; Delhi
assets:
  - filename: IMG_1537.jpg
    width: 914
    height: 1280
    orientation: portrait
---

<img src="IMG_1537.jpg" alt="" width="914" height="1280" data-orientation="portrait">

By train
`
	);

	t.true(true);
});

test('Converts "Table.eml" into Markdown and files', async (t) => {
	await convertMail(await readMail('./messages/Table.eml'), join('out', 'test', 'convert-mail'));

	const outPath = join('out', 'test', 'convert-mail', '2024-04-21-171019');

	t.like(await stat(join(outPath, 'image1.jpg')), { size: 716334 });
	t.is(
		await readFile(join(outPath, 'message.md'), 'utf8'),
		`---
id: C73DC854-EA96-4721-8881-EA4DADEF97A5@ylk.gd
date: 2024-04-21T17:10:19.000Z
title: Table
assets:
  - filename: image1.jpg
    width: 1512
    height: 1512
    orientation: square
---

Our IKEA Ingatorp table top hasn’t aged well in ten years, so it was time for a replacement. 

Ash from a local forestry. Cut, planed, glued, sanded, routed, and finished at [Das Habitat Augsburg](https://das-habitat.de). Slightly bigger dimensions than the original to make more room for boardgames. 

<img src="image1.jpg" alt="" width="1512" height="1512" data-orientation="square">

Well worth the time.
`
	);

	t.true(true);
});

test('Converts "html.eml" into Markdown and files', async (t) => {
	await convertMail(await readMail('./messages/html.eml'), join('out', 'test', 'convert-mail'));

	const outPath = join('out', 'test', 'convert-mail', '2024-01-14-210023');

	t.like(await stat(join(outPath, 'IMG_0010.jpg')), { size: 36745 });
	t.is(
		await readFile(join(outPath, 'message.md'), 'utf8'),
		`---
id: D1F2A684-4D3D-4867-ABF7-DDD90DC78546@ylk.gd
date: 2024-01-14T21:00:23.000Z
title: "HTLM #2"
assets:
  - filename: IMG_0010.jpg
    width: 240
    height: 320
    orientation: portrait
---

Das ist eine Testnachricht. 
Mit **Extra** Text und _Umbruch_.

Mit Emoji 😍 Und Bild!

<img src="IMG_0010.jpg" alt="" width="240" height="320" data-orientation="portrait">
^ Mit Bildunterschrift

> Lorem Ipsum bla blah 

Das hier wird _italic_ und Das hier wird **fett**

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin consequat magna sed orci malesuada varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi at arcu lorem. Proin eu magna et sapien hendrerit vestibulum in eu ex. Quisque in posuere nisl. 

Etiam aliquet lobortis dui ut aliquam. Donec ornare, dolor sed fringilla pharetra, dui felis iaculis urna, at aliquam lacus arcu vitae mauris. Donec quis suscipit nisi. Sed tincidunt quam rhoncus pharetra rutrum. Fusce at urna bibendum, hendrerit arcu aliquam, vestibulum metus.

\`\`\`js
code
\`\`\`
`
	);

	t.true(true);
});

test('Converts "text.eml" into Markdown and files', async (t) => {
	await convertMail(await readMail('./messages/text.eml'), join('out', 'test', 'convert-mail'));

	const outPath = join('out', 'test', 'convert-mail', '2024-01-14-204635');

	t.like(await stat(join(outPath, 'IMG_0010.jpg')), { size: 36745 });
	t.is(
		await readFile(join(outPath, 'message.md'), 'utf8'),
		`---
id: 62D1AEA4-FC6F-4279-9CD4-8D2CECE5A0CF@ylk.gd
date: 2024-01-14T20:46:35.000Z
title: Testnachricht Text
assets:
  - filename: IMG_0010.jpg
    width: 240
    height: 320
    orientation: portrait
---

Das ist eine Testnachricht. 
Mit Extra Text und Umbruch.

Mit Emoji 😍 Und Bild!

<img src="IMG_0010.jpg" alt="" width="240" height="320" data-orientation="portrait">
^ Mit Bildunterschrift

> Lorem Ipsum bla blah 

Das hier wird _italic_ und Das hier wird **fett**

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin consequat magna sed orci malesuada varius. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi at arcu lorem. Proin eu magna et sapien hendrerit vestibulum in eu ex. Quisque in posuere nisl. 

Etiam aliquet lobortis dui ut aliquam. Donec ornare, dolor sed fringilla pharetra, dui felis iaculis urna, at aliquam lacus arcu vitae mauris. Donec quis suscipit nisi. Sed tincidunt quam rhoncus pharetra rutrum. Fusce at urna bibendum, hendrerit arcu aliquam, vestibulum metus.

\`\`\`js
code
\`\`\`
`
	);

	t.true(true);
});

test('Converts email with frontmatter into Markdown with merged frontmatter', async (t) => {
	await convertMail(await readMail('./messages/Finnland.eml'), join('out', 'test', 'convert-mail'));

	const outPath = join('out', 'test', 'convert-mail', '2026-03-01-080000');

	// Verify images were processed
	t.like(await stat(join(outPath, '_DSC5194.jpg')), { size: 27332 });
	t.like(await stat(join(outPath, '_DSC5212.jpg')), { size: 22254 });

	const content = await readFile(join(outPath, 'message.md'), 'utf8');

	const expectedContent = await readFile(join(import.meta.dirname, 'expected-finnland.md'), 'utf8');
	t.is(content, expectedContent);
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'convert-mail'));
});
