import { rm } from 'node:fs/promises';

for (const path of ['apps/api/dist', 'apps/web/dist', 'packages/shared/dist', 'coverage']) {
  await rm(path, { recursive: true, force: true });
}
console.log('Removed generated output.');
