# Feature Landscape

**Project:** Lattice
**Domain:** TypeScript-first capability runtime SDK for multimodal AI applications
**Researched:** 2026-04-22
**Overall confidence:** MEDIUM-HIGH

## Research Position

The adjacent ecosystem has already normalized provider abstraction, streaming, tool calling, structured outputs, multimodal inputs, routing, fallbacks, tracing, and voice. Vercel AI SDK, TanStack AI, LiteLLM, OpenAI Agents SDK, MCP, and LangChain/LangGraph each cover slices of this surface.

Lattice should not compete by exposing another set of provider-level primitives. Its v0.1 wedge should be a small capability-first runtime where developers describe a task, attach artifacts, request outputs, set policy, and receive both the result and an inspectable execution plan. The differentiator is the product boundary: artifacts, context packing, provider packaging, deterministic routing, fallback, replay, and plan inspection are handled as one runtime concern.

## Recommended Release Scope

### v0.1: Prove the Runtime Thesis

v0.1 should support one compelling multimodal work-inbox flow end to end:

1. Developer creates a runtime with `createAI`.
2. Developer creates a `session`.
3. Developer attaches artifacts: text, image, audio, PDF, JSON, and tool result.
4. Developer calls `run` with a task, desired outputs, and policy constraints.
5. Lattice builds a context pack, chooses a deterministic route, packages artifacts for a provider, executes the task, validates outputs, records the execution plan, and supports `replay`.

This version should prefer depth over breadth: two or three providers, a narrow artifact transform set, strong plans, strong examples, and reliable replay.

### v1: Harden for Production Integrations

v1 should expand capability coverage and operational controls after the core runtime is trusted:

1. More provider adapters and provider capability metadata.
2. Stable transform plugin API.
3. Richer policy scoring and tenant/project profiles.
4. Optional speech output and realtime-adjacent voice packaging.
5. Production observability exports.
6. Deeper MCP client support.
7. Stronger eval, fixture, and regression testing harnesses.

## Table Stakes

Features developers already expect from a modern AI SDK/runtime. Missing these makes Lattice feel incomplete.

