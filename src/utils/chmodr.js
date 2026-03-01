import { promisify } from 'node:util';

import chmodr_ from 'chmodr';

const chmodr = promisify(chmodr_);

export default chmodr;
