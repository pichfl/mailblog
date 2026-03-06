#!/usr/bin/env node
import { program } from 'commander';
import * as dotenv from 'dotenv';

import { collectPosts } from './collect.js';
import { generateApi } from './generate.js';

dotenv.config({ quiet: true });

program
	.argument('[dir]', 'dist directory', './dist')
	.option('-a, --adapter <name>', 'API adapter', 'strapi5')
	.action(async (dir, { adapter }) => {
		const posts = await collectPosts(dir);
		await generateApi(posts, dir, adapter);
		console.log(`Generated ${posts.length} posts → ${dir}`);
	});

program.parse();
