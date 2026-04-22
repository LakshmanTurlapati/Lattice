# Project Research Summary

**Project:** Lattice
**Domain:** TypeScript-first capability runtime SDK for multimodal AI applications
**Researched:** 2026-04-22
**Confidence:** HIGH

## Executive Summary

Lattice should be built as a small TypeScript SDK that sits above provider SDKs, gateways, MCP tools, media transforms, and session stores. The core product is not another chat/provider wrapper. It is a capability runtime: developers provide a task, artifacts, desired outputs, and policy; Lattice builds context, selects a route, packages artifacts, executes, validates, records an inspectable plan, and supports replay.

The recommended approach is to lock the invariant runtime model before building broad integrations. Start with a tiny public API, provider-neutral `Artifact` records, typed output contracts, a versioned capability matrix, deterministic routing, execution plans, and fake-provider test fixtures. Then add narrow real provider support through OpenAI, AI SDK, and OpenAI-compatible adapters, including LiteLLM as an optional gateway target rather than a required dependency.

The main risks are all boundary failures: artifacts collapsing into provider payloads, "file support" hiding transport and retention differences, shallow routing metadata, fallbacks that silently change semantics, context compaction that loses decisions, and replay/trace logs leaking sensitive multimodal content. The mitigation is to make artifacts, transforms, context packs, route decisions, fallback attempts, usage, warnings, and redaction decisions explicit fields in the plan from day one.

## Key Findings

### Recommended Stack

Build an ESM-first TypeScript 6 SDK targeting Node `>=24`, with strict type settings, pnpm workspaces, Changesets, tsdown builds, Vitest tests, and package-shape verification through `publint` and `@arethetypeswrong/cli`. Keep the public install small and modular: one umbrella `lattice` package for v0.1, with internal or subpath modules for providers, MCP, storage, media, testing, and optional UI bindings.

Provider breadth should come from adapters over existing surfaces, not from custom SDK sprawl. Use the Vercel AI SDK provider contracts internally where useful, the OpenAI JS SDK for OpenAI-specific Responses/files/audio/realtime edge cases, and a direct OpenAI-compatible adapter for LiteLLM, OpenRouter, local gateways, and raw request/response journaling. Use Zod 4 and Standard Schema at public boundaries, AJV internally for emitted JSON Schema validation, MCP's official TypeScript SDK for tool/resource integration, OpenTelemetry for spans, and optional Node packages for media/storage.

**Core technologies:**
- Node.js `>=24` - modern runtime target with stable Web APIs, native `fetch`, streams, `Blob`, `File`, and ESM maturity.
- TypeScript 6 - source language and public type contract; run strict settings and watch TS 7 preview compatibility later.
- pnpm workspaces + Changesets - monorepo dependency control, versioning, changelogs, and publish discipline.
- tsdown + `tsc --noEmit` - library builds and source type correctness.
- Zod 4 + Standard Schema + AJV - ergonomic public schemas, schema-library neutrality, and provider-compatible validation.
- AI SDK + OpenAI SDK + OpenAI-compatible HTTP - narrow adapter substrate for provider breadth without leaking provider APIs.
- Official MCP TypeScript SDK - MCP client bridge first, optional MCP server/export path later.
- OpenTelemetry + structured run events - tracing substrate without tying the core to a proprietary observability vendor.
- Vitest + fast-check + MSW/fake providers - deterministic unit, property, adapter, and replay tests.

### Expected Features

**Must have (table stakes):**
- Tiny TypeScript API centered on `createAI`, `artifact`, `run`, `session`, `branch`, `replay`, and returned execution plans.
- Provider abstraction behind Lattice-owned adapter contracts.
- Versioned capability matrix with modalities, file transports, structured output, tools, streaming, context, pricing, latency, and data policy.
- First-class artifact inputs for text, JSON, image, audio, PDF/file, URL, and tool results.
- Context management with live context, compressed summaries, archive references, token estimates, and omitted-item reasons.
- Provider packaging for URL, base64, upload ID, provider file ID, extracted/chunked text, transcript, and resized/transcoded derivatives.
- Text and structured JSON outputs with schema validation and typed result inference.
- Typed local tools and minimal MCP compatibility, with tool results represented as artifacts.
- Deterministic routing, explicit fallbacks, retries/timeouts, cost/token/latency metadata, and typed errors.
- Inspectable plan, dry-run/preflight planning, replay, branching, and a work-inbox showcase.

