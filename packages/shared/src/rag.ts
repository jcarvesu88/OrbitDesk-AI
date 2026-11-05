import { knowledgeArticles } from './data.js';
import type { KnowledgeArticle } from './types.js';

const stopWords = new Set(['a', 'an', 'and', 'are', 'for', 'from', 'how', 'in', 'is', 'of', 'on', 'the', 'to', 'with']);

export function tokenize(value: string): string[] {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, ' ').split(/\s+/).filter((word) => word.length > 1 && !stopWords.has(word));
}

export function searchKnowledge(query: string, limit = 3, corpus: KnowledgeArticle[] = knowledgeArticles): KnowledgeArticle[] {
  const tokens = [...new Set(tokenize(query))];
  if (!tokens.length) return corpus.slice(0, limit);
  const normalizedQuery = query.trim().toLowerCase();

  return corpus
    .map((article) => {
      const title = article.title.toLowerCase();
      const tags = article.tags.join(' ').toLowerCase();
      const body = `${article.summary} ${article.content}`.toLowerCase();
      let score = title.includes(normalizedQuery) ? 10 : 0;
      for (const token of tokens) {
        if (title.includes(token)) score += 5;
        if (tags.includes(token)) score += 4;
        if (body.includes(token)) score += 1;
      }
      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.article.id.localeCompare(b.article.id))
    .slice(0, limit)
    .map(({ article }) => article);
}
