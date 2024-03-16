import test from 'ava';

import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { rimraf } from 'rimraf';
import convertMail from '../src/convert-mail.js';
import { readMail } from './utils.js';

test('Converts Lotus Temple E-Mail into chunks', async (t) => {
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

	t.like(await stat(join(outPath, 'post.md')), { size: 1585 });
	t.like(await stat(join(outPath, 'image0.jpeg')), { size: 2517274 });
	t.like(await stat(join(outPath, 'image1.jpeg')), { size: 1477718 });
	t.like(await stat(join(outPath, 'image2.jpeg')), { size: 1862166 });
	t.is(
		await readFile(join(outPath, 'post.md'), 'utf8'),
		`---
id: DFCFA91D-782C-4CA2-B642-342D946A0656@ylk.gd
date: Wed, 14 Feb 2024 23:41:56 +0530
title: Lotus Temple
---

<figure><img src="https://cdn.ylk.gd//2024/02/14/191156/image0.jpeg" alt="" width="900" height="1200" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAMElEQVR4nGNgYGPgEBfXMzFh0DXS/vn7R2BIEIOnh1lTbaqxkQaDupqirYWRh70VALp+Cc5dcnROAAAAAElFTkSuQmCC)"><figcaption>Aastha Kunj Park</figcaption></figure>

<figure><img src="https://cdn.ylk.gd//2024/02/14/191156/image1.jpeg" alt="" width="900" height="1200" data-orientation="portrait" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAAECAIAAADETxJQAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAM0lEQVR4nAEoANf/AO/v9eHm8bXE1gD7+//p7PmjqbkAd3RjfHxramlbABgCACMXACkiABcoFCFh8Yv5AAAAAElFTkSuQmCC)"><figcaption>Inside the Lotus Temple Gardens</figcaption></figure>

<img src="https://cdn.ylk.gd//2024/02/14/191156/image2.jpeg" alt="" width="1200" height="1200" data-orientation="square" style="--ph:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAP0lEQVR4nAE0AMv/APz9/f7+/vz9/Pz8/QDr6unHwsDAvrrp6OcAQisnJRQUOxsVSikfABkAAEgjG1AkFzEOAI21GRnGCzH2AAAAAElFTkSuQmCC)">

No pictures from inside the Bahai temple, but it is a stunning architectural structure. 

The concrete roof arches feel almost weightless and let light filter in through gaps between the petals. We were very lucky to experience moments in peace and calmness almost on our own in an otherwise busy and crowded place. 
`
	);

	t.true(true);
});

test.after('cleanup', async () => {
	// await rimraf(join('out', 'test', 'convert-mail'));
});
