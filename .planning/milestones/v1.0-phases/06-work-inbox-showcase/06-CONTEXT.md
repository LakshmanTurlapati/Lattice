# Phase 6: Work Inbox Showcase - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning
**Mode:** Autonomous defaults

<domain>
## Phase Boundary

Deliver an executable multimodal work-inbox example that uses only the public Lattice API, includes adversarial fixtures, exposes plan inspection, and demonstrates offline replay.
</domain>

<decisions>
## Implementation Decisions

### Showcase
- Implement as a Node `.mjs` example runnable after building the package.
- Use `createFakeProvider` so the example is deterministic and does not require external credentials.
- Accept text, image/photo fixture, audio transcript fixture, and PDF/policy fixture artifacts.
- Return text, structured action, citations, and generated artifact refs.

### Fixtures
- Include dense policy, visual evidence, privacy-constrained, fallback/no-route, and replay-oriented fixture data.

### the agent's Discretion
Keep the example non-UI and focused on public SDK ergonomics.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Public `artifact`, `createAI`, `createFakeProvider`, output contracts, sessions, replay helpers, and plan inspection.

### Established Patterns
- Examples should run without live provider credentials.

### Integration Points
- `examples/work-inbox/index.mjs`, fixture files, and root `example:work-inbox` script.
</code_context>

<specifics>
## Specific Ideas

No extra user requirements.
</specifics>

<deferred>
## Deferred Ideas

A frontend showcase and real provider-backed media processing are future work.
</deferred>