**Should have (competitive differentiators):**
- Capability-first `run({ task, artifacts, outputs, policy })` as the central product surface.
- Artifact-native runtime with IDs, lineage, transforms, privacy labels, hashes, and generated output artifacts.
- Context-native execution that explains what was included, compressed, archived, or omitted.
- Artifact transport planner that chooses provider-ready representations without exposing provider-specific file pain.
- Deterministic policy router with visible candidate filtering, score breakdowns, and no-route behavior.
- Plan-first observability and replayable AI runs, including exact-context replay and mocked-provider replay.
- Privacy-aware artifact policy: local-only, no-upload, no-logging, provider allow/deny, retention class, and route denial.
- Capability-aware preflight plans before provider execution.

**Defer beyond v0.1/v1:**
- Hosted control plane, billing, dashboards, and team infrastructure.
- Visual graph/DAG DSL and multi-agent handoff framework.
- Broad native provider catalog before a conformance harness is stable.
- Frontend hook/component library as a product center.
- Full realtime voice stack, code interpreter/computer-use runtime, full RAG/vector database platform, and prompt playground/eval platform.
- Proprietary plugin ecosystem; use MCP compatibility instead.

### Architecture Approach

Use one published umbrella package for v0.1 with modular internals and subpath exports for advanced extension points. The public API should expose intent and results; the internals should produce stable records for artifacts, context packs, route decisions, stages, events, storage, tracing, and replay. The execution plan is a runtime artifact, not a user-authored graph DSL.

**Major components:**
1. Public runtime - `createAI`, `run`, `plan`, `replay`, and `branch` facades.
2. Domain types - immutable records for `RunIntent`, `ArtifactRef`, `OutputSpec`, `Policy`, `ExecutionPlan`, `StagePlan`, and result types.
3. Artifact registry - canonical manifests, hashes, media metadata, raw storage, transforms, lineage, and generated artifacts.
4. Context engine - live/summary/archive planes, token budgets, packed model-visible context, and omission explanations.
5. Router - deterministic hard filters, policy scoring, fallback chain, and rejected-candidate reasons.
6. Planner - intent-to-stage plan creation, dry runs, required transforms, budgets, and provider route selection.
7. Executor - stage lifecycle, provider attempts, retries, fallback activation, output normalization, and validation.
8. Provider adapters - provider-specific packaging/execution behind a narrow Lattice contract.
9. Storage/sessions - memory and file stores first, optional SQLite after core stabilizes, copy-on-write branches.
10. Tracing/replay/testing - redacted run events, OpenTelemetry bridge, cassettes, fake providers, and golden-plan helpers.

### Critical Pitfalls

1. **Collapsing artifacts into provider payloads** - keep artifacts provider-neutral and immutable; treat provider payloads/upload IDs as derived packaging metadata with lineage.
2. **Treating file transports as interchangeable** - build a transport planner that accounts for URL/base64/upload/chunking, endpoint support, privacy, TTL, retention, cleanup, MIME, size, and page limits.
3. **Building a shallow capability matrix** - model directionality and detail: input/output modalities, file transport, visual PDF mode, structured output, tools, streaming, context, cost, latency, and data policy.
4. **Letting fallbacks change semantics silently** - require fallback envelopes for privacy, capability deltas, cost, latency, quality, and content-policy behavior; record every attempt.
5. **Naive context compression and state mixing** - separate session, run, context pack, provider attempt, artifact store, and plan; summaries need provenance and raw artifact rehydration.
6. **Designing replay as "run the prompt again"** - persist plan, catalog version, artifacts, transforms, context pack, provider payload metadata, attempts, warnings, errors, usage, and cassettes.
7. **Underestimating multimodal cost and visual loss** - estimate by packaging strategy, reconcile actual usage, and warn when lossy transforms drop charts, screenshots, layout, tables, or embedded images.
8. **Logging sensitive artifacts** - redacted-by-default traces and replay envelopes; raw payload capture must be explicit dev-mode behavior with tests for secrets, signed URLs, base64 blobs, and transcripts.

