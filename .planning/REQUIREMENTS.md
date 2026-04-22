# Requirements: Lattice

**Defined:** 2026-04-22
**Core Value:** Developers can run one capability-first task across mixed text, image, audio, video, file, JSON, and tool artifacts while Lattice reliably chooses, packages, routes, and explains the underlying model work.

## v1 Requirements

Requirements for the initial release. Each maps to roadmap phases.

### Runtime API

- [x] **API-01**: Developer can install and import a TypeScript-first `lattice` package with a small public API.
- [ ] **API-02**: Developer can create a runtime with `createAI(config)` using typed provider, storage, policy, and tracing options.
- [ ] **API-03**: Developer can call `ai.run({ task, artifacts, outputs, policy })` without selecting a provider-specific API.
- [ ] **API-04**: Developer can call `ai.plan(...)` to dry-run route, context, packaging, and warning decisions without provider execution.
- [ ] **API-05**: Developer can use advanced overrides for provider/model forcing, custom summarizer, custom transforms, hooks, and routing policy without cluttering the beginner path.

### Artifacts

- [ ] **ART-01**: Developer can create text, JSON, file, image, audio, document/PDF, URL, and tool-result artifacts.
- [ ] **ART-02**: Each artifact has a stable ID, kind, media type, source, size metadata when available, privacy labels, and storage reference.
- [ ] **ART-03**: Lattice records parent/derived artifact lineage for transforms such as extraction, chunking, transcription, resizing, and provider packaging.
- [ ] **ART-04**: Lattice can store artifacts in memory and local filesystem stores for development, testing, and replay fixtures.
- [ ] **ART-05**: Generated outputs, tool results, transcripts, and packaged provider handles are represented as artifacts rather than ad hoc response fields.

### Output Contracts

- [ ] **OUT-01**: Developer can request plain text output.
- [ ] **OUT-02**: Developer can request structured JSON output using Zod or another Standard Schema-compatible validator.
- [ ] **OUT-03**: Lattice validates structured outputs and returns typed success or typed validation failure.
- [ ] **OUT-04**: Lattice can return multiple outputs from one run, including text, typed JSON, citations/artifact references, and generated artifact references.

### Capability Catalog And Routing

- [ ] **ROUT-01**: Lattice has a versioned capability catalog for supported models/providers.
- [ ] **ROUT-02**: Capability metadata includes input modalities, output modalities, file transport modes, context limits, structured output support, tool support, streaming support, pricing hints, latency class, and data policy hints.
- [ ] **ROUT-03**: Lattice applies hard route filters for required modalities, output contracts, context window, provider availability, privacy policy, budget, and latency.
- [ ] **ROUT-04**: Lattice scores remaining route candidates deterministically and records the selected route, rejected candidates, and reason codes.
- [ ] **ROUT-05**: Lattice builds fallback chains that preserve declared policy constraints and records every fallback attempt.
- [ ] **ROUT-06**: Lattice returns a typed no-route plan when requirements cannot be satisfied instead of silently downgrading behavior.

### Planning And Execution

- [ ] **EXEC-01**: Lattice converts each run intent into an execution plan with stages for analysis, transforms, context packing, provider packaging, execution, validation, and persistence.
- [ ] **EXEC-02**: Lattice exposes the execution plan as stable JSON with stages, model choices, context budget, artifacts used, transforms, fallbacks, warnings, cost estimates, latency estimates, and usage metadata.
- [ ] **EXEC-03**: Lattice executes plans through a provider-independent stage runner.
- [ ] **EXEC-04**: Lattice emits typed run events for run start, artifact ingestion, context packing, router candidates, stage lifecycle, provider attempts, fallback activation, result validation, artifact creation, and run completion/failure.
- [ ] **EXEC-05**: Lattice supports retries, timeouts, cancellation, typed errors, and fallback activation without hiding the attempt history.
- [ ] **EXEC-06**: Lattice includes fake provider and fixture utilities so routing, plans, validation, and replay can be tested without live provider calls.

### Context And Sessions

