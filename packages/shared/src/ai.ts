import { searchKnowledge } from './rag.js';
import type { AiAnswer, Ticket } from './types.js';

export function answerWithMockAi(question: string, ticket?: Ticket): AiAnswer {
  const context = ticket ? `${question} ${ticket.shortDescription} ${ticket.description} ${ticket.tags.join(' ')}` : question;
  const articles = searchKnowledge(context, 3);
  const intro = ticket
    ? `For ${ticket.id}, the safest next step is to validate the reported symptom before changing the environment.`
    : 'Based on the bundled synthetic knowledge base, start with a low-risk validation of the reported symptom.';
  const evidence = articles.length
    ? articles.map((article, index) => `${index + 1}. ${article.summary} [${article.id}]`).join('\n')
    : 'No close article match was found. Capture sanitized diagnostics and route the request to the appropriate support group.';

  return {
    answer: `${intro}\n\n${evidence}\n\nThis is deterministic prototype guidance; confirm each step against your approved operating procedure.`,
    citations: articles.map(({ id, title, summary }) => ({ id, title, summary })),
    suggestedActions: articles.length
      ? ['Confirm the symptom and scope.', 'Follow the cited article without collecting secrets.', 'Record sanitized results in the ticket and escalate if unresolved.']
      : ['Capture sanitized diagnostics.', 'Confirm ownership and priority.', 'Escalate using the approved support path.'],
    disclaimer: 'Synthetic-data mock AI. No external model or production system was contacted.'
  };
}
