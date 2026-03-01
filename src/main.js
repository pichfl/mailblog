#!/usr/bin/env node
import { createReadStream } from 'node:fs';

import { Command } from 'commander';

import { config } from './config.js';
import convertMail from './convert-mail.js';

const program = new Command();

program
	.name('mailmd')
	.description('Transform .eml files into markdown and images')
	.version(process.env.npm_package_version);

program
	.argument('[file]', 'Email file to convert (uses stdin if not provided)')
	.option('-o, --out <outDir>', 'Output directory');

program.parse(process.argv);

const options = program.opts();
const args = program.args;
const outDir = options.out ?? config.outDirectory;

try {
	const inputStream = args[0] ? createReadStream(args[0]) : process.stdin;
	const written = await convertMail(inputStream, outDir);
	console.log(written);
} catch (error) {
	console.error(error.message);
	if (error.cause) console.error(error.cause);
	process.exit(1);
}
