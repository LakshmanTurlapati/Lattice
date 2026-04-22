# Roadmap: Lattice

## Overview

Lattice v1 builds the runtime spine before the showcase: first the public TypeScript contract and output types, then provider-neutral artifacts, then deterministic planning and execution, then sessions/context plus real provider packaging, then replay/tool observability, and finally the multimodal work-inbox example that proves the full workflow through the public API.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Runtime API & Output Contracts** - Developers can compile against the small TypeScript API and typed output contracts.
- [ ] **Phase 2: Artifact Lifecycle & Storage** - Developers can create, persist, reuse, and trace provider-neutral artifacts.
- [ ] **Phase 3: Deterministic Planning & Execution Spine** - Developers can dry-run and execute provider-independent plans with deterministic routing and fake providers.
- [ ] **Phase 4: Context, Sessions & Provider Packaging** - Developers can run session-aware, policy-safe provider attempts through explicit context packs and narrow adapters.
- [ ] **Phase 5: Tools, Replay & Observability** - Developers can audit, replay, redact, instrument, and tool-extend runs.
- [ ] **Phase 6: Work Inbox Showcase** - Developers can run the multimodal work-inbox example and inspect the full Lattice plan.

## Phase Details

### Phase 1: Runtime API & Output Contracts
**Goal**: Developers can use the small TypeScript-first Lattice API to declare runtime config, tasks, policies, and output contracts without touching provider SDK types.
**Depends on**: Nothing (first phase)
**Requirements**: API-01, API-02, API-03, OUT-01, OUT-02, OUT-03, OUT-04
**Success Criteria** (what must be TRUE):
  1. Developer can install and import `lattice`, create a runtime with `createAI(config)`, and get typed provider, storage, policy, and tracing options.
  2. Developer can call `ai.run({ task, artifacts, outputs, policy })` through Lattice-owned types without selecting a provider-specific API.
  3. Developer can request plain text, structured JSON, multiple outputs, citations/artifact references, and generated artifact references.
  4. Developer receives typed structured-output success or typed validation failure from the public API boundary.
**Plans**: 4

### Phase 2: Artifact Lifecycle & Storage
**Goal**: Developers can model every input, output, file, media item, and tool result as a reusable artifact with metadata, privacy labels, storage, and lineage.
**Depends on**: Phase 1
**Requirements**: ART-01, ART-02, ART-03, ART-04, ART-05
**Success Criteria** (what must be TRUE):
  1. Developer can create text, JSON, file, image, audio, document/PDF, URL, and tool-result artifacts.
  2. Each artifact exposes a stable ID, kind, media type, source, available size metadata, privacy labels, and storage reference.
  3. Developer can store and reload artifacts from memory and local filesystem stores for development, testing, and replay fixtures.
  4. Derived and generated artifacts retain parent lineage through extraction, chunking, transcription, resizing, provider packaging, tool results, and model outputs.
**Plans**: 3 plans
Plans:
- [ ] 02-01-PLAN.md — Artifact constructors, metadata, privacy, refs, and lineage descriptors
- [ ] 02-02-PLAN.md — Memory and local filesystem artifact stores with metadata/payload separation
- [ ] 02-03-PLAN.md — Public exports plus runtime/output artifact-ref integration

### Phase 3: Deterministic Planning & Execution Spine
**Goal**: Developers can dry-run and execute provider-independent plans with deterministic routing, observable stages/events, fake providers, and honest no-route or fallback behavior.
**Depends on**: Phase 2
**Requirements**: API-04, ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05, ROUT-06, EXEC-01, EXEC-02, EXEC-03, EXEC-04, EXEC-05, EXEC-06
**Success Criteria** (what must be TRUE):
  1. Developer can call `ai.plan(...)` and inspect selected and rejected route candidates, reason codes, context and packaging warnings, budget/latency/cost estimates, and typed no-route outcomes without provider execution.
  2. Every run intent becomes stable execution plan JSON with stages for analysis, transforms, context packing, provider packaging, execution, validation, and persistence.
  3. Lattice applies hard route filters, deterministic scoring, and policy-preserving fallback chains from a versioned capability catalog.
  4. Developer can execute plans against fake providers through a provider-independent stage runner and test routing, plans, validation, and replay fixtures without live provider calls.
  5. Developer can observe typed run events and typed failures for lifecycle, provider attempts, retries, timeouts, cancellation, fallback activation, validation, artifact creation, and run completion/failure.
**Plans**: TBD

