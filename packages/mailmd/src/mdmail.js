#!/usr/bin/env node
import { stat } from 'node:fs/promises';

import { Command } from 'commander';

import { config } from './config.js';
import convertMd from './convert-md.js';

const program = new Command();

program
	.name('mdmail')
	.description('Convert Markdown to nodemailer message configurations')
	.version(process.env.npm_package_version);

program
	.argument('<folder>', `Folder containing ${config.mdFilename} and assets`)
	.option('-f, --from <email>', 'From email address')
	.option('-t, --to <email>', 'To email address')
	.option('-s, --subject <text>', 'Email subject');

program.parse(process.argv);

const options = program.opts();
const args = program.args;
const folder = args[0];

try {
	if (!folder) {
		throw new Error('Folder argument is required');
	}

	const folderStats = await stat(folder);
	if (!folderStats.isDirectory()) {
		throw new Error(`${folder} is not a directory`);
	}

	const mailConfig = await convertMd(folder, options);
	console.log(JSON.stringify(mailConfig, null, 2));
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
