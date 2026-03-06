import { copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createWatcher } from '@posteingang/dog/src/index.js';
import test from 'ava';

// Use a no-image fixture for faster processing in watch tests
const FIXTURE = join(import.meta.dirname, '../fixtures/messages/(No Subject).eml');

async function waitUntil(condition, maxMs = 6000, intervalMs = 100) {
	const deadline = Date.now() + maxMs;
	while (Date.now() < deadline) {
		if (await condition()) return true;
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
	return false;
}

test.serial('picks up .eml files added to watched directory', async (t) => {
	t.timeout(12000);

	const inDir = join(tmpdir(), `dog-watch-in-${Date.now()}`);
	const distDir = join(tmpdir(), `dog-watch-dist-${Date.now()}`);

	await mkdir(inDir, { recursive: true });

	const watcher = createWatcher(inDir, distDir);
	try {
		await new Promise((resolve) => watcher.once('ready', resolve));
		await copyFile(FIXTURE, join(inDir, 'test.eml'));

		const processed = await waitUntil(async () => {
			try {
				const entries = await readdir(distDir);
				return entries.length > 0;
			} catch {
				return false;
			}
		});

		t.true(processed);
	} finally {
		await watcher.close();
		await rm(inDir, { recursive: true, force: true });
		await rm(distDir, { recursive: true, force: true });
	}
});

test.serial('picks up .eml files already present when watcher starts', async (t) => {
	t.timeout(12000);

	const inDir = join(tmpdir(), `dog-watch-existing-in-${Date.now()}`);
	const distDir = join(tmpdir(), `dog-watch-existing-dist-${Date.now()}`);

	await mkdir(inDir, { recursive: true });
	await copyFile(FIXTURE, join(inDir, 'existing.eml'));

	const watcher = createWatcher(inDir, distDir);
	try {
		const processed = await waitUntil(async () => {
			try {
				const entries = await readdir(distDir);
				return entries.length > 0;
			} catch {
				return false;
			}
		});

		t.true(processed);
	} finally {
		await watcher.close();
		await rm(inDir, { recursive: true, force: true });
		await rm(distDir, { recursive: true, force: true });
	}
});
