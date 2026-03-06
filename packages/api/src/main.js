#!/usr/bin/env node
import { program } from 'commander';

import { collectPosts } from './collect.js';
import { generateApi } from './generate.js';

program
	.argument('[input]', 'mailmd output directory', './out')
	.option('-o, --output <dir>', 'API output directory', './dist')
	.option('-a, --adapter <name>', 'API adapter', 'strapi5')
	.action(async (input, { output, adapter }) => {
		const posts = await collectPosts(input);
		await generateApi(posts, output, adapter);
		console.log(`Generated ${posts.length} posts → ${output}`);
	});

program.parse();
