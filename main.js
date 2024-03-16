import got from 'got';
import { Command } from 'commander';

import convertMail from './src/convert-mail.js';
import writeContent from './src/write/content.js';
import writeIndex from './src/write/index.js';

const program = new Command();

program
	.name('mailblog')
	.description('Transform piped .eml files into markdown and images')
	.version(process.env.npm_package_version);

program
	.option('-o, --out <outDir>', 'Output directory')
	.option('-i, --index', 'Write index.json', false)
	.option('-c, --content', 'Write content.json', false)
	.option('-r, --read', 'Read Email and write post.md', false)
	.option('-p, --ping <ping>', 'Ping HTTP trigger', '');

program.parse(process.argv);

const options = program.opts();

if (options.read) {
	await convertMail(process.stdin, options.out);
}

if (options.content) {
	await writeContent(options.out);
}

if (options.index) {
	await writeIndex(options.out);
}

if (options.ping) {
	await got(options.ping, {
		method: 'POST',
	});
}
