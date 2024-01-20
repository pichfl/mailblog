import { join, parse } from 'node:path';
import { mkdirp } from 'mkdirp';
import { moveFile } from 'move-file';
import { nanoid } from 'nanoid';
import { Splitter, Headers } from 'mailsplit';
import { stringify as yaml } from 'yaml';
import { writeFile, access } from 'node:fs/promises';
import dayjs from 'dayjs';
import iconv from 'iconv-lite';
import Libmime from 'libmime';

import { config } from './config.mjs';
import { parseImage } from './parsers/image.mjs';
import { parseText } from './parsers/text.mjs';

const libmime = new Libmime.Libmime({ iconv });

function renderImage(img) {
  const { width, height } = img;
  const orientation =
    width === height ? 'square' : width > height ? 'landscape' : 'portrait';

  return `<img src="${config.hostname}${img.src}" width="${width}" height="${height}" data-orientation="${orientation}" alt="" />`;
}

const getTargetFolder = (date) =>
  join(
    date.format('YYYY'),
    date.format('MM'),
    date.format('DD'),
    date.format('HHmmss')
  );

export default async function transformMail(outDir, readableStream) {
  const splitter = new Splitter();
  let messageDate = dayjs('2024-01-14T18:24:00');
  let targetFolder = getTargetFolder(messageDate);

  return new Promise((resolve, reject) => {
    const chunks = [];

    splitter.on('data', (data) => {
      const chunk = chunks.at(-1);

      switch (data.type) {
        case 'node':
          const headers = new Headers(data.getHeaders())
            .getList()
            .reduce((acc, { key, line }) => {
              const { value, params } = libmime.parseHeaderValue(
                libmime.decodeHeader(line).value
              );

              acc[key] = { value, ...params };
              return acc;
            }, new Object(null));

          const contentId = headers['content-id']?.value
            .trim()
            .replace(/^<|>$/g, '')
            .trim();

          let name = headers['content-type'].name;
          let ext = libmime.detectExtension(headers['content-type'].value);

          if (name) {
            name = parse(headers['content-type'].name).name;
          } else {
            name = nanoid();
            ext = ext === 'bin' ? '' : ext;
          }

          chunks.push({
            headers,
            charset: headers['content-type'].charset,
            type: headers['content-type'].value,
            name: `${name}${ext ? `.${ext}` : ''}`,
            contentId,
          });
          break;
        case 'data':
          break;
        case 'body':
          chunk.body = chunk.body ?? [];
          chunk.body.push(data.value);

          break;
      }
    });

    splitter.on('end', async () => {
      let frontmatter = {};
      let results = '';
      const contentIds = [];
      const chunksByContentId = {};
      const imagesByContentId = {};

      for (const chunk of chunks) {
        if (chunk.contentId) {
          contentIds.push(chunk.contentId);
          chunksByContentId[chunk.contentId] = chunk;
        }
      }

      for (const chunk of chunks) {
        const subject = chunk.headers?.['subject']?.value;
        const messageId = chunk.headers['message-id']?.value;

        if (messageId) {
          frontmatter.id = messageId.trim().replace(/^<|>$/g, '').trim();
        }

        if (chunk.headers.date?.value) {
          messageDate = dayjs(chunk.headers.date.value);
          targetFolder = getTargetFolder(messageDate);

          frontmatter.date = messageDate.toISOString();
        }

        if (subject) {
          if (subject.startsWith('DELETE:')) {
            const deleteTarget = subject.replace(/^DELETE:\s*/g, '').trim();
            const folderToDelete = join(...deleteTarget.split('/'));

            try {
              if (await access(join(outDir, folderToDelete))) {
                await moveFile(
                  join(outDir, folderToDelete),
                  join(outDir, 'trash', folderToDelete)
                );
              }
            } catch {
              // Ignore
            }

            resolve(null);
            return;
          }

          frontmatter.title = subject;

          if (!chunk.body) {
            continue;
          }
        }

        if (!chunk.body || chunk.body.length === 0) {
          continue;
        }

        await mkdirp(join(outDir, targetFolder));

        if (chunk.type.startsWith('image')) {
          chunk.name = chunk.name.replace('jpeg', 'jpg');

          const img = await parseImage(chunk, outDir, targetFolder);

          if (!img) {
            continue;
          }

          imagesByContentId[chunk.contentId] = img;

          if (img.inline) {
            continue;
          }

          results += renderImage(img);
        }

        if (
          chunks.some((chunk) => chunk.type === 'text/html') &&
          chunk.type !== 'text/html' &&
          chunk.headers['content-transfer-encoding']?.value ===
            'quoted-printable'
        ) {
          continue;
        }

        if (chunk.type.startsWith('text')) {
          results += await parseText(chunk, frontmatter);
        }
      }

      // Patch image tags
      for (const contentId of contentIds) {
        const chunkByContentId = chunksByContentId[contentId];

        if (chunkByContentId) {
          const img = imagesByContentId[contentId];
          results = results.replaceAll(
            new RegExp(`IMG:cid:${contentId}`, 'g'),
            renderImage(img)
          );
        }
      }

      results = `---\n${yaml(frontmatter)}---\n\n${results}`;

      await mkdirp(join(outDir, targetFolder));
      await writeFile(join(outDir, targetFolder, 'post.md'), results, {
        encoding: 'utf-8',
      });

      resolve(targetFolder);
    });

    readableStream.pipe(splitter);
  });
}
