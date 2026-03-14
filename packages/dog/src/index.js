#!/usr/bin/env node
import { program } from 'commander';
import * as dotenv from 'dotenv';

import { createWatcher } from './watcher.js';

dotenv.config({ quiet: true });

program
	.argument('[in]', 'inbox directory to watch', process.env.POSTEINGANG_IN ?? './in')
	.argument('[dist]', 'dist directory for output', process.env.POSTEINGANG_OUT ?? './dist')
	.option('-d, --deploy-hook <url>', 'webhook URL to POST to after rebuild')
	.option('-s, --salt <value>', 'HMAC-SHA256 salt to verify sender hash in recipient address')
	.option('-e, --exec <command>', 'command to execute after each rebuild')
	.action((inDir, distDir, { deployHook, salt, exec }) => {
		createWatcher(inDir, distDir, {
			deployHook,
			exec,
			salt: salt || process.env.POSTEINGANG_SALT,
		});
		console.log(`@posteingang/dog watching ${inDir}`);
	});

program.parse();
