#!/usr/bin/env node
import { createHmac } from 'node:crypto';

const [salt, email] = process.argv.slice(2);

if (!salt || !email) {
	console.error('Usage: hash <salt> <email>');
	process.exit(1);
}

console.log(createHmac('sha256', salt).update(email).digest('hex').slice(0, 8));
