import got from 'got';

import transformMail from './src/transform-mail.mjs';
import writeContent from './src/write-content.js';
import writeIndex from './src/write-index.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 -o [output directory]')
  .option('out', {
    alias: 'o',
    type: 'string',
    description: 'Output directory',
    default: './out',
  })
  .option('index', {
    alias: 'i',
    type: 'boolean',
    description: 'Write index.json',
    default: true,
  })
  .option('content', {
    alias: 'c',
    type: 'boolean',
    description: 'Write content.json',
    default: true,
  })
  .option('read', {
    alias: 'r',
    type: 'boolean',
    description: 'Write post.md',
    default: true,
  })
  .option('ping', {
    alias: 'p',
    type: 'string',
    description: 'Ping endpoint',
    default: '',
  })
  .alias('h', 'help')
  .alias('v', 'version')
  .demandOption(['out'])
  .parse();

if (argv.help) {
  yargs.showHelp();
  process.exit(0);
}

if (argv.read) {
  await transformMail(argv.out, process.stdin);
}

if (argv.content) {
  await writeContent(argv.out);
}

if (argv.index) {
  await writeIndex(argv.out);
}

if (argv.ping) {
  await got(argv.ping, {
    method: 'POST',
  });
}