## Implications for Roadmap

Based on the combined research, the roadmap should prove the runtime spine before the showcase and before provider breadth.

### Phase 1: Runtime Contracts

**Rationale:** Every other subsystem depends on stable records. If artifacts, outputs, policy, capabilities, and plans are weak here, provider work will bake in the wrong abstractions.

**Delivers:** Tiny public API skeleton; `RunIntent`; `ArtifactManifest`; `OutputSpec`; `PolicySpec`; `ExecutionPlan`; `StagePlan`; `LatticeResult`; Zod/Standard Schema validation; package/build/test scaffolding.

**Addresses:** Tiny API, artifact-native model, typed outputs, capability-first run contract, inspectable plan, progressive overrides.

**Avoids:** Artifacts collapsing into provider payloads, shallow capability matrix, plain-text-only outputs, inspectability afterthought, ad hoc provider options.

### Phase 2: Artifact Lifecycle And Storage

**Rationale:** Multimodal runtime value depends on canonical artifacts before context, packaging, routing, replay, or showcases can be trusted.

**Delivers:** Artifact builders for text/JSON/file/image/audio/PDF/tool result; content hashes; MIME detection; parent/derived lineage; privacy labels; memory store; file store; generated artifact support.

**Addresses:** Multimodal inputs, output artifacts, artifact reuse, privacy labels, local examples, future replay.

**Avoids:** Provider upload IDs as source of truth, invisible transforms, untracked inline bytes, weak provenance.

### Phase 3: Deterministic Catalog, Router, And Planner

**Rationale:** Route selection must be dry-runnable and explainable before real provider complexity. A frozen catalog plus fake providers makes plan behavior testable.

**Delivers:** Versioned model catalog schema; hard filters; deterministic scoring; rejected-candidate reason codes; fallback candidate graph; `ai.plan()`; golden route and no-route tests.

**Addresses:** Capability matrix, deterministic routing, preflight, budget/latency/privacy policy, fallback foundations.

**Avoids:** Opaque AI routing, boolean "vision/files" metadata, semantic fallback drift, impossible tasks being downgraded silently.

### Phase 4: Execution Spine, Events, And Fake Providers

**Rationale:** The executor and event model are the backbone for streaming, tracing, replay, failure diagnostics, and UI bindings later.

**Delivers:** Stage runner; fake provider adapter; run store; typed events; retries/timeouts; cancellation shape; schema validation; output normalization; plan snapshots for success/failure/fallback.

**Addresses:** Streaming lifecycle events, typed errors, structured outputs, plan-first observability, provider-independent tests.

**Avoids:** Text-delta-only streaming, final-output-only tests, logs instead of structured plan warnings, replay gaps.

### Phase 5: Context And Sessions

**Rationale:** Context decisions depend on artifacts and stages, but provider packaging and replay depend on context packs being explicit and inspectable.

**Delivers:** Session snapshots; live/summary/archive planes; context packer; token budget estimates; summary artifacts with provenance; branch semantics; trust labels; retention/pinning rules.

**Addresses:** Sessions, branching, context archive model, context-native execution, policy/trust separation.

**Avoids:** Dropping turns instead of preserving decisions, mutable conversation grab bag, parent-session mutation during replay/branching, prompt injection through untrusted artifacts.

### Phase 6: Provider Packaging And Narrow Real Adapters

**Rationale:** Real providers should enter after contracts, routing, execution, artifacts, and context are testable. This phase proves transport and multimodal packaging without turning provider count into the product.

