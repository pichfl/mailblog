import test from 'ava';

import { readFile, stat } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { rimraf } from 'rimraf';
import convertMail from '../src/convert-mail.js';
import { readMail } from './utils.js';

test('Converts Lotus Temple E-Mail into Markdown and files', async (t) => {
	await convertMail(
		await readMail('./messages/LotusTemple.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = join(
		'out',
		'test',
		'convert-mail',
		'2024',
		'02',
		'14',
		'191156'
	);

	t.like(await stat(join(outPath, 'image0.jpeg')), {
		size: 2517274,
		mode: 33188,
	});
	t.like(await stat(join(outPath, 'image1.jpeg')), {
		size: 1477718,
		mode: 33188,
	});
	t.like(await stat(join(outPath, 'image2.jpeg')), {
		size: 1862166,
		mode: 33188,
	});
	t.is(
		await readFile(join(outPath, 'post.md'), 'utf8'),
		`---
id: DFCFA91D-782C-4CA2-B642-342D946A0656@ylk.gd
date: Wed, 14 Feb 2024 23:41:56 +0530
title: Lotus Temple
---

<figure><img src="https://cdn.ylk.gd/2024/02/14/191156/image0.jpeg" alt="" width="900" height="1200" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGPgEBfXMzFh0DXS/vn7R2BIEIOnh1lTbaqxkQaDupqirYWRh70VALp+Cc5dcnROAAAAAElFTkSuQmCC)"><figcaption>Aastha Kunj Park</figcaption></figure>

<figure><img src="https://cdn.ylk.gd/2024/02/14/191156/image1.jpeg" alt="" width="900" height="1200" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AO/v9eHm8bXE1gD7+//p7PmjqbkAd3RjfHxramlbABgCACMXACkiABcoFCFh8Yv5AAAAAElFTkSuQmCC)"><figcaption>Inside the Lotus Temple Gardens</figcaption></figure>

<img src="https://cdn.ylk.gd/2024/02/14/191156/image2.jpeg" alt="" width="1200" height="1200" data-orientation="square" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APz9/f7+/vz9/Pz8/QDr6unHwsDAvrrp6OcAQisnJRQUOxsVSikfABkAAEgjG1AkFzEOAI21GRnGCzH2AAAAAElFTkSuQmCC)">

No pictures from inside the Bahai temple, but it is a stunning architectural structure. 

The concrete roof arches feel almost weightless and let light filter in through gaps between the petals. We were very lucky to experience moments in peace and calmness almost on our own in an otherwise busy and crowded place.
`
	);

	// Validate CHMOD

	t.is(
		(
			await stat(
				join(
					'out',
					'test',
					'convert-mail',
					'2024',
					'02',
					'14',
					'191156',
					'post.md'
				)
			)
		).mode.toString(8),
		'100644'
	);

	t.is(
		(
			await stat(
				join('out', 'test', 'convert-mail', '2024', '02', '14', '191156')
			)
		).mode.toString(8),
		'40755'
	);

	t.is(
		(
			await stat(join('out', 'test', 'convert-mail', '2024', '02', '14'))
		).mode.toString(8),
		'40755'
	);

	t.is(
		(
			await stat(join('out', 'test', 'convert-mail', '2024', '02'))
		).mode.toString(8),
		'40755'
	);

	t.is(
		(await stat(join('out', 'test', 'convert-mail', '2024'))).mode.toString(8),
		'40755'
	);
});

test('Converts "Jaipur-Delhi.eml" into Markdown and files', async (t) => {
	await convertMail(
		await readMail('./messages/Jaipur-Delhi.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = join(
		'out',
		'test',
		'convert-mail',
		'2024',
		'02',
		'23',
		'145159'
	);

	t.like(await stat(join(outPath, 'IMG_1537.jpg')), { size: 1759719 });
	t.is(
		await readFile(join(outPath, 'post.md'), 'utf8'),
		`---
id: 5203A9F6-8CA1-46A4-90A8-4E7092F39C7D@ylk.gd
date: Fri, 23 Feb 2024 19:21:59 +0530
title: Jaipur &ndash; Delhi
---

<img src="https://cdn.ylk.gd/2024/02/23/145159/IMG_1537.jpg" alt="" width="857" height="1200" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AFxQWXttdraiqADqwJv4yq3/8NcASx0ARxwAKgAAAPPk6uPW3ZR/gIceE70oKAA9AAAAAElFTkSuQmCC)">

By train
`
	);

	t.true(true);
});

test('Converts "Table.eml" into Markdown and files', async (t) => {
	await convertMail(
		await readMail('./messages/Table.eml'),
		join('out', 'test', 'convert-mail')
	);

	const outPath = join(
		'out',
		'test',
		'convert-mail',
		'2024',
		'04',
		'21',
		'191019'
	);

	// t.like(await stat(join(outPath, 'post.md')), { size: 853 });
	t.like(await stat(join(outPath, 'image1.jpeg')), { size: 3431692 });
	t.is(
		await readFile(join(outPath, 'post.md'), 'utf8'),
		`---
id: C73DC854-EA96-4721-8881-EA4DADEF97A5@ylk.gd
date: Sun, 21 Apr 2024 19:10:19 +0200
title: Table
---

Our IKEA Ingatorp table top hasn’t aged well in ten years, so it was time for a replacement. 

Ash from a local forestry. Cut, planed, glued, sanded, routed, and finished at [Das Habitat Augsburg](https://das-habitat.de). Slightly bigger dimensions than the original to make more room for boardgames. 

<img src="https://cdn.ylk.gd/2024/04/21/191019/image1.jpeg" alt="" width="1200" height="1200" data-orientation="square" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/AFJKO3hwYr+9vf/y6gCRiHirm4n/+vmwr6MAj4FxnYVsxbSktKWWAHx4dyUeEA4AAG5tbebXGbmiE1KkAAAAAElFTkSuQmCC)">

Well worth the time.
`
	);

	t.true(true);
});

test.after('cleanup', async () => {
	await rimraf(join('out', 'test', 'convert-mail'));
});
