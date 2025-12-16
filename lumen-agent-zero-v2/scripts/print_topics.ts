import { TOPIC_NAMES, TOPICS } from '../src/topics.js';

console.log('LUMEN Kernel V0 — Topic Hashes');
for (const [k, v] of Object.entries(TOPIC_NAMES)) {
  // @ts-ignore
  const h = TOPICS[k];
  console.log(`${v} => ${h}`);
}
