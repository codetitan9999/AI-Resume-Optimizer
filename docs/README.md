# Documentation Hub

This folder contains the working technical documentation set for AI Resume Optimizer.

## Contents

- [Architecture](./ARCHITECTURE.md)
  - System responsibilities, runtime boundaries, extension points, and architectural principles.
- [High-Level Design](./HLD.md)
  - Product scope, container-level view, non-functional goals, and major runtime flows.
- [Low-Level Design](./LLD.md)
  - Module-level implementation details, state flow, validation behavior, and orchestration logic.
- [Diagram Pack](./DIAGRAMS.md)
  - Mermaid diagrams for HLD, LLD, class, ER, deployment, and sequence flows.
- [API Reference](./API.md)
  - Endpoint catalog, request/response contracts, auth expectations, and error behavior.
- [Data Model](./DATA_MODEL.md)
  - Domain types, MongoDB collections, embedded subscription structure, and client-side state model.
- [Deployment Guide](./DEPLOYMENT.md)
  - Local setup, Vercel deployment, MongoDB configuration, AI provider setup, and payment-mode notes.

## Recommended Reading Order

1. Start with [Architecture](./ARCHITECTURE.md)
2. Review [High-Level Design](./HLD.md)
3. Review [Low-Level Design](./LLD.md)
4. Use [Diagram Pack](./DIAGRAMS.md) during walkthroughs and interviews
5. Use [API Reference](./API.md) and [Data Model](./DATA_MODEL.md) during implementation work
6. Use [Deployment Guide](./DEPLOYMENT.md) for setup and operations

## Intended Audience

- Recruiters and reviewers who need a concise understanding of scope and architecture
- Engineers onboarding to the codebase
- Future contributors extending AI, auth, payments, or persistence
- Anyone preparing demos, architecture reviews, or project handoffs
