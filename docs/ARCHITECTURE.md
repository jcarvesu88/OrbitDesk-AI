# Architecture

OrbitDesk AI is an npm-workspaces monorepo.

## Runtime flow

1. Web and mobile clients request typed resources from the dependency-light Node.js HTTP API.
2. The API owns a process-local `TicketRepository`, seeded from shared synthetic data.
3. Ticket updates pass strict allow-list, type, length, and enum validation before complete records are returned.
4. Knowledge search runs locally using deterministic token overlap, phrase bonuses, and tag/title weighting.
5. The mock assistant retrieves relevant knowledge and composes a templated response with article citations. It does not contact an external model.

## Design choices

- Native anchor navigation is retained for ticket IDs, so browser behaviors such as Ctrl/Cmd+Click, middle-click, copying links, and opening in new tabs work normally.
- Theme tokens are CSS custom properties on web. The selected mode is persisted in `localStorage` and applied before content paint where possible.
- Mobile uses the same API contract and shared TypeScript types. Its theme toggle is runtime-local by design, keeping the Expo starter dependency-light.
- The repository deliberately uses in-memory persistence to make reset behavior obvious and avoid implying production readiness.

## Production hardening path

Add authentication/authorization, durable storage, audit trails, rate limiting, encryption and secret management, observability, pagination, concurrency controls, accessibility testing, and a real AI safety/evaluation layer before any production use.
