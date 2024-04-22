import * as cheerio from 'cheerio';

export default function toMarkdown(html) {
	const c = cheerio.load(html);

	const rewrap = (before, after) => (_, el) => {
		const cel = c(el);
		return before + cel.html() + after;
	};

	c('br').replaceWith('\n');

	c('div').each((_, el) => {
		const cel = c(el);
		const inner = cel.prop('innerHTML');
		cel.replaceWith(`\n${inner}`);
	});

	c('img').replaceWith((_, el) => {
		const cel = c(el);
		const src = cel.attr('src');
		const alt = cel.attr('alt');

		if (src.startsWith('cid:')) {
			return `[[${src.slice(4)}]]`;
		}

		return `![${alt}](${src})`;
	});

	c('b').replaceWith(rewrap('**', '**'));
	c('strong').replaceWith(rewrap('**', '**'));
	c('i').replaceWith(rewrap('_', '_'));
	c('em').replaceWith(rewrap('_', '_'));
	c('s').replaceWith(rewrap('~', '~'));
	c('strike').replaceWith(rewrap('~', '~'));
	c('del').replaceWith(rewrap('~', '~'));
	c('code').replaceWith(rewrap('`', '`'));

	c('a').replaceWith((_, el) => {
		const cel = c(el);

		return `[${cel.prop('innerHTML')}](${cel.attr('href')})`;
	});

	let text = c('body').text();

	text = text.replaceAll(/\n{2,}/g, '\n\n');

	return text;
}
