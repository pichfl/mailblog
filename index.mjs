import { watch } from 'node:fs/promises';
import generate from './src/generate.mjs';
import { config } from './src/config.mjs';

const ac = new AbortController();
const { signal } = ac;

generate(config.inDirectory, config.outDirectory);

(async () => {
  try {
    const watcher = watch(config.inDirectory, { signal });
    for await (const _ of watcher) {
      generate(config.inDirectory, config.outDirectory);
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    throw err;
  }
})();