| Feature | v0.1 Scope | v1 Scope | Why Expected | Complexity | Dependencies | Requirement Shape |
|---------|------------|----------|--------------|------------|--------------|-------------------|
| Tiny TypeScript API | `createAI`, `session`, `run`, `artifact`, `branch`, `replay`; typed config and result types. | Stabilize public API and semver contracts. | Vercel AI SDK and TanStack AI set the expectation that AI app SDKs are idiomatic TypeScript with small entry points. | Medium | Runtime core, artifact model, provider adapter interface. | Public package exports a minimal stable API with full TS inference. |
| Provider abstraction | Support OpenAI plus one or two additional providers through a common internal adapter contract. | Add more providers through metadata-backed adapters or a routing/provider surface. | Provider switching is core in Vercel AI SDK, TanStack AI, and LiteLLM. | Medium | Capability matrix, packaging layer, credentials config. | Developers can run the same Lattice task across supported providers without changing task code. |
| Capability matrix | Static metadata for model/provider capabilities: text, image input, PDF/file input, structured output, tools, audio transcription, speech, context window, pricing hints. | Versioned, externally updateable matrix with provider-specific limits and warnings. | Routing and packaging are impossible without current capability knowledge. | High | Provider abstraction, policy router. | Runtime can reject, route, or fallback based on declared capability support. |
| Text generation | Basic non-streaming text result. | Rich model options and provider-specific escape hatch. | Text output is still the universal base case. | Low | Provider abstraction. | `outputs: { text: true }` returns normalized text with usage metadata. |
| Streaming result events | Stream status, partial text, plan-stage updates, and final result. | Stream structured partials, artifact generation events, and observability spans. | Streaming is table stakes in AI SDKs and critical for user experience. | Medium | Execution engine, event protocol. | `run(...).stream()` or equivalent emits typed events. |
| Structured outputs | Zod or JSON Schema output contracts; validate and return typed JSON. | Multi-output contracts with partial streaming and repair hooks. | Structured output is a standard SDK feature, and app developers need reliable typed actions. | Medium | Output validator, provider adapter, retry/repair policy. | `outputs: { action: schema }` returns typed `result.outputs.action` or a validation failure. |
| Tool/function calling | Support local typed tools with schemas and tool results as artifacts. | Add approvals, tool execution policy, and richer tool lifecycle tracing. | Tool calling is expected in AI SDKs and agent runtimes. | Medium | Artifact model, output validation, execution plan. | Tools have typed inputs/outputs; results are preserved as artifacts and cited in plan. |
| MCP compatibility | Read tools/resources/prompts from MCP servers in a minimal client path or adapter boundary. | Full MCP client support with transport options, permissions, and tool approval hooks. | MCP is now the standard integration protocol for tools and context. | Medium | Tool abstraction, security policy, credential handling. | Lattice can expose MCP tools as eligible runtime tools without inventing a proprietary plugin protocol. |
| Multimodal artifact inputs | First-class text, image, audio, PDF/file, JSON, and tool-result artifact constructors. | Add video and generated media artifacts after packaging and cost controls mature. | Multimodal app SDKs increasingly support images, PDFs, audio, and files directly. | High | Artifact model, packaging layer, transforms, context packer. | Every input is an `Artifact` with ID, type, source, metadata, and traceable transforms. |
| Audio transcription | v0.1 should support audio as an input artifact via transcription transform, not full realtime voice. | Add provider-routed transcription choices and optional speech-to-speech/realtime bridges. | Work-inbox use cases need voice notes and call recordings. | Medium | Artifact transforms, provider routing, cost metadata. | Audio artifacts can be converted to transcript artifacts and included in context packs. |
| PDF/file handling | Accept PDF/file artifacts; extract text and optionally split into chunks for context packing. | Provider-native file upload when beneficial; richer document layout/OCR adapters. | PDFs and files are common in support, insurance, recruiting, and operations workflows. | High | Artifact transforms, provider packaging, context packer. | Runtime chooses extracted text, uploaded file handle, or chunked representation based on route. |
| Provider packaging | Normalize provider transport forms: message parts, URL, base64, upload ID, file ID, extracted text, resized image, transcript. | Add provider-specific optimizers and durable provider file-handle cache. | Provider multimodal APIs differ in file and media transport. This is a major developer pain. | High | Capability matrix, artifact model, transforms. | Plan records exactly which artifact representation was sent to which provider. |
| Context management | Automatic context pack with live messages, compressed summary, selected artifacts, and archived raw references. | Configurable context strategies, custom summarizers, and persistent session stores. | LangChain identifies context engineering as central to reliability; developers expect help managing history and files. | High | Artifact store, token estimator, summarizer, execution plan. | Runtime builds a bounded context pack and explains included/excluded artifacts. |
| Sessions | In-memory session with turns, artifacts, summary, plan history, and branch points. | Durable storage adapters and tenant/project scoped session policy. | Agent SDKs and assistant APIs treat session/history management as a baseline convenience. | Medium | Artifact store, context packer. | `session()` returns an object that can run tasks and preserve context across runs. |
| Deterministic routing | Capability-filtered route selection using policy: budget, latency, privacy, quality tier, provider allow/deny, fallback list. | More scoring dimensions, historical latency/cost data, and route profiles. | LiteLLM and gateway products normalize routing, fallbacks, budgets, and load balancing. | High | Capability matrix, policy model, provider adapters. | Same inputs and policy produce the same selected route unless capability metadata changes. |
| Fallbacks/retries/timeouts | Explicit retry and fallback rules for provider failures, context overflow, rate limit, validation failure, and unsupported artifact transport. | Adaptive fallbacks with health checks and richer failure taxonomies. | Reliable production AI apps need fallback and retry behavior. | Medium | Routing, execution engine, plan model. | Failures are typed; fallback attempts are visible in the execution plan. |
| Cost, token, and latency metadata | Estimate before run where possible; record actual usage where provider exposes it. | Budget enforcement across sessions and user/project labels. | Cost and latency are core operational concerns in routing products. | Medium | Provider adapters, plan model, usage normalizer. | Result includes `usage`, `costEstimate`, `latencyMs`, and provider/model attribution. |
| Inspectable execution plan | Preflight and post-run plan with stages, chosen model, eligible alternatives, context budget, artifacts used, transforms, fallback attempts, usage, and warnings. | Export traces to OpenTelemetry/Langfuse/LangSmith-style systems. | OpenAI Agents SDK and TanStack AI emphasize tracing/devtools; Lattice needs this as a core differentiator. | High | Every runtime subsystem. | Every `run` returns a plan object suitable for logs, debugging, and tests. |
| Replay | Re-run from saved task, policy, artifacts, context pack, route, and optionally mocked provider response. | Deterministic fixture mode for CI and regression tests. | Debugging AI runs requires reconstructing inputs and routing decisions. | High | Artifact store, plan serialization, provider mocks. | `replay(planId)` or `replay(plan)` can reproduce or simulate the prior run. |
| Branching | Branch session state from a previous plan or turn. | Branch comparison utilities and eval batches. | Developers need to test alternate prompts, policies, routes, or artifact packs. | Medium | Session store, plan model. | `branch(planId)` creates an isolated session continuation. |
| Error model | Typed errors for validation, unsupported capability, package failure, provider failure, fallback exhaustion, policy denial, and artifact transform failure. | Error recovery hooks and provider-specific diagnostics. | Provider APIs fail differently; SDK users need normalized failure semantics. | Medium | Provider adapters, routing, transform pipeline. | Errors are catchable by stable discriminated union or class hierarchy. |
| Progressive overrides | Force provider/model, custom summarizer, custom transform, hooks, and policy override. | Project profiles and reusable route presets. | Advanced users need control without making the beginner API complex. | Medium | Router, transforms, context packer, hooks. | Overrides live under an advanced option object, not the top-level happy path. |
| Local development examples | One polished work-inbox example with screenshots/photos, audio, PDFs, text, structured action, and optional spoken response stub. | More examples by vertical: support, field ops, recruiting, healthcare admin. | SDKs win through working examples. | Medium | All v0.1 runtime pieces. | Example doubles as integration test and product demonstration. |

