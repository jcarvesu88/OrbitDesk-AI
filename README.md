# OrbitDesk AI

A GitHub-ready, full-stack IT service desk prototype built around **safe synthetic data**. It includes a ServiceNow-inspired operations dashboard, durable ticket URLs, editable ticket records, a deterministic mock AI assistant, a local knowledge/RAG pipeline, and matching web/mobile experiences.

> **Prototype safety:** all people, companies, incidents, comments, and knowledge content in this repository are fictional. There are no production credentials, external AI calls, telemetry keys, or real customer records.

## Included

- **Web app:** React + Vite + TypeScript
- **Mobile app:** Expo + React Native + TypeScript
- **API:** dependency-light Node.js HTTP service with validated JSON contracts
- **Shared package:** typed domain model, synthetic seed data, dashboard calculations, lexical RAG, and mock AI
- **Ticket workflow:** unique `/tickets/:id` URLs, native links that support Ctrl/Cmd+Click and opening in a new tab, editable forms, validation, and **Save changes**
- **Navigation:** service-management left rail, collapsible **Favorites**, queues, knowledge, AI assistant, and settings
- **Theme:** working dark/light toggle with web persistence and mobile runtime switching
- **Quality:** TypeScript checks, unit/API tests, production web/API builds, CI, docs, and MIT license

## Quick start

Prerequisites: Node.js 20+ and npm 10+.

```bash
cp .env.example .env
npm install
npm run dev
```

Open:

- Web: http://localhost:5173
- API health: http://localhost:8787/health

The API is an in-memory prototype. Saved changes remain available while the API process runs and reset to synthetic seed data when restarted.

## Mobile

Start the API first, then launch Expo:

```bash
npm run dev:api
npm run dev:mobile
```

For a physical device, set `EXPO_PUBLIC_API_URL` to your computer's LAN address (for example `http://192.168.1.20:8787`). Android Emulator commonly uses `http://10.0.2.2:8787`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start API and web together |
| `npm run dev:mobile` | Start Expo |
| `npm run build` | Build shared package, API, and web |
| `npm run typecheck` | Type-check every workspace |
| `npm test` | Run shared and API tests |
| `npm run verify` | Run build, type checks, and tests |
| `npm run clean` | Remove generated build/test folders |

## Repository layout

```text
apps/
  api/       Node.js API and in-memory ticket repository
  mobile/    Expo mobile application
  web/       React operations console
packages/
  shared/    Types, seed data, RAG, mock AI, and dashboard logic
docs/        Architecture and prototype safety notes
```

## API routes

- `GET /health`
- `GET /api/dashboard`
- `GET /api/tickets`
- `GET /api/tickets/:id`
- `PUT /api/tickets/:id`
- `GET /api/knowledge`
- `GET /api/knowledge/search?q=...`
- `POST /api/ai/ask` with `{ "question": "...", "ticketId": "INC1042" }`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/SAFETY.md](docs/SAFETY.md).

