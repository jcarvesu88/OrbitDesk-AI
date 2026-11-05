import { createServer } from 'node:http';
import { createRequestHandler } from './app.js';

const handler = createRequestHandler();

export default handler;

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 8787);

  createServer(handler).listen(port, () => {
    console.log(`OrbitDesk API listening on http://localhost:${port}`);
  });
}