## Differentiators

Features that make Lattice meaningfully different from a provider wrapper, gateway, or agent framework.

| Feature | v0.1 Scope | v1 Scope | Value Proposition | Complexity | Dependencies | Requirement Shape |
|---------|------------|----------|-------------------|------------|--------------|-------------------|
| Capability-first `run` contract | Developer declares job, artifacts, outputs, and policy instead of choosing a model API. | Add reusable task templates and output bundles. | Moves the mental model from "call provider X" to "perform capability Y under constraints." | High | Tiny API, outputs, artifacts, policy router. | `run({ task, artifacts, outputs, policy })` is the central product surface. |
| Artifact-native runtime | All inputs, outputs, transforms, files, media, tool results, summaries, and generated objects are artifacts with IDs and lineage. | Artifact persistence, dedupe, provider handle cache, and export/import. | Gives multimodal apps a durable content model instead of passing raw blobs through ad hoc messages. | High | Artifact store, transform pipeline, plan model. | Artifacts carry type, metadata, provenance, privacy label, hashes where practical, and references to derived artifacts. |
| Context-native execution | Runtime automatically decides what goes into each model call: raw artifact, transformed artifact, summary, citation, or omission. | Pluggable context strategies and long-running context compaction. | Addresses the biggest reliability gap in multimodal applications: "right context, right format, right budget." | High | Artifact model, token estimation, summarization, provider packaging. | Plan includes a context packing section with token budget, included items, excluded items, and reasons. |
| Artifact transport planner | Lattice chooses URL vs base64 vs provider upload vs extracted/chunked content vs resized/transcoded derivative. | Add provider-upload cache and transform cost optimization. | This is painful, provider-specific work that generic SDKs expose to the developer. | High | Capability matrix, transforms, provider adapters. | Packaging stage produces provider-ready payload plus traceable transform lineage. |
| Deterministic policy router | Route from capability support and policy scoring, not opaque LLM self-selection. | Add health and historical performance signals while preserving explainability. | Builds trust and makes routing testable. | High | Capability matrix, policy scoring, fallbacks, usage metadata. | Plan shows candidate models, disqualification reasons, selected route, and fallback rules. |
| Plan-first observability | The execution plan is not an add-on trace; it is a first-class result object and replay input. | Export plan as OpenTelemetry spans or integration-specific traces. | Differentiates from toolkits where debug data is spread across callbacks, logs, and provider responses. | High | Execution engine, plan schema, replay. | Every stage records inputs, outputs, decisions, costs, warnings, and errors. |
| Replayable AI runs | A saved run can be replayed with original artifacts, context pack, policy, and route. | CI fixture mode, comparison runs, and regression snapshots. | Solves "what did the model actually see and why did this route happen?" | High | Plan-first observability, artifact store, deterministic router. | Replay supports exact-context replay and mocked-provider replay. |
| Multi-output result contract | One run can request text, structured action JSON, citations/artifact refs, and optional speech artifact. | Add image/video outputs and output dependency planning. | Work-inbox tasks naturally produce both human-readable and machine-actionable results. | Medium | Structured outputs, artifact model, provider capability matrix. | Result returns typed `outputs` plus generated artifacts and references. |
| Privacy-aware artifact policy | Artifacts and sessions can carry policy labels: local-only, no-upload, no-logging, allowed providers, retention class. | Add policy profiles, audit exports, and redaction transforms. | Multimodal artifacts often contain sensitive customer, health, legal, or operational data. | High | Artifact metadata, router, packaging layer, plan warnings. | Router and packaging layer must deny routes that violate artifact policy. |
| Context archive model | Keep live context small, compressed summary current, and raw artifacts archived by reference. | Durable raw archive and selective rehydration APIs. | Prevents unbounded chat histories and repeated file stuffing while retaining traceability. | Medium | Session state, artifact store, summarizer. | Session tracks `live`, `summary`, and `archive` zones. |
| Capability-aware preflight | Before execution, tell the developer if requested artifacts/outputs/policy can be satisfied and what route will be used. | Add dry-run pricing and quality/cost tradeoff explanation. | Reduces runtime surprises and supports interactive product UIs. | Medium | Capability matrix, router, packaging planner. | `run({ dryRun: true })` or `plan()` returns route and warnings without provider execution. |
| Work-inbox reference app | Showcase multimodal inputs producing answer text, structured action, and optional speech. | Convert into templates and vertical starter kits. | Demonstrates the entire thesis in one concrete workflow. | Medium | Core v0.1 features. | Example is maintained as an executable integration scenario. |

