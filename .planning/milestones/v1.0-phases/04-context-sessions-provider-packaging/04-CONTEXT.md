# Phase 4: Context, Sessions & Provider Packaging - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning
**Mode:** Autonomous defaults

<domain>
## Phase Boundary

Deliver explicit session records, context packs, progressive overrides, narrow provider adapter factories, and policy-safe artifact packaging records.
</domain>

<decisions>
## Implementation Decisions

### Sessions And Context
- Add memory session storage with turns, artifacts, summaries, plan IDs, parent IDs, and branch points.
- Keep session state separate from run state, context pack state, provider attempt state, artifact storage, and execution plan state.
- Context packing records included, summarized, archived, and omitted items with reasons and trust labels.

### Providers And Packaging
- Keep OpenAI, AI SDK, and OpenAI-compatible support as narrow adapter factories without hard SDK dependencies.
- Package artifacts into transport decisions and provider-packaging lineage refs before provider calls.
- Block packaging choices that violate privacy labels and policy constraints.

### the agent's Discretion
Use lightweight implementations suitable for v0.1 and defer native SDK-specific coverage to later adapters.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Artifact refs, lineage, storage, policy, routing, and execution plans from earlier phases.

### Established Patterns
- Adapter contracts are Lattice-owned and provider SDK types do not leak to public API.

### Integration Points
- `sessions/session.ts`, `context/context-pack.ts`, `providers/packaging.ts`, `providers/adapters.ts`, and runtime config.
</code_context>

<specifics>
## Specific Ideas

No extra user requirements.
</specifics>

<deferred>
## Deferred Ideas

Full native SDK conformance harness and real upload APIs remain future adapter work.
</deferred>
