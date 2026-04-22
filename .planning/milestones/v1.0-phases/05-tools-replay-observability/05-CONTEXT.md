# Phase 5: Tools, Replay & Observability - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning
**Mode:** Autonomous defaults

<domain>
## Phase Boundary

Deliver local/MCP-like tool definitions, artifact-backed tool outputs, replay envelopes, offline/live replay helpers, default redaction, and OpenTelemetry-compatible structured event hooks.
</domain>

<decisions>
## Implementation Decisions

### Tools
- Define local tools with Standard Schema input validation.
- Represent tool outputs as `artifact.toolResult(...)`.
- Support explicit MCP-like tool import through a narrow client interface without adding MCP SDK as a core dependency.

### Replay And Observability
- Replay envelopes store runtime/catalog versions, redacted plans, artifacts, outputs, warnings, errors, usage, and events.
- Offline replay returns recorded successful outputs without provider calls.
- Live rerun emits explicit warnings about provider/model/cost/latency drift.
- Default redaction removes signed URLs, credentials, transcripts, provider bodies, and sensitive metadata keys.

### the agent's Discretion
Keep OTel-compatible structured events lightweight until exporter adapters are needed.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Artifact refs, execution plans, run events, and output validation.

### Established Patterns
- Public APIs are named exports and dependency-light.

### Integration Points
- `tools/tools.ts`, `replay/replay.ts`, `tracing/tracing.ts`, and runtime result events.
</code_context>

<specifics>
## Specific Ideas

No extra user requirements.
</specifics>

<deferred>
## Deferred Ideas

Full MCP SDK transport and external observability exporters are future adapter work.
</deferred>
