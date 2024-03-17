import got from 'got';
import { Command } from 'commander';

import convertMail from './src/convert-mail.js';
import writeContent from './src/write/content.js';
import writeIndex from './src/write/index.js';
import { config } from './src/config.js';

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
	.option('-p, --ping <ping>', 'Ping HTTP trigger', '')
	.option('-n, --hostname <host>', 'Hostname prefixed to all assets', '');

program.parse(process.argv);

const options = program.opts();

if (options.hostname) {
	config.hostname = options.hostname;
}

if (options.read) {
	const written = await convertMail(process.stdin, options.out);

	console.log(written);
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
