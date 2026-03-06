#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { collectPosts } from '@posteingang/api/src/collect.js';
import { generateApi } from '@posteingang/api/src/generate.js';
import convertMail from '@posteingang/mailmd/src/convert-mail.js';
import { watch } from 'chokidar';
import { program } from 'commander';
import * as dotenv from 'dotenv';

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

	const watcher = watch(inDir, {
		ignoreInitial: false,
		awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
	});

	watcher.on('add', (path) => {
		if (!path.endsWith('.eml')) {
			return;
		}

		convertMail(createReadStream(path), distDir)
			.then(() => {
				clearTimeout(rebuildTimer);
				rebuildTimer = setTimeout(() => rebuild(distDir, options.deployHook), 1000);
			})
			.catch((err) => console.error(`error processing ${path}: ${err.message}`));
	});

	watcher.on('error', (err) => console.error(`watcher error: ${err.message}`));

	return watcher;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	dotenv.config({ quiet: true });

	program
		.argument('[in]', 'inbox directory to watch', './in')
		.argument('[dist]', 'dist directory for output', './dist')
		.option('-d, --deploy-hook <url>', 'webhook URL to POST to after rebuild')
		.action((inDir, distDir, { deployHook }) => {
			createWatcher(inDir, distDir, { deployHook });
			console.log(`@posteingang/dog watching ${inDir}`);
		});

	program.parse();
}