**Delivers:** Provider adapter contract; OpenAI adapter; AI SDK adapter; OpenAI-compatible/LiteLLM adapter; file transport planner; upload/cache metadata; adapter conformance tests; packaging warnings; cost estimate metadata.

**Addresses:** Provider abstraction, provider packaging, file/PDF/image/audio transport, usage metadata, narrow provider set for v0.1.

**Avoids:** Native adapter sprawl, file support being treated as binary, private files becoming public URLs, invisible lossy transforms, unbounded upload retries.

### Phase 7: Replay, Redaction, And Observability

**Rationale:** Lattice's promise depends on explaining and reproducing AI runs without leaking sensitive artifacts. This needs full artifacts, plans, context packs, provider attempts, and events in place.

**Delivers:** Replay envelope; provider cassettes; deterministic offline replay; live rerun comparison mode; redacted trace/replay defaults; OpenTelemetry bridge; usage reconciliation; fixture format.

**Addresses:** Replay, plan-first observability, cost/usage reconciliation, security and privacy defaults, CI fixtures.

**Avoids:** Replay as prompt rerun, telemetry leaks, stale URL dependence, unredacted provider bodies, hidden estimate errors.

### Phase 8: Work Inbox Showcase

**Rationale:** The showcase should validate the real product thesis, not bypass runtime abstractions. It belongs after the runtime can handle adversarial artifacts, route decisions, context packing, and replay.

**Delivers:** Executable multimodal work-inbox example using the public API; fixtures for text, screenshot/photo, audio/call recording, PDF, JSON action output, and optional speech stub; UAT proving plan inspection and replay.

**Addresses:** First compelling use case, integration testing, developer onboarding, runtime validation.

**Avoids:** Happy-path demo only, showcase-only shortcuts, weak visual/PDF/audio coverage, provider-specific demo code.

### Phase Ordering Rationale

- Contracts come first because provider adapters, context, storage, replay, and tests need stable domain records.
- Artifacts precede context and packaging because every context, transform, output, policy, and replay decision references artifact IDs and lineage.
- Router/planner precede executor so `ai.plan()` is trusted and deterministic before side effects occur.
- Executor/events precede sessions/replay so state changes are observable and persistable.
- Context/sessions precede real provider packaging because provider payloads should be assembled from explicit context packs, not from ad hoc message histories.
- Real providers come after fake-provider conformance so adapter behavior is held to Lattice invariants.
- Replay/redaction comes before the showcase so the demo can prove debuggability without leaking sensitive multimodal payloads.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5: Context And Sessions** - summarization, provenance, prompt-injection handling, and trust labels need careful implementation research and fixture design.
- **Phase 6: Provider Packaging And Narrow Real Adapters** - provider file transport, retention/deletion, visual PDF behavior, audio transcription, spreadsheet/document extraction, and provider-specific option scopes change quickly.
- **Phase 7: Replay, Redaction, And Observability** - redaction defaults, cassette shape, trace payload boundaries, and provider usage reconciliation need security-focused review.
- **Phase 8: Work Inbox Showcase** - optional speech and audio/video paths need provider-by-provider validation before being promised beyond a narrow path.

Phases with standard patterns where phase research can be lighter:
- **Phase 1: Runtime Contracts** - standard TypeScript library, schema, package export, and validation patterns are well documented.
- **Phase 2: Artifact Lifecycle And Storage** - content-addressed manifests, MIME detection, memory/file stores, and lineage records are straightforward if kept provider-neutral.
- **Phase 3: Deterministic Catalog, Router, And Planner** - deterministic filtering/scoring and golden-plan tests are local algorithm work once the schema is defined.
- **Phase 4: Execution Spine, Events, And Fake Providers** - standard async execution, event streaming, fake adapters, and validation tests can follow normal SDK patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Node 24, TypeScript 6, pnpm, Zod 4, Vitest, OpenTelemetry, OpenAI SDK, AI SDK, and MCP direction are backed by official docs and current package checks. Adapter package boundaries are MEDIUM because AI SDK and MCP package surfaces are still evolving. |
| Features | MEDIUM-HIGH | Table stakes are strongly supported by adjacent SDKs/gateways. Differentiation is an inference from ecosystem gaps plus the project thesis and should be validated through v0.1 work-inbox usage. |
| Architecture | HIGH | Component boundaries map directly to project requirements and known SDK/runtime patterns. Provider substrate choice remains MEDIUM until real multimodal packaging proves it. |
| Pitfalls | HIGH | Most risks come from official provider/runtime docs and repeated ecosystem patterns around files, context, fallback, replay, and telemetry. Roadmap prioritization is partly inferred. |

