import { createHmac } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { verifyEmail } from '@posteingang/dog/src/validate.js';
import test from 'ava';

const SALT = 'test-salt';
const FROM = 'sender@example.com';
const HASH = createHmac('sha256', SALT).update(FROM).digest('hex').slice(0, 8);

function eml(from, to) {
	return `From: ${from}\r\nTo: ${to}\r\nSubject: Test\r\n\r\nBody`;
}

const fixtures = {
	valid: join(tmpdir(), 'dog-verify-valid.eml'),
	wrongHash: join(tmpdir(), 'dog-verify-wrong.eml'),
	noTag: join(tmpdir(), 'dog-verify-notag.eml'),
	bareAddress: join(tmpdir(), 'dog-verify-bare.eml'),
};

test.before(async () => {
	await writeFile(fixtures.valid, eml(`Sender <${FROM}>`, `inbox+${HASH}@example.com`));
	await writeFile(fixtures.wrongHash, eml(`Sender <${FROM}>`, 'inbox+deadbeef@example.com'));
	await writeFile(fixtures.noTag, eml(`Sender <${FROM}>`, 'inbox@example.com'));
	await writeFile(fixtures.bareAddress, eml(FROM, `inbox+${HASH}@example.com`));
});

test.after(async () => {
	await Promise.all(Object.values(fixtures).map((f) => rm(f, { force: true })));
});

test('accepts email with correct hash', async (t) => {
	t.true(await verifyEmail(fixtures.valid, SALT));
});

test('rejects email with wrong hash', async (t) => {
	t.false(await verifyEmail(fixtures.wrongHash, SALT));
});

test('rejects email without + tag in recipient', async (t) => {
	t.false(await verifyEmail(fixtures.noTag, SALT));
});

test('handles bare From address (no angle brackets)', async (t) => {
	t.true(await verifyEmail(fixtures.bareAddress, SALT));
});
