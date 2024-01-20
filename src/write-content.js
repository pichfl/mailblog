import { glob } from 'glob';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

export default async function writeContent(outDir) {
  const matches = await glob('**/*.md', { cwd: outDir });

  // read all files & extract frontmatter
  const posts = await Promise.all(
    matches.map(async (match) => {
      const file = await readFile(join(outDir, match), {
        encoding: 'utf-8',
      });
      const { content, data } = matter(file);

      return {
        ...data,
        filename: match,
        content,
      };
    })
  );

  await writeFile(
    join(outDir, `content.json`),
    JSON.stringify(
      {
        posts,
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
