import { glob } from 'glob';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default async function writeIndex(outDir) {
  const matches = await glob('**/*.md', { cwd: outDir });

  await writeFile(
    join(outDir, `index.json`),
    JSON.stringify(
      {
        posts: matches,
        lastUpdated: new Date().toISOString(),
      },
      null,
      4
    ),
    {
      encoding: 'utf-8',
    }
  );
}
