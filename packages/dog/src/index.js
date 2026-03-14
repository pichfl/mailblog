#!/usr/bin/env node
import { program } from 'commander';
import * as dotenv from 'dotenv';

import { createWatcher } from './watcher.js';

dotenv.config({ quiet: true });

program
	.argument('[in]', 'inbox directory to watch', process.env.POSTEINGANG_IN ?? './in')
	.argument('[out]', 'output directory', process.env.POSTEINGANG_OUT ?? './out')
	.argument(
		'[processed]',
		'directory for processed emails',
		process.env.POSTEINGANG_PROCESSED ?? './processed'
	)
	.option('-d, --deploy-hook <url>', 'webhook URL to POST to after rebuild')
	.option('-s, --salt <value>', 'HMAC-SHA256 salt to verify sender hash in recipient address')
	.option('-e, --exec <command>', 'command to execute after each rebuild')
	.option('-m, --mailbox', 'rename processed files with Maildir seen flag (:2,S)')
	.action((inDir, outDir, processedDir, { deployHook, salt, exec, mailbox }) => {
		createWatcher(inDir, outDir, {
			deployHook,
			exec,
			mailbox,
			processedDir,
			salt: salt || process.env.POSTEINGANG_SALT,
		});
		console.log(`@posteingang/dog watching ${inDir}`);
	});

program.parse();