- [ ] **CTX-01**: Developer can create or load a session that persists turns, artifacts, summaries, plan history, and branch points.
- [ ] **CTX-02**: Lattice separates session state, run state, context pack state, provider attempt state, artifact storage, and execution plan state.
- [ ] **CTX-03**: Lattice maintains live context, compressed summary artifacts, and archive references instead of blindly sending full history to every model call.
- [ ] **CTX-04**: Lattice builds context packs sized for selected route constraints and records included, summarized, archived, and omitted items with reasons.
- [ ] **CTX-05**: Summary artifacts keep provenance links to source turns and artifacts.
- [ ] **CTX-06**: Developer can branch a session from a previous run or checkpoint without mutating the parent session.
- [ ] **CTX-07**: Lattice tracks trust labels for developer instructions, user artifacts, tool outputs, and model-generated summaries to reduce prompt-injection risk.

### Provider Packaging

- [ ] **PROV-01**: Lattice defines a narrow provider adapter contract that hides provider SDK details from public API types.
- [ ] **PROV-02**: Lattice includes an OpenAI adapter, an AI SDK adapter, and an OpenAI-compatible HTTP adapter suitable for LiteLLM/OpenRouter/local gateway targets.
- [ ] **PROV-03**: Lattice packages artifacts into provider-ready forms such as message parts, URL, base64, upload ID, file ID, extracted text, chunked document text, transcript, or resized/transcoded media.
- [ ] **PROV-04**: Provider packaging records transport choices, transform lineage, size/page/MIME constraints, upload metadata, retention warnings, and unsupported capability warnings in the plan.
- [ ] **PROV-05**: Lattice prevents packaging choices that violate artifact privacy labels, provider allow/deny policy, no-upload policy, no-public-URL policy, or no-logging policy.
- [ ] **PROV-06**: Provider adapters pass shared conformance tests for packaging, warnings, output normalization, errors, usage metadata, and replay metadata.

### Tools And MCP

- [ ] **TOOL-01**: Developer can define local typed tools with schema-validated inputs and artifact-backed outputs.
- [ ] **TOOL-02**: Tool calls and tool results appear in the execution plan and typed run events.
- [ ] **TOOL-03**: Lattice can import a minimal set of tools/resources from MCP servers through an explicit MCP adapter path.
- [ ] **TOOL-04**: MCP/tool execution is policy-controlled and auditable, with tool results represented as artifacts.

### Replay And Observability

- [ ] **OBS-01**: Lattice can persist a replay envelope containing runtime version, catalog version, plan, artifacts, transforms, context pack metadata, provider attempts, warnings, errors, usage, and output artifact references.
- [ ] **OBS-02**: Developer can replay a run offline using recorded provider responses/fake providers.
- [ ] **OBS-03**: Developer can rerun a saved run live with explicit warnings that provider behavior, model versions, cost, and latency may differ.
- [ ] **OBS-04**: Lattice redacts raw artifact bytes, signed URLs, credentials, transcripts, and provider bodies from plans, traces, and replay files by default.
- [ ] **OBS-05**: Lattice can emit OpenTelemetry-compatible spans or structured events for routing, context packing, transforms, provider calls, validation, fallback, and replay.
- [ ] **OBS-06**: Lattice reconciles estimated token/cost/latency metadata with actual provider usage where available.

### Work Inbox Showcase

- [ ] **DEMO-01**: The repository includes an executable multimodal work-inbox example that uses only the public Lattice API.
- [ ] **DEMO-02**: The showcase accepts a user message, screenshot/photo, audio/call recording or transcript, and PDF/manual/policy document as artifacts.
- [ ] **DEMO-03**: The showcase returns human-readable text plus a structured action object such as refund, replace, escalate, or clarify.
- [ ] **DEMO-04**: The showcase exposes the generated execution plan so a developer can inspect route choice, context packing, artifact transforms, warnings, and cost/latency metadata.
- [ ] **DEMO-05**: The showcase includes adversarial fixtures for dense PDFs, visual evidence, privacy-constrained artifacts, fallback/no-route behavior, and replay.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Production Storage And Operations

- **OPS-01**: Developer can use a durable SQLite storage adapter for local production-like apps.
- **OPS-02**: Developer can use Postgres-backed storage for multi-user applications.
- **OPS-03**: Developer can define tenant/project-scoped policy profiles and budgets.
- **OPS-04**: Developer can export traces to Langfuse, LangSmith, or other AI observability systems.

### Expanded Modalities And Providers

- **MOD-01**: Lattice supports speech output as a first-class generated artifact beyond a narrow showcase stub.
- **MOD-02**: Lattice supports video input/output artifact handling where provider support and costs are well understood.
- **MOD-03**: Lattice supports richer PDF/document visual understanding with page/region citations.
- **MOD-04**: Lattice includes broader native provider adapters after the conformance harness is stable.

