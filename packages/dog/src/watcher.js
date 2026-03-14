import { createReadStream } from 'node:fs';
import { mkdir, open, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';

import { collectPosts } from '@posteingang/api/src/collect.js';
import { generateApi } from '@posteingang/api/src/generate.js';
import convertMail from '@posteingang/mailmd/src/convert-mail.js';
import { watch } from 'chokidar';
import { execa } from 'execa';

import { verifyEmail } from './validate.js';

const RFC822_HEADER_RE =
	/^(From|To|Subject|Date|MIME-Version|Message-ID|Content-Type|Received|Return-Path):/im;

async function isEmail(path) {
	let fh;
	try {
		fh = await open(path, 'r');
		const buf = Buffer.alloc(512);
		const { bytesRead } = await fh.read(buf, 0, 512, 0);
		return bytesRead > 0 && RFC822_HEADER_RE.test(buf.subarray(0, bytesRead).toString('utf8'));
	} catch {
		return false;
	} finally {
		await fh?.close();
	}
}

export async function rebuild(distDir, options = {}) {
	const posts = await collectPosts(distDir);

	await generateApi(posts, distDir);

	if (options.deployHook) {
		await fetch(options.deployHook, { method: 'POST' }).catch((err) =>
			console.error(`deploy hook failed: ${err.message}`)
		);
	}

	if (options.exec) {
		await execa(options.exec, { shell: true, stdio: 'inherit' }).catch((err) =>
			console.error(`exec failed: ${err.message}`)
		);
	}

	return posts;
}

async function trashPost(distDir, targetId) {
	const source = join(distDir, targetId);
	const trashDir = join(distDir, '.Trash');

	await mkdir(trashDir, { recursive: true });
	await rename(source, join(trashDir, targetId));
}

export function createWatcher(inDir, distDir, options = {}) {
	let rebuildTimer;
	const { salt } = options;

	const watcher = watch(inDir, {
		ignoreInitial: false,
		awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
	});

	watcher.on('add', (path) => {
		(async () => {
			if (!(await isEmail(path))) {
				return;
			}

			if (salt && !(await verifyEmail(path, salt))) {
				console.log(`reject: ${path}`);
				await unlink(path);
				return;
			}

			const result = await convertMail(createReadStream(path), distDir);

			if (result.type === 'delete') {
				await trashPost(distDir, result.targetId);
			}

			clearTimeout(rebuildTimer);
			rebuildTimer = setTimeout(() => rebuild(distDir, options), 5000);
		})().catch((err) => console.error(`error processing ${path}: ${err.message}`));
	});

	watcher.on('error', (err) => console.error(`watcher error: ${err.message}`));

	return watcher;
}