## Anti-Features

Features to deliberately avoid in v0.1 because they bloat the product, duplicate mature ecosystems, or confuse the core thesis.

| Anti-Feature | Avoid in v0.1 Because | What to Do Instead | Reconsider When |
|--------------|-----------------------|--------------------|-----------------|
| Hosted control plane | Adds auth, tenancy, billing, dashboards, uptime, and compliance before proving the SDK. | Local/runtime-only package with serializable plans and logs. | Developers repeatedly need shared team observability or managed artifact storage. |
| Visual graph/DAG DSL | Competes with LangGraph-style orchestration and makes the simple path feel heavy. | Native TypeScript functions plus capability-first `run`. | Complex workflows need explicit multi-stage composition beyond normal code. |
| Multi-agent handoff framework | OpenAI Agents SDK and LangGraph already cover this. It distracts from artifact/context/routing. | Support tools and simple staged execution internally, but do not market agents as the center. | v1 users ask for delegation after core runtime adoption. |
| Broad provider catalog | Building 100 adapters slows learning and shifts differentiation to adapter maintenance. | Start with a few high-value providers and/or reuse existing provider surfaces where practical. | Runtime API stabilizes and provider metadata process is reliable. |
| UI hook/component library as product center | Vercel AI SDK UI and TanStack client hooks already cover UI ergonomics. | Provide a minimal example UI only to prove the work-inbox flow. | Runtime demand is validated and UI bindings become a clear adoption blocker. |
| Opaque AI router | Undermines trust, reproducibility, and cost/privacy policy enforcement. | Deterministic capability and policy scoring with explanations. | Only after deterministic routing is trusted; even then keep explainability. |
| Long-term memory/persona system | "Memory" can become vague product scope and introduces storage/privacy complexity. | Session context, summaries, archived artifacts, and explicit stores. | Customers need cross-session personalization with clear data policy. |
| Full RAG/vector database platform | Duplicates mature retrieval stacks and distracts from artifact/context packing. | Provide hooks for retrieved artifacts and simple PDF/text chunking. | Artifact search and retrieval become core to repeated use cases. |
| Full realtime voice agent stack | WebRTC, VAD, interruptions, telephony, tokens, and transport are a separate product surface. | Support audio input via transcription and optional speech output artifact. | Work-inbox adoption proves demand for live voice. |
| Built-in code interpreter/computer use | High-risk, provider-specific, security-heavy, and not required for the first work-inbox wedge. | Treat as external tools/MCP integrations. | Users need sandboxed computation with strong security requirements. |
| Prompt playground/eval platform | Useful but too much surface area for v0.1. | Add replay, fixtures, and plan snapshots first. | CI regression needs dominate support requests. |
| Provider-specific option sprawl | Exposes the exact complexity Lattice is meant to hide. | Keep provider-specific escape hatches under progressive overrides. | A capability cannot be expressed portably and advanced users need it. |
| Custom plugin protocol | MCP already provides tools, resources, prompts, transports, and SDKs. | Be MCP-compatible. | Only add private extension points for Lattice internals, not external ecosystem integrations. |

