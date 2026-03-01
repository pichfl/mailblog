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

	t.like(await stat(join(outPath, 'image0.jpeg')), {
		size: 1307452,
		mode: 33188,
	});
	t.like(await stat(join(outPath, 'image1.jpeg')), {
		size: 698926,
		mode: 33188,
	});
	t.like(await stat(join(outPath, 'image2.jpeg')), {
		size: 273194,
		mode: 33188,
	});
	t.is(
		await readFile(join(outPath, 'post.md'), 'utf8'),
		`---
id: DFCFA91D-782C-4CA2-B642-342D946A0656@ylk.gd
date: 2024-02-14T18:11:56.000Z
title: Lotus Temple
assets:
  - filename: image0.jpeg
    width: 1512
    height: 2016
    orientation: portrait
  - filename: image1.jpeg
    width: 1512
    height: 2016
    orientation: portrait
  - filename: image2.jpeg
    width: 1280
    height: 1280
    orientation: square
---

<figure><img src="image0.jpeg" alt="" width="1512" height="2016" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGPgEBfXMzFh0DXS/vn7R2BIEIOXl1lTbaqxgQaDupqirYWRh70VALqdCc8WT7RXAAAAAElFTkSuQmCC)"><figcaption>Aastha Kunj Park</figcaption></figure>

<figure><img src="image1.jpeg" alt="" width="1512" height="2016" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AO/v9eHm8bXD1gD7+//p7PmjqbkAd3RjfHxpamlcABgCACMXACkiABb3FB9cnMTKAAAAAElFTkSuQmCC)"><figcaption>Inside the Lotus Temple Gardens</figcaption></figure>

<img src="image2.jpeg" alt="" width="1280" height="1280" data-orientation="square" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APz9/f7+/vz9/Pz8/QDr6unGwr/Av7rp6OcAQisnJRQUOxsVSSkeABkAAEckG04hFzEOAI1WGRGf0K0KAAAAAElFTkSuQmCC)">

No pictures from inside the Bahai temple, but it is a stunning architectural structure. 

The concrete roof arches feel almost weightless and let light filter in through gaps between the petals. We were very lucky to experience moments in peace and calmness almost on our own in an otherwise busy and crowded place.
`
	);

	// Validate CHMOD

	t.is(
		(await stat(join('out', 'test', 'convert-mail', '2024-02-14-181156', 'post.md'))).mode.toString(
			8
		),
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
		await readFile(join(outPath, 'post.md'), 'utf8'),
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

<img src="IMG_1537.jpg" alt="" width="914" height="1280" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AFtQWHttdraiqADqwJv4yq3/8NcASRwARhsAKQAAAPHf6OPW3ZR/gIYmE6ztt2ejAAAAAElFTkSuQmCC)">

By train
`
	);

	t.true(true);
});

test('Converts "Table.eml" into Markdown and files', async (t) => {
	await convertMail(await readMail('./messages/Table.eml'), join('out', 'test', 'convert-mail'));

	const outPath = join('out', 'test', 'convert-mail', '2024-04-21-171019');

	// t.like(await stat(join(outPath, 'post.md')), { size: 853 });
	t.like(await stat(join(outPath, 'image1.jpeg')), { size: 716334 });
	t.is(
		await readFile(join(outPath, 'post.md'), 'utf8'),
		`---
id: C73DC854-EA96-4721-8881-EA4DADEF97A5@ylk.gd
date: 2024-04-21T17:10:19.000Z
title: Table
assets:
  - filename: image1.jpeg
    width: 1512
    height: 1512
    orientation: square
---

Our IKEA Ingatorp table top hasn’t aged well in ten years, so it was time for a replacement. 

Ash from a local forestry. Cut, planed, glued, sanded, routed, and finished at [Das Habitat Augsburg](https://das-habitat.de). Slightly bigger dimensions than the original to make more room for boardgames. 

<img src="image1.jpeg" alt="" width="1512" height="1512" data-orientation="square" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AFJKO3duYcC+vf/y6gCRiHiqm4n/+vmwr6MAkYVzm4Vsw6+jtKWWAHx4dyQcDw4AAG5tbeY0GbAIVVk4AAAAAElFTkSuQmCC)">

Well worth the time.
`
	);

	t.true(true);
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'convert-mail'));
});
