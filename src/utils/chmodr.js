import chmodr_ from 'chmodr';
import { promisify } from 'node:util';

const chmodr = promisify(chmodr_);

export default chmodr;
