import transformMail from './transform-mail.mjs';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deleteAsync } from 'del';
import { glob } from 'glob';
import { config } from './config.mjs';

// Read `./in` directory and transform all mails

export default async function (inDir, outDir) {
  const files = await readdir(inDir);

  await Promise.all(
    files.map(async (file) => {
      const result = await transformMail(join(inDir, file), outDir);

      await deleteAsync(join(inDir, file), {
        force: true,
        dryRun: !config.removeFiles,
      });

      return result;
    })
  );

  const matches = await glob('**/*.json', { cwd: outDir });

  writeFile(join(outDir, `index.json`), JSON.stringify(matches), {
    encoding: 'utf-8',
  });
}
