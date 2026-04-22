# Milestones

## v1.0 milestone (Shipped: 2026-04-22)

**Phases completed:** 6 phases, 11 plans, 16 tasks

**Key accomplishments:**

- ESM-first pnpm workspace package named `lattice` with strict TypeScript 6, tsdown build output, Vitest smoke coverage, and package declaration checks
- Provider-neutral runtime config contracts with Phase 1 artifact helpers and tested normalization behavior
- Named output maps with Standard Schema validation and typed RunResult success/failure unions
- createAI runtime facade with named lattice exports, fixture adapter validation, and package declaration inference tests
- Provider-neutral artifact records with synchronous constructors, cheap metadata defaults, payload-free refs, and descriptor-only lineage.
- Development artifact stores with metadata-only refs, payload reloads, SHA-256 fingerprints, and inspectable filesystem fixtures.
- Public artifact lifecycle APIs with payload-free generated artifacts across provider, runtime, output, and package type boundaries.
- Deterministic planning and execution with `ai.plan`, capability catalog routing, budget/privacy filters, fallback execution, no-route results, fake providers, and typed run events.
- Context/session/provider packaging runtime with memory sessions, context packs, progressive overrides, per-attempt provider packaging, OpenAI-compatible usage capture, and narrow adapter factories.
- Tools, replay, and observability with Standard Schema tool validation, MCP-like tool import, runtime tool events, replay envelopes, offline/live replay, and default redaction.
- Executable work-inbox showcase using the public package entrypoint with multimodal fixtures, route/context/packaging inspection, structured action output, and offline replay.

---