## Feature Dependencies

These dependencies should drive requirements ordering.

```text
Tiny API -> Artifact model -> Provider packaging -> Capability-first run
Provider abstraction -> Capability matrix -> Deterministic router -> Fallbacks
Artifact model -> Transform pipeline -> Context packer -> Execution plan
Context packer -> Provider packaging -> Model execution
Structured outputs -> Output validation -> Retry/repair policy
Tool abstraction -> Tool result artifacts -> Plan traceability
MCP compatibility -> Tool abstraction -> Policy and approval hooks
Session state -> Context archive model -> Branch and replay
Execution plan -> Replay -> CI fixtures
Usage metadata -> Cost/budget policy -> Route scoring
Privacy labels -> Router eligibility -> Packaging denial/warnings
Work-inbox example -> Integration tests -> v0.1 validation
```

## MVP Recommendation

Prioritize for v0.1:

1. Tiny TypeScript API: `createAI`, `session`, `run`, `artifact`, `branch`, `replay`.
2. Artifact model with text, image, audio, PDF/file, JSON, and tool-result artifacts.
3. Context packer with live context, summary, selected artifacts, archived raw references, and token budget explanation.
4. Provider abstraction with a small adapter set and a real capability matrix.
5. Deterministic policy router with provider/model allowlists, budget, latency, privacy, and fallback rules.
6. Provider packaging for URL/base64/upload/extracted text/chunked PDF/transcript/image resize paths.
7. Text and structured JSON outputs with schema validation.
8. Typed local tools and tool-result artifacts.
9. Inspectable execution plan and replay.
10. Work-inbox showcase as the proof scenario.

Defer to v1:

1. Durable stores for sessions/artifacts.
2. Full MCP client permissions and approvals.
3. Speech output and realtime-adjacent voice.
4. OpenTelemetry and third-party observability exports.
5. Broader provider catalog.
6. CI eval harness built on replay fixtures.
7. Rich media generation beyond optional speech.

Do not build before v1:

1. Hosted control plane.
2. Visual graph DSL.
3. Multi-agent handoffs as a product category.
4. Vector database/RAG platform.
5. Full realtime voice stack.
6. Proprietary plugin ecosystem.

## Complexity Notes by Phase

| Phase Topic | Complexity | Main Risk | Mitigation |
|-------------|------------|-----------|------------|
| Public API design | Medium | API becomes another provider wrapper. | Keep `run` centered on task, artifacts, outputs, and policy. |
| Artifact model | High | Metadata too weak for packaging/replay/privacy. | Define artifact schema before provider adapters. |
| Provider packaging | High | Provider transport differences leak through API. | Treat packaging as an explicit stage in the plan. |
| Capability routing | High | Stale provider/model metadata causes bad routes. | Start narrow, version matrix, expose warnings. |
| Context management | High | Summaries omit key details or costs balloon. | Make included/excluded context inspectable; allow custom summarizer. |
| Replay | High | Impossible without full artifact and plan capture. | Design plan serialization from day one. |
| Work-inbox example | Medium | Demo hides runtime gaps. | Maintain as integration test with representative artifacts. |
| MCP support | Medium | Permissions and tool approval become too broad. | Start with minimal tool import/call path and explicit policy. |

## Open Questions

