import transformMail from './src/transform-mail.mjs';

const result_text = await transformMail(
  './1683636457.21809.kojima.uberspace.de'
);

// const result_html = await transformMail(
//   './1683636180.19098.kojima.uberspace.de'
// );

// const results = result_text
//   .map((chunk) => {
//     if (chunk.type.startsWith('image')) {
//       writeFile(`./out/${chunk.name}`, chunk.body, { encoding: 'base64' });

//       return Buffer.from(`![${chunk.name}](${chunk.name})`, 'utf-8');
//     }

//     return chunk.body;
//   })
//   .filter(Boolean);

// writeFile('./out/result.md', Buffer.concat(results), { encoding: 'utf-8' });
