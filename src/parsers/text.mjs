import iconv from 'iconv-lite';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

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
  const buffer = Buffer.from(
    iconv.decode(body, chunk.charset).replace(/=\w{2}/g, (match) => {
      return String.fromCharCode(parseInt(match.substring(1), 16));
    }),
    'binary'
  );
  let text = buffer.toString('utf-8').trim();

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

  results.push({
    type: 'text',
    value: turndown.turndown(text),
  });

  return results;
}
