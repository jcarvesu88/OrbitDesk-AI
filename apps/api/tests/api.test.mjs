import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createServer } from 'node:http';
import { createRequestHandler } from '../dist/app.js';

let server;
let baseUrl;

before(async () => {
  server = createServer(createRequestHandler());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

async function json(path, options) {
  const response = await fetch(`${baseUrl}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  return { response, body: await response.json() };
}

describe('OrbitDesk API', () => {
  it('reports prototype health', async () => {
    const { response, body } = await json('/health');
    assert.equal(response.status, 200);
    assert.equal(body.mode, 'synthetic-prototype');
  });

  it('returns a dashboard and ticket list', async () => {
    const [dashboard, tickets] = await Promise.all([json('/api/dashboard'), json('/api/tickets')]);
    assert.equal(dashboard.body.total, tickets.body.length);
    assert.match(tickets.body[0].id, /^INC\d+$/);

  });

  it('updates an editable ticket', async () => {
    const current = (await json('/api/tickets/INC1042')).body;
    const update = {
      shortDescription: current.shortDescription,
      description: `${current.description} Verified in API test.`,
      status: 'Pending', priority: current.priority, category: current.category,
      assignmentGroup: current.assignmentGroup, assignee: current.assignee
    };
    const { response, body } = await json('/api/tickets/INC1042', { method: 'PUT', body: JSON.stringify(update) });
    assert.equal(response.status, 200);
    assert.equal(body.status, 'Pending');
    assert.match(body.description, /Verified in API test/);
  });

  it('rejects invalid updates', async () => {
    const { response } = await json('/api/tickets/INC1042', { method: 'PUT', body: JSON.stringify({ status: 'Unknown' }) });
    assert.equal(response.status, 400);
  });

  it('returns grounded mock guidance', async () => {
    const { response, body } = await json('/api/ai/ask', { method: 'POST', body: JSON.stringify({ question: 'How do I fix VPN after sleep?', ticketId: 'INC1042' }) });
    assert.equal(response.status, 200);
    assert.equal(body.citations[0].id, 'KB-2001');
  });
});

