import iconv from 'iconv-lite';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import quotedPrintable from 'quoted-printable';

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

export async function parseText(chunk, contentIds, chunksByContentId) {
  const results = [];
  const body = Buffer.concat(chunk.body);
  const mimeString = body.toString();
  const decodedString = quotedPrintable.decode(mimeString);
  const buffer = Buffer.from(decodedString, 'binary');
  const text = iconv.decode(buffer, 'utf-8');

  if (text.length === 0) {
    return results;
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

  const value = (
    chunk.type === 'text/plain' ? text : turndown.turndown(text)
  ).trim();

  results.push({
    type: 'text',
    value,
  });

  return results;
}
