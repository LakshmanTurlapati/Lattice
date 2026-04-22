# Phase 3: Deterministic Planning & Execution Spine - Context

**Gathered:** 2026-04-22
**Status:** Ready for planning
**Mode:** Autonomous defaults

<domain>
## Phase Boundary

Deliver provider-independent dry-run planning, deterministic route selection, fallback/no-route behavior, stable execution plan JSON, typed run events, and fake-provider execution for tests and fixtures.
</domain>

<decisions>
## Implementation Decisions

### Routing And Plans
- Use deterministic capability catalog filtering and scoring, not AI-selected routing.
- Preserve the beginner `ai.run(...)` path while adding `ai.plan(...)`.
- Treat no-route as a typed plan/result outcome rather than a silent downgrade.
- Keep plan JSON inspectable and stable with stages, route candidates, warnings, estimates, attempts, and artifact refs.

### Execution
- Use provider-independent stage execution around existing `ProviderAdapter.execute`.
- Emit typed events for lifecycle, routing, provider attempts, validation, and completion.
- Add `createFakeProvider` for deterministic tests and offline showcase behavior.
- Keep provider SDK details out of public run intent types.

### the agent's Discretion
Implementation details are selected to fit existing TypeScript modules and tests.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `createAI`, `ProviderAdapter`, `PolicySpec`, artifact refs, and output validation already exist.

### Established Patterns
- Named exports only, strict TypeScript, Vitest runtime tests, and tsd package tests.

### Integration Points
- Runtime planning connects `runtime/create-ai.ts`, `plan/plan.ts`, `providers/provider.ts`, `routing/*`, and `tracing/tracing.ts`.
</code_context>

<specifics>
## Specific Ideas

No extra user overrides; use roadmap success criteria as the source of truth.
</specifics>

<deferred>
## Deferred Ideas

None for this phase.
</deferred>
