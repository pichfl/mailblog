import transformMail from './transform-mail.mjs';
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { deleteAsync } from 'del';
import { glob } from 'glob';
import { config } from './config.mjs';
import got from 'got';

// Read `./in` directory and transform all mails

export default async function (inDir, outDir) {
  const files = await readdir(inDir);

  await Promise.all(
    files.map(async (file) => {
      try {
        const result = await transformMail(join(inDir, file), outDir);

        await deleteAsync(join(inDir, file), {
          force: true,
          dryRun: !config.removeFiles,
        });

        return result;
      } catch (error) {
        console.error(error);
      }
    })
  );

  const matches = await glob('**/*.json', { cwd: outDir });

  await writeFile(join(outDir, `index.json`), JSON.stringify(matches), {
    encoding: 'utf-8',
  });

  if (config.deployHook) {
    await got(config.deployHook, {
      method: 'POST',
    });
  }
}
