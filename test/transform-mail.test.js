import test from 'ava';

import transformMail from '../src/transform-mail.mjs';

test('transformMail', async (t) => {
	const result = await transformMail('./out', null);

	t.is(result, 'transformMail');
});
