import { copyFile, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createWatcher } from '@posteingang/dog/src/watcher.js';
import test from 'ava';

// Use a no-image fixture for faster processing in watch tests
const FIXTURE = join(import.meta.dirname, '../fixtures/messages/(No Subject).eml');
const DELETE_FIXTURE = join(import.meta.dirname, '../fixtures/messages/delete.eml');

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

test.serial('does not regenerate a post that is already in .Trash', async (t) => {
	t.timeout(12000);

	const inDir = join(tmpdir(), `dog-watch-trashed-in-${Date.now()}`);
	const distDir = join(tmpdir(), `dog-watch-trashed-dist-${Date.now()}`);
	const targetId = 'f4c87e63fce15eac';

	await mkdir(inDir, { recursive: true });
	await mkdir(join(distDir, '.Trash', targetId), { recursive: true });
	await writeFile(join(distDir, '.Trash', targetId, 'message.md'), '---\ntitle: trashed\n---\n');
	await copyFile(FIXTURE, join(inDir, 'existing.eml'));

	const watcher = createWatcher(inDir, distDir);
	try {
		// Wait for rebuild to complete (posts.json is written last)
		await waitUntil(async () => {
			try {
				await stat(join(distDir, 'posts.json'));
				return true;
			} catch {
				return false;
			}
		});

		const postDirExists = await stat(join(distDir, targetId)).then(() => true, () => false);
		t.false(postDirExists, 'trashed post was not regenerated');
	} finally {
		await watcher.close();
		await rm(inDir, { recursive: true, force: true });
		await rm(distDir, { recursive: true, force: true });
	}
});

test.serial('DELETE email moves target folder to .Trash', async (t) => {
	t.timeout(12000);

	const inDir = join(tmpdir(), `dog-watch-delete-in-${Date.now()}`);
	const distDir = join(tmpdir(), `dog-watch-delete-dist-${Date.now()}`);
	const targetId = 'f4c87e63fce15eac';
	const targetDir = join(distDir, targetId);

	await mkdir(inDir, { recursive: true });
	await mkdir(targetDir, { recursive: true });
	await writeFile(join(targetDir, 'message.md'), '---\ntitle: test\n---\n');

	const watcher = createWatcher(inDir, distDir);
	try {
		await new Promise((resolve) => watcher.once('ready', resolve));
		await copyFile(DELETE_FIXTURE, join(inDir, 'delete.eml'));

		const trashed = await waitUntil(async () => {
			try {
				await stat(join(distDir, '.Trash', targetId, 'message.md'));
				return true;
			} catch {
				return false;
			}
		});

		t.true(trashed, 'target folder moved to .Trash');

		const originalGone = await stat(targetDir).then(
			() => false,
			() => true
		);

		t.true(originalGone, 'original folder no longer exists');
	} finally {
		await watcher.close();
		await rm(inDir, { recursive: true, force: true });
		await rm(distDir, { recursive: true, force: true });
	}
});
