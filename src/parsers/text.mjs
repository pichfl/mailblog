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

turndown.addRule('Breaks', {
  filter: ['br', 'div'],
  replacement: (content, node, options) => {
    if (node.tagName === 'DIV') {
      return `\n${content}\n`;
    }

    if (node.parentNode.tagName === 'X-TURNDOWN') {
      if (
        node.previousElementSibling?.tagName === 'BR' ||
        node.nextElementSibling?.tagName === 'BR'
      ) {
        return '\n\n';
      }

      return '\n';
    }

    if (
      node.parentNode.tagName === 'DIV' &&
      node.parentNode.childNodes.length === 1
    ) {
      return '\n';
    }

    return '\n\n';
  },
});

turndown.addRule('Image', {
  filter: ['img'],
  replacement: (content, node, options) => {
    const children = Array.from(node.parentElement.childNodes);
    const nodeIndex = children.indexOf(node);

    let caption;

    for (let i = nodeIndex + 1; i < children.length; i++) {
      const n = children[i];

      if (n.nodeType === 1 && n.tagName === 'IMG') {
        // any caption found belongs to the next image
        break;
      }

      if (n.nodeType === 3 && n.textContent.trim().startsWith('^ ')) {
        caption = n.textContent.trim().replace(/^\^\s+/, '');

        n.remove();

        break;
      }
    }

    const src = node.getAttribute('src') || '';

    if (caption) {
      const match = caption.match(/\[(.+?)\]/);
      const variant = '';

      if (match) {
        caption = caption.replace(match[0], '').trim();
        variant = ` data-variant="${match[1]}"`;
      }
      return `<figure${variant}>\nIMG:${src}\n<caption>${caption}</caption>\n</figure>`;
    }

    return `IMG:${src}`;
  },
});

export async function parseText(chunk) {
  const body = Buffer.concat(chunk.body);
  const mimeString = body.toString();
  const decodedString = quotedPrintable.decode(mimeString);
  const buffer = Buffer.from(decodedString, 'binary');
  let text = iconv.decode(buffer, 'utf-8');

  if (text.length === 0) {
    return '\n';
  }

  const value = (
    chunk.type === 'text/plain' ? text : turndown.turndown(text)
  ).trim();

  return value;
}
