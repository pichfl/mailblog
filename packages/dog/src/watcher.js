import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';

import { collectPosts } from '@posteingang/api/src/collect.js';
import { generateApi } from '@posteingang/api/src/generate.js';
import convertMail from '@posteingang/mailmd/src/convert-mail.js';
import { watch } from 'chokidar';

import { verifyEmail } from './validate.js';

export async function rebuild(distDir, deployHook) {
	const posts = await collectPosts(distDir);

	await generateApi(posts, distDir);

	if (deployHook) {
		await fetch(deployHook, { method: 'POST' }).catch((err) =>
			console.error(`deploy hook failed: ${err.message}`)
		);
	}

	return posts;
}

export function createWatcher(inDir, distDir, options = {}) {
	let rebuildTimer;
	const { salt } = options;

	const watcher = watch(inDir, {
		ignoreInitial: false,
		awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
	});

	watcher.on('add', (path) => {
		if (!path.endsWith('.eml')) {
			return;
		}

		(async () => {
			if (salt && !(await verifyEmail(path, salt))) {
				console.log(`reject: ${path}`);
				await unlink(path);
				return;
			}

			await convertMail(createReadStream(path), distDir);
			clearTimeout(rebuildTimer);
			rebuildTimer = setTimeout(() => rebuild(distDir, options.deployHook), 1000);
		})().catch((err) => console.error(`error processing ${path}: ${err.message}`));
	});

	watcher.on('error', (err) => console.error(`watcher error: ${err.message}`));

	return watcher;
}
