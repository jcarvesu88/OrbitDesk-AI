import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { answerWithMockAi, getDashboardSummary, searchKnowledge, syntheticTickets, tokenize } from '../dist/index.js';

describe('local RAG and shared domain logic', () => {
  it('normalizes useful tokens', () => {
    assert.deepEqual(tokenize('How do I fix the VPN after sleep?'), ['do', 'fix', 'vpn', 'after', 'sleep']);
  });

  it('ranks the VPN article for a VPN sleep query', () => {
    assert.equal(searchKnowledge('VPN disconnects after sleep')[0]?.id, 'KB-2001');
  });

  it('creates a bounded answer citing bundled knowledge', () => {
    const result = answerWithMockAi('What should I try?', syntheticTickets[0]);
    assert.equal(result.citations[0]?.id, 'KB-2001');
    assert.match(result.disclaimer, /Synthetic-data/);
    assert.match(result.answer, /INC1042/);
  });

  it('calculates a stable dashboard snapshot', () => {
    const summary = getDashboardSummary(syntheticTickets, new Date('2026-10-31T04:29:13Z'));
    assert.deepEqual({ total: summary.total, open: summary.open, resolved: summary.resolved }, { total: 8, open: 6, resolved: 2 });
  });
});