1. Should v0.1 reuse Vercel AI SDK provider adapters directly, integrate with LiteLLM/OpenRouter-style gateways, or own a very small adapter layer first? Recommendation: own a small internal adapter contract and optionally wrap existing provider SDKs; do not bind the product identity to a gateway.
2. How durable should artifacts be in v0.1? Recommendation: in-memory plus filesystem/test fixture persistence is enough if plan serialization is solid.
3. Should audio in v0.1 use provider-native multimodal audio or transcription-first? Recommendation: transcription-first for reliability and simpler context packing.
4. How much automatic summarization is acceptable before users see it as unsafe? Recommendation: summaries must be explicit artifacts with lineage and overridable summarizer hooks.
5. What is the minimum provider set? Recommendation: OpenAI, Anthropic, and Gemini cover enough multimodal/structured/tool variation to validate the abstractions.

## Source Confidence

| Finding | Confidence | Evidence |
|---------|------------|----------|
| Provider abstraction, streaming, structured outputs, tool calling, and multimodal inputs are table stakes. | HIGH | Vercel AI SDK docs show unified providers, Core for text/structured/tools/agents, provider capability matrix, multimodal guide, and structured output docs. |
| Type-safe provider-agnostic SDKs and devtools are an active TypeScript ecosystem direction. | MEDIUM | TanStack AI official docs are current but marked alpha; use as ecosystem signal, not stable API evidence. |
| Routing, fallback, retries, load balancing, budgets, and modality-specific endpoints are expected in AI gateways. | HIGH | LiteLLM official docs cover routing strategies, cooldowns, fallbacks, cost tracking, image generation, transcription, MCP bridge, and supported endpoints. |
| Tracing, sessions, MCP tools, guardrails, and realtime voice are standard agent-runtime capabilities. | HIGH | OpenAI Agents SDK official docs list built-in tracing, sessions, MCP tool calling, guardrails, human-in-loop, and realtime voice features. |
| Context management is a major reliability concern and should be first-class. | HIGH | LangChain context engineering docs explicitly frame right context and lifecycle context as core agent reliability work. |
| MCP should be used instead of a proprietary plugin protocol. | HIGH | MCP TypeScript SDK docs define tools, resources, prompts, transports, sampling, elicitation, and tasks as standardized context/tool integration surfaces. |
| Lattice's strongest differentiation is artifact-native/context-native deterministic execution with replayable plans. | MEDIUM-HIGH | This is an inference from gaps across adjacent products plus the project thesis; validate through v0.1 work-inbox usage. |

## Sources

- Vercel AI SDK introduction: https://ai-sdk.dev/docs/introduction
- Vercel AI SDK provider management: https://ai-sdk.dev/docs/ai-sdk-core/provider-management
- Vercel AI SDK multimodal guide: https://ai-sdk.dev/cookbook/guides/multi-modal-chatbot
- Vercel AI SDK structured data: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data
- Vercel AI SDK agents overview: https://ai-sdk.dev/docs/agents/overview
- TanStack AI overview: https://tanstack.com/ai/latest
- TanStack AI realtime voice blog: https://tanstack.com/blog/tanstack-ai-realtime-voice-chat
- LiteLLM routing docs: https://docs.litellm.ai/docs/routing
- LiteLLM image generation docs: https://docs.litellm.ai/docs/image_generation
- LiteLLM audio transcription docs: https://docs.litellm.ai/docs/audio_transcription
- LiteLLM MCP docs: https://docs.litellm.ai/docs/mcp
- OpenAI Agents SDK TypeScript overview: https://openai.github.io/openai-agents-js/
- OpenAI Agents SDK tracing: https://openai.github.io/openai-agents-js/guides/tracing/
- OpenAI Agents SDK voice agents: https://openai.github.io/openai-agents-js/guides/voice-agents/
- OpenAI Responses API reference: https://platform.openai.com/docs/api-reference/responses
- OpenAI Responses API tools/features announcement: https://openai.com/index/new-tools-and-features-in-the-responses-api/
- OpenAI Assistants API v2 FAQ: https://help.openai.com/en/articles/8550641-assistants-api-v2-faq
- MCP TypeScript SDK: https://ts.sdk.modelcontextprotocol.io/
- LangChain context engineering: https://docs.langchain.com/oss/javascript/langchain/context-engineering
