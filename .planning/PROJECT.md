# Lattice

## What This Is

Lattice is a TypeScript-first capability runtime SDK for AI applications. Developers describe the job, provide any mix of artifacts, declare desired outputs, and set policy constraints; Lattice handles provider routing, context packing, artifact transport, fallback, replay, and inspectable execution plans.

The product is for developers building multimodal AI features who do not want to wire together separate chat, image, transcription, speech, file, memory, routing, and provider abstractions by hand.

## Core Value

Developers can run one capability-first task across mixed text, image, audio, video, file, JSON, and tool artifacts while Lattice reliably chooses, packages, routes, and explains the underlying model work.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Provide a tiny public TypeScript API centered on `createAI`, `session`, `run`, `artifact`, `branch`, `replay`, and execution plans.
- [ ] Model all inputs, outputs, files, media, and tool results as first-class `Artifact`s with reusable references.
- [ ] Let developers express tasks in terms of requested outputs and policy constraints rather than hardcoded provider/model calls.
- [ ] Implement automatic context management with live context, compressed summary, and archived raw artifacts.
- [ ] Build provider packaging that handles URL, base64, upload ID, resized/transcoded media, chunked PDFs, and provider-specific message formats.
- [ ] Route deterministically from capability matrix, policy scoring, budget, latency, privacy, and fallback rules.
- [ ] Expose an inspectable execution plan showing stages, selected models, context budget, fallbacks, artifacts used, cost, and latency tradeoffs.
- [ ] Support a first showcase use case: a multimodal work inbox that accepts user text, screenshots/photos, voice/call recordings, and PDFs, then returns text, structured JSON action, and optional speech.
- [ ] Keep advanced controls available through progressive disclosure: force model/provider, custom summarizer, artifact transforms, hooks, and routing policy overrides.

### Out of Scope

- Hosted control plane — the first version should prove the runtime SDK before adding hosted infrastructure.
- Graph DSL — the v0.1 product should feel smaller than orchestration frameworks and avoid making users design graphs first.
- Multi-agent handoff framework — agent orchestration is not the initial differentiator.
- Building 100 custom provider adapters from scratch — broad provider coverage should initially lean on an existing provider/routing surface where practical.
- Frontend hook library as the center of the product — UI bindings can exist, but the core bet is the runtime.
- Opaque AI-selected routing in v1 — routing should be deterministic and inspectable first.

## Context

As of April 2026, comparable tools each cover part of the desired surface:

- Vercel AI SDK offers a broad provider-agnostic TypeScript toolkit with provider/model management, multimodal generation, agents, subagents, and memory approaches, but it remains a toolkit with multiple explicit surfaces.
- TanStack AI is philosophically close on the TypeScript side, emphasizing a lightweight core, runtime adapter switching, multimodal content, generation hooks, and realtime voice.
- LiteLLM is strong routing infrastructure with a common interface across many providers plus fallback, context-window fallback, image generation, transcription, speech, and MCP gateway capabilities.
- LangChain/LangGraph and OpenAI Agents SDK are strong on context, orchestration, sessions, compaction, tracing, and voice, but they do not provide the tiny universal capability runtime described here.

The missing category is a capability-first runtime SDK rather than another provider wrapper. The developer should provide the task, artifacts, outputs, budget, privacy, latency, and quality constraints; Lattice should build a context pack, prepare artifacts for the chosen providers, execute one or more model stages, handle fallbacks, and return a structured result plus an inspectable plan.

The wedge is the multimodal work inbox: support, insurance, logistics, field operations, healthcare administration, recruiting, and creator tools all need to process combinations of user messages, screenshots/photos, voice notes/call recordings, and PDFs/manuals/policies into answers, structured actions, and sometimes speech.

## Constraints

- **Language**: TypeScript-first — closest competitors and early adopters are strongest in the app/product integration ecosystem.
- **Public API**: Capability-first and small — the beginner path should be one `run` call with artifacts, outputs, and policy.
- **Routing**: Deterministic in v0.1 — use capability matrix plus policy scoring and fallback rules before considering opaque AI-chosen routing.
- **Provider surface**: Reuse existing routing/provider infrastructure where it accelerates learning — provider breadth is not the main differentiation.
- **Protocol**: MCP-native where tools/context integration is needed — avoid inventing a proprietary plugin protocol.
- **Architecture**: One umbrella package with modular internals — easy install should coexist with tree-shakable adapters and optional bindings.
- **Transparency**: Every run must be inspectable — model choices, context packing, summaries, artifact transforms, cost, and latency must be explainable.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build Lattice as a capability-first runtime SDK | The missing product is a layer above provider adapters and media APIs, not another wrapper around one model API. | — Pending |
| Start TypeScript-first | The strongest adjacent products and app integration pain are in the TypeScript ecosystem. | — Pending |
| Use a deterministic router for v0.1 | Inspectability and trust matter more than magical but opaque routing early. | — Pending |
| Make artifacts the universal content model | Text, image, audio, video, PDF, JSON, and tool results need the same lifecycle: reference, transform, package, reuse, trace. | — Pending |
| Treat context management as built-in runtime behavior | Manual trimming, summarizer middleware, and developer-managed file stuffing are core pain points this product should remove. | — Pending |
| Focus the first showcase on the multimodal work inbox | It exercises text, image, audio, files, structured outputs, policy routing, artifact packaging, and optional speech in one understandable workflow. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after initialization*
