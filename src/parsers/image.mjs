import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import sizeOf from 'image-size';

export async function parseImage(chunk, outDir, targetFolder) {
  const results = [];
  const fileName = chunk.name.replace('jpeg', 'jpg');

  const size = await new Promise(async (resolve) => {
    if (
      chunk.type === 'image/jpeg' ||
      chunk.type === 'image/jpg' ||
      chunk.type === 'image/png'
    ) {
      sharp(Buffer.from(chunk.body.toString('base64'), 'base64'))
        .rotate()
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(join(outDir, targetFolder, `${fileName}`))
        .then((info) => {
          resolve(info);
        });
    } else {
      await writeFile(
        join(outDir, targetFolder, `${fileName}`),
        chunk.body.toString('base64'),
        'base64'
      );

      resolve(sizeOf(Buffer.from(chunk.body.toString('base64'), 'base64')));
    }
  });

  if (chunk.inline) {
    return results;
  }

  results.push({
    src: `${targetFolder}/${fileName}`,
    type: chunk.type,
    width: size.width,
    height: size.height,
    orientation: size.orientation ?? 0,
  });

  return results;
}
