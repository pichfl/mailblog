import * as strapi5 from './adapters/strapi5.js';

const adapters = {
	strapi5,
};

export async function generateApi(posts, outputDir, adapter = 'strapi5') {
	if (!(adapter in adapters)) {
		throw new Error(`Error generating API: Unknown adapter "${adapter}"`);
	}

	await adapters[adapter].generate(posts, outputDir);
}
