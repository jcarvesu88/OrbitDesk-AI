import { createServer } from 'node:http';
import { createRequestHandler } from './app.js';

const port = Number(process.env.PORT ?? 8787);
createServer(createRequestHandler()).listen(port, () => {
  console.log(`OrbitDesk API listening on http://localhost:${port}`);
});