**Overall confidence:** HIGH

### Gaps to Address

- **Provider retention and deletion semantics:** Research per provider in Phase 6 before claiming upload cleanup guarantees.
- **MCP tool/resource security:** Do separate research before implementing anything beyond basic MCP tool/resource import and explicit policy checks.
- **Audio/video and optional speech:** Validate provider support, cost, latency, streaming semantics, and storage implications before committing to showcase speech beyond a stub or narrow adapter path.
- **Exact provider substrate:** Validate whether AI SDK, OpenAI SDK, or direct HTTP gives better control for raw envelopes, files, usage, retries, and replay before stabilizing adapter internals.
- **Context compaction quality:** Use adversarial fixtures and oracle comparisons to decide how much automatic summarization is safe in v0.1.
- **Fixture privacy policy:** Define which replay artifacts can be committed, which must be redacted, and which require local-only encrypted storage.

## Sources

### Project And Local Research

- `.planning/PROJECT.md` - product definition, active requirements, constraints, and initial out-of-scope boundaries.
- `.planning/research/STACK.md` - stack recommendations, current package versions, provider/MCP/schema/testing/storage/observability choices.
- `.planning/research/FEATURES.md` - table stakes, differentiators, anti-features, dependency ordering, MVP recommendation.
- `.planning/research/ARCHITECTURE.md` - API shape, component boundaries, data flow, build order, testability strategy.
- `.planning/research/PITFALLS.md` - critical pitfalls, phase warnings, guardrails, and follow-up research gaps.

### Primary External Sources

- TypeScript 6 announcement: https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/
- Node.js release status: https://nodejs.org/en/about/previous-releases
- Vercel AI SDK docs: https://ai-sdk.dev/docs/introduction
- Vercel AI SDK provider management: https://ai-sdk.dev/docs/ai-sdk-core/provider-management
- Vercel AI SDK structured outputs: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- OpenAI JavaScript/TypeScript SDK: https://github.com/openai/openai-node
- OpenAI file inputs: https://developers.openai.com/api/docs/guides/file-inputs
- OpenAI Agents SDK TypeScript docs: https://openai.github.io/openai-agents-js/
- LiteLLM routing docs: https://docs.litellm.ai/docs/routing
- LiteLLM reliability/fallback docs: https://docs.litellm.ai/docs/proxy/reliability
- MCP TypeScript SDK docs: https://ts.sdk.modelcontextprotocol.io/
- MCP SDK overview: https://modelcontextprotocol.io/docs/sdk
- Zod docs: https://zod.dev/
- Standard Schema spec: https://standardschema.dev/schema
- OpenTelemetry JavaScript instrumentation: https://opentelemetry.io/docs/languages/js/instrumentation/
- Vitest docs: https://v4.vitest.dev/
- fast-check docs: https://fast-check.dev/

### Secondary Sources And Ecosystem Signals

- TanStack AI docs: https://tanstack.com/ai/latest
- LangChain context engineering: https://docs.langchain.com/oss/javascript/langchain/context-engineering
- LangGraph durable execution and persistence docs: https://docs.langchain.com/oss/javascript/langgraph/durable-execution
- Anthropic PDF support: https://platform.claude.com/docs/en/build-with-claude/pdf-support
- Google Gemini API file limit update: https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-new-file-limits/

---
*Research completed: 2026-04-22*
*Ready for roadmap: yes*
