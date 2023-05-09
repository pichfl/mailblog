import { Splitter, Headers } from 'mailsplit';
import Libmime from 'libmime';
import { nanoid } from 'nanoid';
import iconv from 'iconv-lite';
import { writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import { basename, join } from 'node:path';
import { mkdirp } from 'mkdirp';

const libmime = new Libmime.Libmime({ iconv });
const turndown = new TurndownService({
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  fence: '```',
  headingStyle: 'atx',
  hr: '---',
  linkReferenceStyle: 'full',
  linkStyle: 'inlined',
  strongDelimiter: '**',
});

turndown.use(gfm);
turndown.keep(['del', 'ins']);

export default async function transformMail(filePath, outDir = './out') {
  const source = createReadStream(filePath);
  const splitter = new Splitter();
  const filename = basename(filePath);
  const date = new Date(filename.split('.')[0] * 1000);
  const entry = [
    `${date.getUTCHours()}`.padStart(2, '0'),
    `${date.getUTCMinutes()}`.padStart(2, '0'),
    `${date.getUTCSeconds()}`.padStart(2, '0'),
  ].join('');
  const targetFolder = join(
    `${date.getFullYear()}`,
    `${date.getMonth() + 1}`,
    `${date.getDate()}`,
    entry
  );

  await mkdirp(join(outDir, targetFolder));

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
          chunks.push({
            headers,
            charset: headers['content-type'].charset,
            type: headers['content-type'].value,
            name: headers['content-type'].name ?? nanoid(),
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

    splitter.on('end', () => {
      const results = [];
      const contentIds = [];
      const chunksByContentId = {};
      const hasHTML = chunks.some((chunk) => chunk.type === 'text/html');

      for (const chunk of chunks) {
        if (chunk.contentId) {
          contentIds.push(chunk.contentId);
          chunksByContentId[chunk.contentId] = chunk;
        }
      }

      for (const chunk of chunks) {
        if (chunk.headers?.['subject']) {
          results.push({
            type: 'meta',
            title: chunk.headers['subject'].value,
            id: chunk.headers['message-id'].value
              .trim()
              .replace(/^<|>$/g, '')
              .trim(),
            date,
          });

          continue;
        }

        if (!chunk.body || chunk.body.length === 0) {
          continue;
        }

        if (
          hasHTML &&
          chunk.headers['content-transfer-encoding']?.value ===
            'quoted-printable'
        ) {
          continue;
        }

        const body = Buffer.concat(chunk.body);

        if (chunk.type.startsWith('text')) {
          const buffer = Buffer.from(
            iconv.decode(body, chunk.charset).replace(/=\w{2}/g, (match) => {
              return String.fromCharCode(parseInt(match.substring(1), 16));
            }),
            'binary'
          );
          let text = buffer.toString('utf-8').trim();

          if (text.length === 0) {
            continue;
          }

          for (const contentId of contentIds) {
            const chunkByContentId = chunksByContentId[contentId];
            if (chunkByContentId) {
              text = text.replaceAll(
                new RegExp(`cid:${contentId}`, 'g'),
                chunkByContentId.name
              );

              chunkByContentId.inline = true;
            }
          }

          results.push({
            type: 'text',
            value: turndown.turndown(text),
          });

          continue;
        }

        if (chunk.type.startsWith('image')) {
          console.log('image', chunk.name, chunk.type);

          writeFile(
            join(outDir, targetFolder, `${chunk.name}`),
            chunk.body.toString('base64'),
            'base64'
          );

          if (chunk.inline) {
            continue;
          }

          results.push({
            src: `${targetFolder}/${chunk.name}`,
            type: chunk.type,
          });

          continue;
        }
      }

      writeFile(
        join(outDir, targetFolder, `content.json`),
        JSON.stringify(results, null, 2),
        {
          encoding: 'utf-8',
        }
      );

      resolve();
    });

    source.pipe(splitter);
  });
}
