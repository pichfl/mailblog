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

export async function rebuild(outDir, options = {}) {
	const posts = await collectPosts(outDir);

	await generateApi(posts, outDir);

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

async function moveToProcessed(processedDir, filePath, mailbox = false) {
	await mkdir(processedDir, { recursive: true });

	const name = filePath.slice(filePath.lastIndexOf('/') + 1);
	let newName = name;

	if (mailbox) {
		const infoIdx = name.indexOf(':2,');

		if (infoIdx !== -1) {
			const flags = new Set(name.slice(infoIdx + 3));

			flags.add('S');
			newName = name.slice(0, infoIdx + 3) + [...flags].sort().join('');
		} else {
			newName = `${name}:2,S`;
		}
	}

	await rename(filePath, join(processedDir, newName));
}

async function trashPost(outDir, targetId) {
	const source = join(outDir, targetId);
	const trashDir = join(outDir, '.Trash');

	await mkdir(trashDir, { recursive: true });
	await rename(source, join(trashDir, targetId));
}

export function createWatcher(inDir, outDir, options = {}) {
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

			const result = await convertMail(createReadStream(path), outDir);

			if (result.type === 'delete') {
				await trashPost(outDir, result.targetId);
			}

			await moveToProcessed(options.processedDir, path, options.mailbox);

			clearTimeout(rebuildTimer);
			rebuildTimer = setTimeout(() => rebuild(outDir, options), 5000);
		})().catch((err) => console.error(`error processing ${path}: ${err.message}`));
	});

	watcher.on('error', (err) => console.error(`watcher error: ${err.message}`));

	return watcher;
}
