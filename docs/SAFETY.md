# Prototype safety and data handling

- Every person, organization, email address, ticket, asset, and knowledge article is synthetic.
- The mock assistant is deterministic and entirely local; no prompt or record leaves the API process.
- No production connector, ServiceNow credential, LLM key, analytics key, or customer identifier is included.
- API state is process-local and resets on restart.
- Inputs are allow-list validated, request bodies are capped at 128 KB, and the assistant only cites the bundled knowledge corpus.
- The UI labels the environment as a synthetic prototype.

This project demonstrates interaction patterns and architecture. It is not a compliance claim or production service desk.