### Phase 4: Context, Sessions & Provider Packaging
**Goal**: Developers can run real provider attempts through explicit sessions, context packs, progressive overrides, and policy-safe artifact packaging.
**Depends on**: Phase 3
**Requirements**: API-05, CTX-01, CTX-02, CTX-03, CTX-04, CTX-05, CTX-06, CTX-07, PROV-01, PROV-02, PROV-03, PROV-04, PROV-05, PROV-06
**Success Criteria** (what must be TRUE):
  1. Developer can create, load, and branch sessions that persist turns, artifacts, summaries, plan history, and branch points without mutating parent sessions.
  2. Lattice separates session state, run state, context pack state, provider attempt state, artifact storage, and execution plan state.
  3. Context packs record included, summarized, archived, and omitted items with reasons, while summary artifacts keep provenance and trust labels for source turns and artifacts.
  4. Developer can apply progressive overrides for provider/model forcing, custom summarizer, custom transforms, hooks, and routing policy without cluttering the beginner path.
  5. OpenAI, AI SDK, and OpenAI-compatible provider adapters package artifacts into provider-ready forms, pass shared conformance expectations, record warnings/usage metadata, and block privacy-policy-violating transport choices.
**Plans**: TBD

### Phase 5: Tools, Replay & Observability
**Goal**: Developers can audit, replay, redact, instrument, and extend runs with local or MCP tools without leaking sensitive artifacts.
**Depends on**: Phase 4
**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, OBS-01, OBS-02, OBS-03, OBS-04, OBS-05, OBS-06
**Success Criteria** (what must be TRUE):
  1. Developer can define schema-validated local tools and explicitly import MCP tools/resources, with tool calls and tool results appearing in execution plans and typed run events.
  2. Tool and MCP execution is policy-controlled and auditable, with tool results represented as artifacts rather than ad hoc response fields.
  3. Developer can persist replay envelopes and replay runs offline using recorded provider responses or fake providers.
  4. Developer can rerun a saved run live with explicit warnings that provider behavior, model versions, cost, and latency may differ.
  5. Plans, traces, and replay files redact raw artifact bytes, signed URLs, credentials, transcripts, and provider bodies by default while emitting OpenTelemetry-compatible spans/events and reconciling estimated usage with actual usage where available.
**Plans**: TBD

### Phase 6: Work Inbox Showcase
**Goal**: Developers can run an executable multimodal work-inbox example through the public API and inspect how Lattice routes, packages, executes, validates, and replays the task.
**Depends on**: Phase 5
**Requirements**: DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05
**Success Criteria** (what must be TRUE):
  1. Developer can run the repository's multimodal work-inbox example using only the public Lattice API.
  2. The showcase accepts a user message, screenshot/photo, audio/call recording or transcript, and PDF/manual/policy document as artifacts.
  3. The showcase returns human-readable text plus a structured action object such as refund, replace, escalate, or clarify.
  4. Developer can inspect the generated execution plan for route choice, context packing, artifact transforms, warnings, and cost/latency metadata.
  5. The showcase includes adversarial fixtures for dense PDFs, visual evidence, privacy-constrained artifacts, fallback/no-route behavior, and replay.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Runtime API & Output Contracts | 4/4 | Complete | 2026-04-22 |
| 2. Artifact Lifecycle & Storage | 0/3 | Not started | - |
| 3. Deterministic Planning & Execution Spine | 0/TBD | Not started | - |
| 4. Context, Sessions & Provider Packaging | 0/TBD | Not started | - |
| 5. Tools, Replay & Observability | 0/TBD | Not started | - |
| 6. Work Inbox Showcase | 0/TBD | Not started | - |

## Requirement Coverage

| Phase | Requirement Count | Requirements |
|-------|-------------------|--------------|
| 1. Runtime API & Output Contracts | 7 | API-01, API-02, API-03, OUT-01, OUT-02, OUT-03, OUT-04 |
| 2. Artifact Lifecycle & Storage | 5 | ART-01, ART-02, ART-03, ART-04, ART-05 |
| 3. Deterministic Planning & Execution Spine | 13 | API-04, ROUT-01, ROUT-02, ROUT-03, ROUT-04, ROUT-05, ROUT-06, EXEC-01, EXEC-02, EXEC-03, EXEC-04, EXEC-05, EXEC-06 |
| 4. Context, Sessions & Provider Packaging | 14 | API-05, CTX-01, CTX-02, CTX-03, CTX-04, CTX-05, CTX-06, CTX-07, PROV-01, PROV-02, PROV-03, PROV-04, PROV-05, PROV-06 |
| 5. Tools, Replay & Observability | 10 | TOOL-01, TOOL-02, TOOL-03, TOOL-04, OBS-01, OBS-02, OBS-03, OBS-04, OBS-05, OBS-06 |
| 6. Work Inbox Showcase | 5 | DEMO-01, DEMO-02, DEMO-03, DEMO-04, DEMO-05 |

Coverage: 54/54 v1 requirements mapped. No orphaned requirements. No duplicated requirement mappings.