### Developer Experience

- **DX-01**: Developer can use thin React or headless UI bindings over run/session events.
- **DX-02**: Developer can run CLI commands for replay inspection, fixture generation, and plan diffing.
- **DX-03**: Developer can run CI regression fixtures comparing route decisions, plans, and output validation behavior.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Hosted control plane | Prove the embeddable runtime SDK before adding auth, tenancy, billing, dashboards, uptime, and compliance. |
| Visual graph/DAG authoring DSL | Lattice should feel smaller than graph frameworks; execution plans are runtime artifacts, not user-authored graphs. |
| Multi-agent handoff framework | Agent orchestration is not the initial differentiator and is already served by adjacent frameworks. |
| Broad native provider catalog | Provider count is not the value; conformance and artifact/context/routing invariants come first. |
| Full RAG/vector database platform | Retrieval stacks can feed artifacts into Lattice, but Lattice should not become a database product in v1. |
| Full realtime voice stack | WebRTC, interruptions, VAD, telephony, and realtime transport are a separate product surface. |
| Built-in code interpreter/computer-use runtime | High security and sandboxing complexity; treat these as external tools/MCP integrations later. |
| Proprietary plugin ecosystem | MCP should be the external tool/context protocol path where practical. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| API-01 | Phase 1 | Complete |
| API-02 | Phase 1 | Pending |
| API-03 | Phase 1 | Pending |
| API-04 | Phase 3 | Pending |
| API-05 | Phase 4 | Pending |
| ART-01 | Phase 2 | Pending |
| ART-02 | Phase 2 | Pending |
| ART-03 | Phase 2 | Pending |
| ART-04 | Phase 2 | Pending |
| ART-05 | Phase 2 | Pending |
| OUT-01 | Phase 1 | Pending |
| OUT-02 | Phase 1 | Pending |
| OUT-03 | Phase 1 | Pending |
| OUT-04 | Phase 1 | Pending |
| ROUT-01 | Phase 3 | Pending |
| ROUT-02 | Phase 3 | Pending |
| ROUT-03 | Phase 3 | Pending |
| ROUT-04 | Phase 3 | Pending |
| ROUT-05 | Phase 3 | Pending |
| ROUT-06 | Phase 3 | Pending |
| EXEC-01 | Phase 3 | Pending |
| EXEC-02 | Phase 3 | Pending |
| EXEC-03 | Phase 3 | Pending |
| EXEC-04 | Phase 3 | Pending |
| EXEC-05 | Phase 3 | Pending |
| EXEC-06 | Phase 3 | Pending |
| CTX-01 | Phase 4 | Pending |
| CTX-02 | Phase 4 | Pending |
| CTX-03 | Phase 4 | Pending |
| CTX-04 | Phase 4 | Pending |
| CTX-05 | Phase 4 | Pending |
| CTX-06 | Phase 4 | Pending |
| CTX-07 | Phase 4 | Pending |
| PROV-01 | Phase 4 | Pending |
| PROV-02 | Phase 4 | Pending |
| PROV-03 | Phase 4 | Pending |
| PROV-04 | Phase 4 | Pending |
| PROV-05 | Phase 4 | Pending |
| PROV-06 | Phase 4 | Pending |
| TOOL-01 | Phase 5 | Pending |
| TOOL-02 | Phase 5 | Pending |
| TOOL-03 | Phase 5 | Pending |
| TOOL-04 | Phase 5 | Pending |
| OBS-01 | Phase 5 | Pending |
| OBS-02 | Phase 5 | Pending |
| OBS-03 | Phase 5 | Pending |
| OBS-04 | Phase 5 | Pending |
| OBS-05 | Phase 5 | Pending |
| OBS-06 | Phase 5 | Pending |
| DEMO-01 | Phase 6 | Pending |
| DEMO-02 | Phase 6 | Pending |
| DEMO-03 | Phase 6 | Pending |
| DEMO-04 | Phase 6 | Pending |
| DEMO-05 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 54 total
- Mapped to phases: 54
- Unmapped: 0
- Duplicate mappings: 0
- Coverage note: Count is based on the 54 concrete v1 requirement IDs present in this file.

---
*Requirements defined: 2026-04-22*
*Last updated: 2026-04-22 after roadmap creation*
